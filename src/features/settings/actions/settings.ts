'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getSiteSettings() {
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .order('key');

  if (error) {
    console.error('Error fetching site settings:', error);
    return [];
  }

  return data || [];
}

export async function updateSiteSetting(key: string, value: string): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session) {
    return { success: false, error: '未授权' };
  }

  const supabase = createAdminClient();
  
  const { error } = await supabase
    .from('site_settings')
    .update({ value, updated_at: new Date().toISOString() })
    .eq('key', key);

  if (error) {
    console.error('Error updating site setting:', error);
    return { success: false, error: '更新失败' };
  }

  revalidatePath('/dashboard/settings');
  return { success: true };
}
