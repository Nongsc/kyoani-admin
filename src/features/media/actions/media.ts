'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import type { Media } from '@/types/blog';
import { isValidUUID } from '@/lib/validation';

// 文件类型白名单
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp'
];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf'];
const ALLOWED_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  ...ALLOWED_VIDEO_TYPES,
  ...ALLOWED_DOCUMENT_TYPES
];

// 文件大小限制 (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_FILENAME_LENGTH = 255;

// 危险文件扩展名
const DANGEROUS_EXTENSIONS = [
  '.exe',
  '.bat',
  '.cmd',
  '.sh',
  '.ps1',
  '.js',
  '.html',
  '.svg'
];

/**
 * 验证文件类型是否允许
 */
function isAllowedFileType(mimeType: string): boolean {
  return ALLOWED_TYPES.includes(mimeType);
}

/**
 * 验证文件大小是否在限制内
 */
function isAllowedFileSize(size: number): boolean {
  return size > 0 && size <= MAX_FILE_SIZE;
}

/**
 * 检查文件扩展名是否危险
 */
function hasDangerousExtension(filename: string): boolean {
  const lowerName = filename.toLowerCase();
  return DANGEROUS_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
}

/**
 * 净化文件名（移除路径字符和特殊字符）
 */
function sanitizeFilename(filename: string): string {
  // 移除路径字符
  let sanitized = filename.replace(/[\/\\]/g, '_');
  // 移除控制字符
  sanitized = sanitized.replace(/[\x00-\x1f\x80-\x9f]/g, '');
  // 限制长度
  if (sanitized.length > MAX_FILENAME_LENGTH) {
    const ext = sanitized.lastIndexOf('.');
    if (ext > 0) {
      const extension = sanitized.slice(ext);
      sanitized =
        sanitized.slice(0, MAX_FILENAME_LENGTH - extension.length) + extension;
    } else {
      sanitized = sanitized.slice(0, MAX_FILENAME_LENGTH);
    }
  }
  return sanitized;
}

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

export async function uploadMedia(
  formData: FormData
): Promise<{ success: boolean; error?: string; url?: string }> {
  const session = await auth();
  if (!session) {
    return { success: false, error: '未授权' };
  }

  const supabase = createAdminClient();
  const file = formData.get('file') as File;

  if (!file) {
    return { success: false, error: '请选择文件' };
  }

  // 验证文件类型
  if (!isAllowedFileType(file.type)) {
    return {
      success: false,
      error: `不支持的文件类型: ${file.type}。允许的类型: 图片(jpg/png/gif/webp)、视频(mp4/webm/ogg)、PDF`
    };
  }

  // 验证文件大小
  if (!isAllowedFileSize(file.size)) {
    return {
      success: false,
      error: `文件大小超出限制。最大允许 ${MAX_FILE_SIZE / 1024 / 1024}MB`
    };
  }

  // 检查危险扩展名
  if (hasDangerousExtension(file.name)) {
    return { success: false, error: '不允许上传此类型的文件' };
  }

  // 净化文件名
  const safeFilename = sanitizeFilename(file.name);
  const filename = `${Date.now()}-${safeFilename}`;

  const { error: uploadError } = await supabase.storage
    .from('media')
    .upload(filename, file);

  if (uploadError) {
    console.error('Error uploading file:', uploadError);
    return { success: false, error: '上传失败' };
  }

  const {
    data: { publicUrl }
  } = supabase.storage.from('media').getPublicUrl(filename);

  const type = file.type.startsWith('image/')
    ? 'image'
    : file.type.startsWith('video/')
      ? 'video'
      : file.type.includes('pdf')
        ? 'document'
        : 'other';

  const { error: dbError } = await supabase.from('media').insert({
    filename,
    original_filename: safeFilename,
    url: publicUrl,
    type,
    size: file.size,
    mime_type: file.type,
    uploaded_by: session.user?.id || null
  });

  if (dbError) {
    console.error('Error saving media record:', dbError);
  }

  revalidatePath('/dashboard/media');
  return { success: true, url: publicUrl };
}

export async function deleteMedia(
  id: string,
  filename: string
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session) {
    return { success: false, error: '未授权' };
  }

  // 验证媒体 ID
  if (!isValidUUID(id)) {
    return { success: false, error: '媒体 ID 格式无效' };
  }

  const supabase = createAdminClient();

  // Delete from storage
  await supabase.storage.from('media').remove([filename]);

  // Delete from database
  const { error } = await supabase.from('media').delete().eq('id', id);

  if (error) {
    console.error('Error deleting media:', error);
    return { success: false, error: '删除失败' };
  }

  revalidatePath('/dashboard/media');
  return { success: true };
}
