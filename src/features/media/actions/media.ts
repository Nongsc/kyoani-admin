'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import type { Media } from '@/types/blog';

export async function getMedia(): Promise<Media[]> {
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from('media')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching media:', error);
    return [];
  }

  return data || [];
}

export async function uploadMedia(formData: FormData): Promise<{ success: boolean; error?: string; url?: string }> {
  const session = await auth();
  if (!session) {
    return { success: false, error: '未授权' };
  }

  const supabase = createAdminClient();
  const file = formData.get('file') as File;
  
  if (!file) {
    return { success: false, error: '请选择文件' };
  }

  const filename = `${Date.now()}-${file.name}`;
  
  const { error: uploadError } = await supabase
    .storage
    .from('media')
    .upload(filename, file);

  if (uploadError) {
    console.error('Error uploading file:', uploadError);
    return { success: false, error: '上传失败' };
  }

  const { data: { publicUrl } } = supabase
    .storage
    .from('media')
    .getPublicUrl(filename);

  const type = file.type.startsWith('image/') ? 'image' :
               file.type.startsWith('video/') ? 'video' :
               file.type.includes('pdf') || file.type.includes('document') ? 'document' : 'other';

  const { error: dbError } = await supabase
    .from('media')
    .insert({
      filename,
      original_filename: file.name,
      url: publicUrl,
      type,
      size: file.size,
      mime_type: file.type,
      uploaded_by: session.user?.id || null,
    });

  if (dbError) {
    console.error('Error saving media record:', dbError);
  }

  revalidatePath('/dashboard/media');
  return { success: true, url: publicUrl };
}

export async function deleteMedia(id: string, filename: string): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session) {
    return { success: false, error: '未授权' };
  }

  const supabase = createAdminClient();
  
  // Delete from storage
  await supabase.storage.from('media').remove([filename]);
  
  // Delete from database
  const { error } = await supabase
    .from('media')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting media:', error);
    return { success: false, error: '删除失败' };
  }

  revalidatePath('/dashboard/media');
  return { success: true };
}
