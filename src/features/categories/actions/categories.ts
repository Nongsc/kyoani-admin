'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import type { Category } from '@/types/blog';
import {
  validateCategoryFormData,
  sanitizeInput,
  isValidUUID
} from '@/lib/validation';
import type { CategoryFormData } from '@/lib/validation';

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

// Create category
export async function createCategory(
  formData: CategoryFormData
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session) {
    return { success: false, error: '未授权' };
  }

  // 验证表单数据
  const validation = validateCategoryFormData(formData);
  if (!validation.valid) {
    const firstError = Object.values(validation.errors)[0];
    return { success: false, error: firstError };
  }

  const supabase = createAdminClient();

  // 检查 Slug 是否已存在
  const { data: existing } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', formData.slug)
    .single();

  if (existing) {
    return { success: false, error: 'Slug 已存在，请使用其他名称' };
  }

  // 净化输入
  const sanitizedName = sanitizeInput(formData.name);
  const sanitizedDescription = formData.description
    ? sanitizeInput(formData.description)
    : null;

  const { error } = await supabase.from('categories').insert({
    name: sanitizedName,
    slug: formData.slug,
    description: sanitizedDescription
  });

  if (error) {
    console.error('Error creating category:', error);
    return { success: false, error: '创建分类失败' };
  }

  revalidatePath('/dashboard/categories');
  return { success: true };
}

// Update category
export async function updateCategory(
  id: string,
  formData: CategoryFormData
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session) {
    return { success: false, error: '未授权' };
  }

  // 验证分类 ID
  if (!isValidUUID(id)) {
    return { success: false, error: '分类 ID 格式无效' };
  }

  // 验证表单数据
  const validation = validateCategoryFormData(formData);
  if (!validation.valid) {
    const firstError = Object.values(validation.errors)[0];
    return { success: false, error: firstError };
  }

  const supabase = createAdminClient();

  // 检查 Slug 是否已存在（排除当前分类）
  const { data: existing } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', formData.slug)
    .neq('id', id)
    .single();

  if (existing) {
    return { success: false, error: 'Slug 已存在，请使用其他名称' };
  }

  // 净化输入
  const sanitizedName = sanitizeInput(formData.name);
  const sanitizedDescription = formData.description
    ? sanitizeInput(formData.description)
    : null;

  const { error } = await supabase
    .from('categories')
    .update({
      name: sanitizedName,
      slug: formData.slug,
      description: sanitizedDescription,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating category:', error);
    return { success: false, error: '更新分类失败' };
  }

  revalidatePath('/dashboard/categories');
  return { success: true };
}

// Delete category
export async function deleteCategory(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session) {
    return { success: false, error: '未授权' };
  }

  // 验证分类 ID
  if (!isValidUUID(id)) {
    return { success: false, error: '分类 ID 格式无效' };
  }

  const supabase = createAdminClient();

  const { error } = await supabase.from('categories').delete().eq('id', id);

  if (error) {
    console.error('Error deleting category:', error);
    return { success: false, error: '删除分类失败' };
  }

  revalidatePath('/dashboard/categories');
  return { success: true };
}
