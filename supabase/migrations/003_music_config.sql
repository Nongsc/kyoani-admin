-- 创建音乐配置表
CREATE TABLE IF NOT EXISTS music_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT DEFAULT 'tencent' CHECK (platform IN ('tencent', 'netease', 'kugou')),
  playlist_id TEXT NOT NULL DEFAULT '',
  auto_play BOOLEAN DEFAULT false,
  volume DECIMAL(3,2) DEFAULT 0.7 CHECK (volume >= 0 AND volume <= 1),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 插入默认配置
INSERT INTO music_config (platform, playlist_id) 
VALUES ('tencent', '');

-- 启用RLS
ALTER TABLE music_config ENABLE ROW LEVEL SECURITY;

-- 创建公开读取策略
CREATE POLICY "公开读取音乐配置" ON music_config
  FOR SELECT USING (true);
