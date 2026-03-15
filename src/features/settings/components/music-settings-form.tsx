'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getMusicConfig, updateMusicConfig, type MusicConfigData } from '../actions/music';
import { toast } from 'sonner';
import { Loader2, Save, Music, ExternalLink } from 'lucide-react';

export function MusicSettingsForm() {
  const [config, setConfig] = useState<MusicConfigData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setIsLoading(true);
    const data = await getMusicConfig();
    setConfig(data);
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!config) return;

    setIsSaving(true);
    const result = await updateMusicConfig({
      platform: config.platform,
      playlist_id: config.playlist_id,
      auto_play: config.auto_play,
      volume: config.volume,
    });

    if (result.success) {
      toast.success('音乐配置已保存');
    } else {
      toast.error(result.error || '保存失败');
    }

    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            音乐播放器配置
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!config) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            音乐播放器配置
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium text-amber-900">配置未加载</p>
            <p className="text-xs text-amber-700">
              请检查以下配置：
            </p>
            <ol className="text-xs text-amber-700 list-decimal list-inside space-y-1">
              <li>Supabase 环境变量是否已配置（.env.local）</li>
              <li>music_config 表是否已在数据库中创建</li>
              <li>开发服务器是否已重启</li>
            </ol>
            <p className="text-xs text-amber-700 mt-2">
              详细配置步骤请查看：<code className="bg-amber-100 px-1 rounded">admin/docs/supabase-setup-guide.md</code>
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5" />
          音乐播放器配置
        </CardTitle>
        <CardDescription>
          配置灵动岛音乐播放器，支持QQ音乐、网易云音乐、酷狗音乐
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 音乐平台选择 */}
        <div className="space-y-2">
          <Label>音乐平台</Label>
          <Select
            value={config.platform}
            onValueChange={(value: 'tencent' | 'netease' | 'kugou') =>
              setConfig({ ...config, platform: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tencent">QQ音乐</SelectItem>
              <SelectItem value="netease">网易云音乐</SelectItem>
              <SelectItem value="kugou">酷狗音乐</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            选择音乐平台后，需要提供公开歌单ID
          </p>
        </div>

        {/* 歌单ID输入 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>歌单ID</Label>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => {
                const helpUrl = {
                  tencent: 'https://y.qq.com',
                  netease: 'https://music.163.com',
                  kugou: 'https://www.kugou.com',
                }[config.platform];
                window.open(helpUrl, '_blank');
              }}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              打开{config.platform === 'tencent' ? 'QQ音乐' : config.platform === 'netease' ? '网易云音乐' : '酷狗音乐'}
            </Button>
          </div>
          <Input
            value={config.playlist_id}
            onChange={(e) => setConfig({ ...config, playlist_id: e.target.value })}
            placeholder={getPlaceholder(config.platform)}
          />
          <p className="text-xs text-muted-foreground">
            {getHelpText(config.platform)}
          </p>
        </div>

        {/* 自动播放开关 */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>自动播放</Label>
            <p className="text-xs text-muted-foreground">
              页面加载后自动开始播放音乐
            </p>
          </div>
          <Switch
            checked={config.auto_play}
            onCheckedChange={(checked) => setConfig({ ...config, auto_play: checked })}
          />
        </div>

        {/* 音量滑块 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>默认音量</Label>
            <span className="text-sm text-muted-foreground font-mono">
              {Math.round(config.volume * 100)}%
            </span>
          </div>
          <Slider
            value={[config.volume * 100]}
            onValueChange={([value]) => setConfig({ ...config, volume: value / 100 })}
            max={100}
            step={5}
            className="w-full"
          />
        </div>

        {/* 保存按钮 */}
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                保存配置
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// 辅助函数：获取占位符
function getPlaceholder(platform: string): string {
  switch (platform) {
    case 'tencent':
      return '如：123456789';
    case 'netease':
      return '如：123456789';
    case 'kugou':
      return '如：123456789';
    default:
      return '输入歌单ID';
  }
}

// 辅助函数：获取帮助文本
function getHelpText(platform: string): string {
  switch (platform) {
    case 'tencent':
      return 'QQ音乐歌单链接格式：https://y.qq.com/n/ryqq/playlist/[ID]，提取其中的数字ID';
    case 'netease':
      return '网易云音乐歌单链接格式：https://music.163.com/#/playlist?id=[ID]，提取id后的数字';
    case 'kugou':
      return '酷狗音乐歌单链接中的ID参数';
    default:
      return '';
  }
}
