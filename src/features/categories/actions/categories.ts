'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import type { Category, CategoryFormData } from '@/types/blog';

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
export async function createCategory(formData: CategoryFormData): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session) {
    return { success: false, error: '未授权' };
  }

  const supabase = createAdminClient();
  
  const { error } = await supabase
    .from('categories')
    .insert({
      name: formData.name,
      slug: formData.slug,
      description: formData.description || null,
    });

  if (error) {
    console.error('Error creating category:', error);
    return { success: false, error: '创建分类失败' };
  }

  revalidatePath('/dashboard/categories');
  return { success: true };
}

// Update category
export async function updateCategory(id: string, formData: CategoryFormData): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session) {
    return { success: false, error: '未授权' };
  }

  const supabase = createAdminClient();
  
  const { error } = await supabase
    .from('categories')
    .update({
      name: formData.name,
      slug: formData.slug,
      description: formData.description || null,
      updated_at: new Date().toISOString(),
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
export async function deleteCategory(id: string): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session) {
    return { success: false, error: '未授权' };
  }

  const supabase = createAdminClient();
  
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting category:', error);
    return { success: false, error: '删除分类失败' };
  }

  revalidatePath('/dashboard/categories');
  return { success: true };
}
