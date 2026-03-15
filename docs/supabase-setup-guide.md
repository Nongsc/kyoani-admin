# Supabase配置指南

## 问题：admin后台音乐配置显示"无法加载配置"

**原因**：
1. Supabase环境变量未配置
2. `music_config`表未在数据库中创建

## 解决方案

### 步骤1：配置环境变量

在 `admin/.env.local` 中添加以下配置：

```env
# =================================================================
# Supabase Configuration
# =================================================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

**获取方式**：
1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 Settings > API
4. 复制：
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **仅用于服务端代码**

### 步骤2：创建数据库表

**方法A：通过Supabase Dashboard（推荐）**

1. 进入 Supabase Dashboard
2. 选择你的项目
3. 进入 SQL Editor
4. 执行以下SQL：

```sql
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

-- 创建管理写入策略（需要认证）
CREATE POLICY "管理员写入音乐配置" ON music_config
  FOR ALL USING (true);
```

5. 点击 Run 执行

**方法B：通过命令行**

```bash
cd admin
npx supabase db push
```

### 步骤3：重启开发服务器

```bash
cd admin
npm run dev
```

### 步骤4：验证

1. 访问 http://localhost:3001/dashboard/settings
2. 滚动到"音乐播放器配置"部分
3. 应该看到配置表单（不再是"无法加载配置"）

## 故障排除

### 问题1：仍然显示"无法加载配置"

**检查**：
1. 确认`.env.local`文件存在且配置正确
2. 重启开发服务器（环境变量需要重启才能生效）
3. 检查浏览器控制台是否有错误

**调试**：
在 `admin/src/features/settings/actions/music.ts` 中添加日志：

```typescript
export async function getMusicConfig(): Promise<MusicConfigData | null> {
  console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('Service Role Key exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
  
  const supabase = createAdminClient();
  // ... 其余代码
}
```

### 问题2：权限错误

**原因**：RLS策略未正确配置

**解决**：在Supabase Dashboard执行：

```sql
-- 允许所有操作（开发环境）
CREATE POLICY "Allow all operations" ON music_config
  FOR ALL USING (true);
```

### 问题3：表已存在但无法访问

**检查表结构**：
```sql
SELECT * FROM music_config;
```

**如果表不存在，重新创建**：
```sql
-- 先删除旧表（如果存在）
DROP TABLE IF EXISTS music_config;

-- 然后重新创建（执行上面的CREATE TABLE语句）
```

## 安全提示

⚠️ **SUPABASE_SERVICE_ROLE_KEY 非常重要**：
- 绕过所有RLS策略
- 仅用于服务端代码
- 永远不要暴露到客户端
- 不要提交到git

## 下一步

配置完成后，你可以：
1. 在后台配置QQ音乐歌单ID
2. 测试音乐播放器功能
3. 部署到生产环境（记得配置生产环境变量）
