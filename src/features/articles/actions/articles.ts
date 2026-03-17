'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { auth } from '@/lib/auth';
import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache';
import type {
  Article,
  ArticleListItem,
  CategoryListItem,
  TagListItem
} from '@/types/blog';
import {
  validateArticleFormData,
  sanitizeInput,
  isValidUUID
} from '@/lib/validation';
import type { ArticleFormData } from '@/lib/validation';

// 优化的文章查询：只选择列表页需要的字段
const getArticlesQuery = async (): Promise<ArticleListItem[]> => {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('articles')
    .select(
      `
      id,
      title,
      slug,
      status,
      created_at,
      categories (
        id,
        name
      ),
      article_tags (
        tag_id,
        tags (
          id,
          name
        )
      )
    `
    )
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching articles:', error);
    return [];
  }

  // 类型转换：Supabase 返回的 categories 是单个对象或 null
  return (data || []).map((item) => ({
    ...item,
    categories: Array.isArray(item.categories)
      ? item.categories[0]
      : item.categories
  })) as ArticleListItem[];
};

// 缓存文章列表（30秒）
export const getArticles = unstable_cache(getArticlesQuery, ['articles-list'], {
  revalidate: 30,
  tags: ['articles']
});

// Get article by ID
export async function getArticleById(id: string): Promise<Article | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('articles')
    .select(
      `
      *,
      categories (
        id,
        name,
        slug
      ),
      article_tags (
        tag_id,
        tags (
          id,
          name,
          slug
        )
      )
    `
    )
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching article:', error);
    return null;
  }

  return data;
}

// Get article by slug
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('articles')
    .select(
      `
      *,
      categories (
        id,
        name,
        slug
      ),
      article_tags (
        tag_id,
        tags (
          id,
          name,
          slug
        )
      )
    `
    )
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching article:', error);
    return null;
  }

  return data;
}

// Create article
export async function createArticle(
  formData: ArticleFormData
): Promise<{ success: boolean; error?: string; data?: Article }> {
  const session = await auth();
  if (!session) {
    return { success: false, error: '未授权' };
  }

  // 验证表单数据
  const validation = validateArticleFormData(formData);
  if (!validation.valid) {
    const firstError = Object.values(validation.errors)[0];
    return { success: false, error: firstError };
  }

  const supabase = createAdminClient();

  // Check if slug exists
  const { data: existing } = await supabase
    .from('articles')
    .select('id')
    .eq('slug', formData.slug)
    .single();

  if (existing) {
    return { success: false, error: 'Slug 已存在，请使用其他名称' };
  }

  // 净化输入
  const sanitizedTitle = sanitizeInput(formData.title);
  const sanitizedExcerpt = formData.excerpt
    ? sanitizeInput(formData.excerpt)
    : null;

  const { data, error } = await supabase
    .from('articles')
    .insert({
      title: sanitizedTitle,
      slug: formData.slug,
      content: formData.content,
      excerpt: sanitizedExcerpt,
      cover_image: formData.cover_image || null,
      category_id: formData.category_id || null,
      author_id: session.user?.id || null,
      status: formData.status,
      published_at:
        formData.status === 'published' ? new Date().toISOString() : null
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating article:', error);
    return { success: false, error: '创建文章失败' };
  }

  // Insert article tags
  if (formData.tags.length > 0) {
    const tagInserts = formData.tags.map((tagId) => ({
      article_id: data.id,
      tag_id: tagId
    }));

    await supabase.from('article_tags').insert(tagInserts);
  }

  revalidatePath('/dashboard/articles');
  // 同时清除缓存标签
  revalidateTag('articles', 'articles-list');
  return { success: true, data };
}

// Update article
export async function updateArticle(
  id: string,
  formData: ArticleFormData
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session) {
    return { success: false, error: '未授权' };
  }

  // 验证文章 ID
  if (!isValidUUID(id)) {
    return { success: false, error: '文章 ID 格式无效' };
  }

  // 验证表单数据
  const validation = validateArticleFormData(formData);
  if (!validation.valid) {
    const firstError = Object.values(validation.errors)[0];
    return { success: false, error: firstError };
  }

  const supabase = createAdminClient();

  // Check if slug exists for other articles
  const { data: existing } = await supabase
    .from('articles')
    .select('id')
    .eq('slug', formData.slug)
    .neq('id', id)
    .single();

  if (existing) {
    return { success: false, error: 'Slug 已存在，请使用其他名称' };
  }

  // 净化输入
  const sanitizedTitle = sanitizeInput(formData.title);
  const sanitizedExcerpt = formData.excerpt
    ? sanitizeInput(formData.excerpt)
    : null;

  const { error } = await supabase
    .from('articles')
    .update({
      title: sanitizedTitle,
      slug: formData.slug,
      content: formData.content,
      excerpt: sanitizedExcerpt,
      cover_image: formData.cover_image || null,
      category_id: formData.category_id || null,
      status: formData.status,
      published_at:
        formData.status === 'published' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating article:', error);
    return { success: false, error: '更新文章失败' };
  }

  // Update article tags
  await supabase.from('article_tags').delete().eq('article_id', id);

  if (formData.tags.length > 0) {
    const tagInserts = formData.tags.map((tagId) => ({
      article_id: id,
      tag_id: tagId
    }));

    await supabase.from('article_tags').insert(tagInserts);
  }

  revalidatePath('/dashboard/articles');
  revalidateTag('articles', 'articles-list');
  return { success: true };
}

// Delete article
export async function deleteArticle(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session) {
    return { success: false, error: '未授权' };
  }

  // 验证文章 ID
  if (!isValidUUID(id)) {
    return { success: false, error: '文章 ID 格式无效' };
  }

  const supabase = createAdminClient();

  // Delete article tags first
  await supabase.from('article_tags').delete().eq('article_id', id);

  const { error } = await supabase.from('articles').delete().eq('id', id);

  if (error) {
    console.error('Error deleting article:', error);
    return { success: false, error: '删除文章失败' };
  }

  revalidatePath('/dashboard/articles');
  revalidateTag('articles', 'articles-list');
  return { success: true };
}

// Toggle article status
export async function toggleArticleStatus(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session) {
    return { success: false, error: '未授权' };
  }

  // 验证文章 ID
  if (!isValidUUID(id)) {
    return { success: false, error: '文章 ID 格式无效' };
  }

  const supabase = createAdminClient();

  const { data: article } = await supabase
    .from('articles')
    .select('status')
    .eq('id', id)
    .single();

  if (!article) {
    return { success: false, error: '文章不存在' };
  }

  const newStatus = article.status === 'draft' ? 'published' : 'draft';

  const { error } = await supabase
    .from('articles')
    .update({
      status: newStatus,
      published_at: newStatus === 'published' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  if (error) {
    console.error('Error toggling article status:', error);
    return { success: false, error: '更新状态失败' };
  }

  revalidatePath('/dashboard/articles');
  revalidateTag('articles', 'articles-list');
  return { success: true };
}

// Get all categories - 缓存优化
export const getCategories = unstable_cache(
  async (): Promise<CategoryListItem[]> => {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }

    return data || [];
  },
  ['categories-list'],
  {
    revalidate: 60,
    tags: ['categories']
  }
);

// Get all tags - 缓存优化
export const getTags = unstable_cache(
  async (): Promise<TagListItem[]> => {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('tags')
      .select('id, name, slug')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching tags:', error);
      return [];
    }

    return data || [];
  },
  ['tags-list'],
  {
    revalidate: 60,
    tags: ['tags']
  }
);
