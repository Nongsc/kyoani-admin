'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import type { Tag } from '@/types/blog';
import {
  validateTagFormData,
  sanitizeInput,
  isValidUUID
} from '@/lib/validation';
import type { TagFormData } from '@/lib/validation';

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

// Create tag
export async function createTag(
  formData: TagFormData
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session) {
    return { success: false, error: '未授权' };
  }

  // 验证表单数据
  const validation = validateTagFormData(formData);
  if (!validation.valid) {
    const firstError = Object.values(validation.errors)[0];
    return { success: false, error: firstError };
  }

  const supabase = createAdminClient();

  // 检查 Slug 是否已存在
  const { data: existing } = await supabase
    .from('tags')
    .select('id')
    .eq('slug', formData.slug)
    .single();

  if (existing) {
    return { success: false, error: 'Slug 已存在，请使用其他名称' };
  }

  // 净化输入
  const sanitizedName = sanitizeInput(formData.name);

  const { error } = await supabase.from('tags').insert({
    name: sanitizedName,
    slug: formData.slug
  });

  if (error) {
    console.error('Error creating tag:', error);
    return { success: false, error: '创建标签失败' };
  }

  revalidatePath('/dashboard/tags');
  return { success: true };
}

// Update tag
export async function updateTag(
  id: string,
  formData: TagFormData
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session) {
    return { success: false, error: '未授权' };
  }

  // 验证标签 ID
  if (!isValidUUID(id)) {
    return { success: false, error: '标签 ID 格式无效' };
  }

  // 验证表单数据
  const validation = validateTagFormData(formData);
  if (!validation.valid) {
    const firstError = Object.values(validation.errors)[0];
    return { success: false, error: firstError };
  }

  const supabase = createAdminClient();

  // 检查 Slug 是否已存在（排除当前标签）
  const { data: existing } = await supabase
    .from('tags')
    .select('id')
    .eq('slug', formData.slug)
    .neq('id', id)
    .single();

  if (existing) {
    return { success: false, error: 'Slug 已存在，请使用其他名称' };
  }

  // 净化输入
  const sanitizedName = sanitizeInput(formData.name);

  const { error } = await supabase
    .from('tags')
    .update({
      name: sanitizedName,
      slug: formData.slug
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating tag:', error);
    return { success: false, error: '更新标签失败' };
  }

  revalidatePath('/dashboard/tags');
  return { success: true };
}

// Delete tag
export async function deleteTag(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session) {
    return { success: false, error: '未授权' };
  }

  // 验证标签 ID
  if (!isValidUUID(id)) {
    return { success: false, error: '标签 ID 格式无效' };
  }

  const supabase = createAdminClient();

  // Delete article_tags first
  await supabase.from('article_tags').delete().eq('tag_id', id);

  const { error } = await supabase.from('tags').delete().eq('id', id);

  if (error) {
    console.error('Error deleting tag:', error);
    return { success: false, error: '删除标签失败' };
  }

  revalidatePath('/dashboard/tags');
  return { success: true };
}
