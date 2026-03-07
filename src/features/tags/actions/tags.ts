'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import type { Tag, TagFormData } from '@/types/blog';

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
export async function createTag(formData: TagFormData): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session) {
    return { success: false, error: '未授权' };
  }

  const supabase = createAdminClient();
  
  const { error } = await supabase
    .from('tags')
    .insert({
      name: formData.name,
      slug: formData.slug,
    });

  if (error) {
    console.error('Error creating tag:', error);
    return { success: false, error: '创建标签失败' };
  }

  revalidatePath('/dashboard/tags');
  return { success: true };
}

// Update tag
export async function updateTag(id: string, formData: TagFormData): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session) {
    return { success: false, error: '未授权' };
  }

  const supabase = createAdminClient();
  
  const { error } = await supabase
    .from('tags')
    .update({
      name: formData.name,
      slug: formData.slug,
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
export async function deleteTag(id: string): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session) {
    return { success: false, error: '未授权' };
  }

  const supabase = createAdminClient();
  
  // Delete article_tags first
  await supabase.from('article_tags').delete().eq('tag_id', id);
  
  const { error } = await supabase
    .from('tags')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting tag:', error);
    return { success: false, error: '删除标签失败' };
  }

  revalidatePath('/dashboard/tags');
  return { success: true };
}
