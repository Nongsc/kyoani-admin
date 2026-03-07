'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import type { Article, ArticleFormData, Category, Tag } from '@/types/blog';

// Get all articles
export async function getArticles(): Promise<Article[]> {
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from('articles')
    .select(`
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
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching articles:', error);
    return [];
  }

  return data || [];
}

// Get article by ID
export async function getArticleById(id: string): Promise<Article | null> {
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from('articles')
    .select(`
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
    `)
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
    .select(`
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
    `)
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching article:', error);
    return null;
  }

  return data;
}

// Create article
export async function createArticle(formData: ArticleFormData): Promise<{ success: boolean; error?: string; data?: Article }> {
  const session = await auth();
  if (!session) {
    return { success: false, error: '未授权' };
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

  const { data, error } = await supabase
    .from('articles')
    .insert({
      title: formData.title,
      slug: formData.slug,
      content: formData.content,
      excerpt: formData.excerpt || null,
      cover_image: formData.cover_image || null,
      category_id: formData.category_id || null,
      author_id: session.user?.id || null,
      status: formData.status,
      published_at: formData.status === 'published' ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating article:', error);
    return { success: false, error: '创建文章失败' };
  }

  // Insert article tags
  if (formData.tags.length > 0) {
    const tagInserts = formData.tags.map(tagId => ({
      article_id: data.id,
      tag_id: tagId,
    }));

    await supabase.from('article_tags').insert(tagInserts);
  }

  revalidatePath('/dashboard/articles');
  return { success: true, data };
}

// Update article
export async function updateArticle(id: string, formData: ArticleFormData): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session) {
    return { success: false, error: '未授权' };
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

  const { error } = await supabase
    .from('articles')
    .update({
      title: formData.title,
      slug: formData.slug,
      content: formData.content,
      excerpt: formData.excerpt || null,
      cover_image: formData.cover_image || null,
      category_id: formData.category_id || null,
      status: formData.status,
      published_at: formData.status === 'published' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating article:', error);
    return { success: false, error: '更新文章失败' };
  }

  // Update article tags
  await supabase.from('article_tags').delete().eq('article_id', id);
  
  if (formData.tags.length > 0) {
    const tagInserts = formData.tags.map(tagId => ({
      article_id: id,
      tag_id: tagId,
    }));

    await supabase.from('article_tags').insert(tagInserts);
  }

  revalidatePath('/dashboard/articles');
  return { success: true };
}

// Delete article
export async function deleteArticle(id: string): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session) {
    return { success: false, error: '未授权' };
  }

  const supabase = createAdminClient();
  
  // Delete article tags first
  await supabase.from('article_tags').delete().eq('article_id', id);
  
  const { error } = await supabase
    .from('articles')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting article:', error);
    return { success: false, error: '删除文章失败' };
  }

  revalidatePath('/dashboard/articles');
  return { success: true };
}

// Toggle article status
export async function toggleArticleStatus(id: string): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session) {
    return { success: false, error: '未授权' };
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
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    console.error('Error toggling article status:', error);
    return { success: false, error: '更新状态失败' };
  }

  revalidatePath('/dashboard/articles');
  return { success: true };
}

// Get all categories
export async function getCategories(): Promise<Category[]> {
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return data || [];
}

// Get all tags
export async function getTags(): Promise<Tag[]> {
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching tags:', error);
    return [];
  }

  return data || [];
}
