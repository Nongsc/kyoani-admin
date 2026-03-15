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
  // 检查环境变量
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error('Missing Supabase environment variables. Please check:');
    console.error('  - NEXT_PUBLIC_SUPABASE_URL');
    console.error('  - SUPABASE_SERVICE_ROLE_KEY');
    console.error('See admin/docs/supabase-setup-guide.md for setup instructions.');
    return null;
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('music_config')
    .select('*')
    .limit(1)
    .single();

  if (error) {
    // 如果表为空，初始化默认配置
    if (error.code === 'PGRST116') {
      console.log('music_config table is empty, initializing default config...');
      
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
        console.error('Make sure the music_config table exists. See admin/docs/supabase-setup-guide.md');
        return null;
      }

      console.log('Default music config created successfully');
      return newData;
    }

    // 表不存在的错误
    if (error.code === '42P01') {
      console.error('music_config table does not exist. Please run the SQL migration.');
      console.error('See admin/docs/supabase-setup-guide.md for instructions.');
      return null;
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
