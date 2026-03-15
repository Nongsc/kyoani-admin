-- =================================================================
-- 音乐配置表快速创建脚本
-- =================================================================
-- 执行方式：
-- 1. 登录 Supabase Dashboard (https://supabase.com/dashboard)
-- 2. 选择你的项目
-- 3. 进入 SQL Editor
-- 4. 复制粘贴此文件内容
-- 5. 点击 Run 执行
-- =================================================================

-- 1. 创建音乐配置表
CREATE TABLE IF NOT EXISTS music_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT DEFAULT 'tencent' CHECK (platform IN ('tencent', 'netease', 'kugou')),
  playlist_id TEXT NOT NULL DEFAULT '',
  auto_play BOOLEAN DEFAULT false,
  volume DECIMAL(3,2) DEFAULT 0.7 CHECK (volume >= 0 AND volume <= 1),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 插入默认配置
INSERT INTO music_config (platform, playlist_id) 
VALUES ('tencent', '')
ON CONFLICT DO NOTHING; -- 如果已存在则跳过

-- 3. 启用RLS（Row Level Security）
ALTER TABLE music_config ENABLE ROW LEVEL SECURITY;

-- 4. 创建公开读取策略（允许前端读取配置）
CREATE POLICY "公开读取音乐配置" ON music_config
  FOR SELECT USING (true);

-- 5. 创建管理写入策略（允许后台管理）
CREATE POLICY "管理员写入音乐配置" ON music_config
  FOR ALL USING (true);

-- =================================================================
-- 验证
-- =================================================================
-- 执行以下查询验证表是否创建成功：
-- SELECT * FROM music_config;
-- =================================================================
