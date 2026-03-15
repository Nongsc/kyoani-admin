'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export interface MusicConfigData {
  id: string;
  platform: 'tencent' | 'netease' | 'kugou';
  playlist_id: string;
  auto_play: boolean;
  volume: number;
  created_at: string;
  updated_at: string;
}

/**
 * 获取音乐配置
 */
export async function getMusicConfig(): Promise<MusicConfigData | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('music_config')
    .select('*')
    .limit(1)
    .single();

  if (error) {
    // 如果表为空，初始化默认配置
    if (error.code === 'PGRST116') {
      const { data: newData, error: insertError } = await supabase
        .from('music_config')
        .insert({
          platform: 'tencent',
          playlist_id: '',
          auto_play: false,
          volume: 0.7,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error initializing music config:', insertError);
        return null;
      }

      return newData;
    }

    console.error('Error fetching music config:', error);
    return null;
  }

  return data;
}

/**
 * 更新音乐配置
 */
export async function updateMusicConfig(
  config: Partial<Omit<MusicConfigData, 'id' | 'created_at' | 'updated_at'>>
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session) {
    return { success: false, error: '未授权' };
  }

  const supabase = createAdminClient();

  // 获取现有配置ID
  const { data: existing } = await supabase
    .from('music_config')
    .select('id')
    .limit(1)
    .single();

  if (!existing) {
    return { success: false, error: '配置不存在' };
  }

  const { error } = await supabase
    .from('music_config')
    .update({
      ...config,
      updated_at: new Date().toISOString(),
    })
    .eq('id', existing.id);

  if (error) {
    console.error('Error updating music config:', error);
    return { success: false, error: '更新失败' };
  }

  revalidatePath('/dashboard/settings');
  return { success: true };
}
