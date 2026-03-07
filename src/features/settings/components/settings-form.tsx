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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { updateSiteSetting } from '@/features/settings/actions/settings';
import { toast } from 'sonner';
import { Loader2, Save, Plus, Trash2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import type { SiteSetting } from '@/types/blog';

interface LinkItem {
  title: string;
  url: string;
}

interface SettingsFormProps {
  settings: SiteSetting[];
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);

  const handleSave = async (key: string, value: string) => {
    setIsSubmitting(key);
    
    const result = await updateSiteSetting(key, value);
    
    if (result.success) {
      toast.success('设置已保存');
    } else {
      toast.error(result.error || '保存失败');
    }
    
    setIsSubmitting(null);
  };

  const settingsMap = settings.reduce((acc, setting) => {
    acc[setting.key] = setting;
    return acc;
  }, {} as Record<string, SiteSetting>);

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>基本信息</CardTitle>
          <CardDescription>网站基本配置</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid gap-4'>
            <SettingItem
              label='网站标题'
              setting={settingsMap['site_title']}
              onSave={handleSave}
              isSubmitting={isSubmitting}
            />
            <SettingItem
              label='网站描述'
              setting={settingsMap['site_description']}
              onSave={handleSave}
              isSubmitting={isSubmitting}
            />
            <SettingItem
              label='网站作者'
              setting={settingsMap['site_author']}
              onSave={handleSave}
              isSubmitting={isSubmitting}
            />
            <SettingItem
              label='每页文章数'
              setting={settingsMap['posts_per_page']}
              onSave={handleSave}
              isSubmitting={isSubmitting}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>一言配置</CardTitle>
          <CardDescription>配置一言API显示随机句子</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid gap-4'>
            <SettingSelect
              label='启用一言'
              setting={settingsMap['hitokoto_enabled']}
              onSave={handleSave}
              isSubmitting={isSubmitting}
              options={[
                { value: 'true', label: '启用' },
                { value: 'false', label: '禁用' }
              ]}
            />
            <SettingSelect
              label='句子类型'
              setting={settingsMap['hitokoto_type']}
              onSave={handleSave}
              isSubmitting={isSubmitting}
              options={[
                { value: 'a', label: '动画' },
                { value: 'b', label: '漫画' },
                { value: 'c', label: '游戏' },
                { value: 'd', label: '文学' },
                { value: 'e', label: '原创' },
                { value: 'f', label: '网络' },
                { value: 'g', label: '其他' },
                { value: 'h', label: '影视' },
                { value: 'i', label: '诗词' },
                { value: 'k', label: '哲学' },
                { value: 'l', label: '抖机灵' }
              ]}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Footer配置</CardTitle>
          <CardDescription>自定义Footer底部显示内容</CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          <SettingItem
            label='版权声明'
            setting={settingsMap['footer_copyright']}
            onSave={handleSave}
            isSubmitting={isSubmitting}
          />
          <SettingItem
            label='ICP备案号'
            setting={settingsMap['footer_icp']}
            onSave={handleSave}
            isSubmitting={isSubmitting}
          />
          <LinksEditor
            label='技术框架链接'
            settingKey='footer_tech_links'
            initialValue={settingsMap['footer_tech_links']?.value || '[]'}
            onSave={handleSave}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>关于页面配置</CardTitle>
          <CardDescription>配置关于页面显示内容</CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          <SettingItem
            label='头像URL'
            setting={settingsMap['about_avatar']}
            onSave={handleSave}
            isSubmitting={isSubmitting}
            placeholder='输入头像图片URL'
          />
          <SettingTextarea
            label='个人简介'
            setting={settingsMap['about_bio']}
            onSave={handleSave}
            isSubmitting={isSubmitting}
            placeholder='输入个人简介...'
          />
          <SettingItem
            label='身份标签'
            setting={settingsMap['about_title']}
            onSave={handleSave}
            isSubmitting={isSubmitting}
            placeholder='如：全栈开发者 / 动漫爱好者'
          />
          <SettingItem
            label='地理位置'
            setting={settingsMap['about_location']}
            onSave={handleSave}
            isSubmitting={isSubmitting}
            placeholder='如：中国'
          />
          <SettingItem
            label='加入年份'
            setting={settingsMap['about_join_date']}
            onSave={handleSave}
            isSubmitting={isSubmitting}
            placeholder='如：2024'
          />
          <SkillsEditor
            label='技能标签'
            settingKey='about_skills'
            initialValue={settingsMap['about_skills']?.value || '[]'}
            onSave={handleSave}
            isSubmitting={isSubmitting}
          />

          <SocialLinksEditor
            label='社交链接'
            settingKey='about_social_links'
            initialValue={settingsMap['about_social_links']?.value || '[]'}
            onSave={handleSave}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>
    </div>
  );
}

// 多链接编辑器
interface LinksEditorProps {
  label: string;
  settingKey: string;
  initialValue: string;
  onSave: (key: string, value: string) => void;
  isSubmitting: string | null;
}

function LinksEditor({ label, settingKey, initialValue, onSave, isSubmitting }: LinksEditorProps) {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    try {
      const parsed = JSON.parse(initialValue);
      setLinks(Array.isArray(parsed) ? parsed : []);
    } catch {
      setLinks([]);
    }
    setHasChanges(false);
  }, [initialValue]);

  const addLink = () => {
    setLinks([...links, { title: '', url: '' }]);
    setHasChanges(true);
  };

  const updateLink = (index: number, field: 'title' | 'url', value: string) => {
    const newLinks = [...links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setLinks(newLinks);
    setHasChanges(true);
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
    setHasChanges(true);
  };

  const handleSave = () => {
    // 过滤掉空项
    const validLinks = links.filter(link => link.title.trim() && link.url.trim());
    onSave(settingKey, JSON.stringify(validLinks));
  };

  const originalValue = (() => {
    try {
      const parsed = JSON.parse(initialValue);
      return JSON.stringify(Array.isArray(parsed) ? parsed.filter((l: LinkItem) => l.title?.trim() && l.url?.trim()) : []);
    } catch {
      return '[]';
    }
  })();

  const currentValue = JSON.stringify(links.filter(l => l.title.trim() && l.url.trim()));

  return (
    <div className='space-y-3'>
      <div className='flex items-center justify-between'>
        <Label>{label}</Label>
        <Button variant='outline' size='sm' onClick={addLink}>
          <Plus className='h-4 w-4 mr-1' />
          添加链接
        </Button>
      </div>
      
      {links.length > 0 ? (
        <div className='space-y-3'>
          {links.map((link, index) => (
            <div key={index} className='flex items-start gap-2 p-3 border rounded-lg bg-muted/30'>
              <div className='flex-1 grid grid-cols-2 gap-2'>
                <div className='space-y-1'>
                  <Label className='text-xs text-muted-foreground'>标题</Label>
                  <Input
                    value={link.title}
                    onChange={(e) => updateLink(index, 'title', e.target.value)}
                    placeholder='链接标题'
                    className='h-8'
                  />
                </div>
                <div className='space-y-1'>
                  <Label className='text-xs text-muted-foreground'>URL</Label>
                  <Input
                    value={link.url}
                    onChange={(e) => updateLink(index, 'url', e.target.value)}
                    placeholder='https://...'
                    className='h-8'
                  />
                </div>
              </div>
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8 text-destructive hover:text-destructive mt-5'
                onClick={() => removeLink(index)}
              >
                <Trash2 className='h-4 w-4' />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className='text-sm text-muted-foreground py-4 text-center border rounded-lg bg-muted/30'>
          暂无链接，点击上方按钮添加
        </div>
      )}

      {links.length > 0 && (
        <div className='flex items-center justify-between pt-2'>
          <p className='text-xs text-muted-foreground font-mono'>
            {JSON.stringify(links.filter(l => l.title.trim() && l.url.trim()))}
          </p>
          <Button
            size='sm'
            onClick={handleSave}
            disabled={isSubmitting === settingKey || currentValue === originalValue}
          >
            {isSubmitting === settingKey ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <Save className='h-4 w-4 mr-1' />
            )}
            保存
          </Button>
        </div>
      )}
    </div>
  );
}

interface SettingSelectProps {
  label: string;
  setting?: SiteSetting;
  onSave: (key: string, value: string) => void;
  isSubmitting: string | null;
  options: { value: string; label: string }[];
}

function SettingSelect({ label, setting, onSave, isSubmitting, options }: SettingSelectProps) {
  const [value, setValue] = useState(setting?.value || '');

  if (!setting) return null;

  return (
    <div className='flex items-end gap-4'>
      <div className='flex-1 space-y-2'>
        <Label htmlFor={setting.key}>{label}</Label>
        <Select value={value} onValueChange={(v) => setValue(v)}>
          <SelectTrigger>
            <SelectValue placeholder='选择选项' />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button
        onClick={() => onSave(setting.key, value)}
        disabled={isSubmitting === setting.key || value === setting.value}
      >
        {isSubmitting === setting.key ? (
          <Loader2 className='h-4 w-4 animate-spin' />
        ) : (
          <Save className='h-4 w-4' />
        )}
      </Button>
    </div>
  );
}

interface SettingItemProps {
  label: string;
  setting?: SiteSetting;
  onSave: (key: string, value: string) => void;
  isSubmitting: string | null;
  placeholder?: string;
}

function SettingItem({ label, setting, onSave, isSubmitting, placeholder }: SettingItemProps) {
  const [value, setValue] = useState(setting?.value || '');

  if (!setting) return null;

  return (
    <div className='flex items-end gap-4'>
      <div className='flex-1 space-y-2'>
        <Label htmlFor={setting.key}>{label}</Label>
        <Input
          id={setting.key}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder || setting.description || ''}
        />
      </div>
      <Button
        onClick={() => onSave(setting.key, value)}
        disabled={isSubmitting === setting.key || value === setting.value}
      >
        {isSubmitting === setting.key ? (
          <Loader2 className='h-4 w-4 animate-spin' />
        ) : (
          <Save className='h-4 w-4' />
        )}
      </Button>
    </div>
  );
}

interface SettingTextareaProps {
  label: string;
  setting?: SiteSetting;
  onSave: (key: string, value: string) => void;
  isSubmitting: string | null;
  placeholder?: string;
}

function SettingTextarea({ label, setting, onSave, isSubmitting, placeholder }: SettingTextareaProps) {
  const [value, setValue] = useState(setting?.value || '');

  if (!setting) return null;

  return (
    <div className='space-y-2'>
      <Label htmlFor={setting.key}>{label}</Label>
      <div className='flex items-start gap-4'>
        <Textarea
          id={setting.key}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder || setting.description || ''}
          rows={3}
          className='flex-1'
        />
        <Button
          onClick={() => onSave(setting.key, value)}
          disabled={isSubmitting === setting.key || value === setting.value}
        >
          {isSubmitting === setting.key ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            <Save className='h-4 w-4' />
          )}
        </Button>
      </div>
    </div>
  );
}

// Skills Editor
interface SkillItem {
  name: string;
  color: string;
}

interface SkillsEditorProps {
  label: string;
  settingKey: string;
  initialValue: string;
  onSave: (key: string, value: string) => void;
  isSubmitting: string | null;
}

function SkillsEditor({ label, settingKey, initialValue, onSave, isSubmitting }: SkillsEditorProps) {
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    try {
      const parsed = JSON.parse(initialValue);
      setSkills(Array.isArray(parsed) ? parsed : []);
    } catch {
      setSkills([]);
    }
    setHasChanges(false);
  }, [initialValue]);

  const addSkill = () => {
    setSkills([...skills, { name: '', color: 'bg-blue-100 text-blue-700' }]);
    setHasChanges(true);
  };

  const updateSkill = (index: number, field: 'name' | 'color', value: string) => {
    const newSkills = [...skills];
    newSkills[index] = { ...newSkills[index], [field]: value };
    setSkills(newSkills);
    setHasChanges(true);
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
    setHasChanges(true);
  };

  const handleSave = () => {
    const validSkills = skills.filter(skill => skill.name.trim());
    onSave(settingKey, JSON.stringify(validSkills));
  };

  const colorOptions = [
    { value: 'bg-blue-100 text-blue-700', label: '蓝色' },
    { value: 'bg-cyan-100 text-cyan-700', label: '青色' },
    { value: 'bg-slate-100 text-slate-700', label: '灰色' },
    { value: 'bg-green-100 text-green-700', label: '绿色' },
    { value: 'bg-teal-100 text-teal-700', label: '蓝绿' },
    { value: 'bg-indigo-100 text-indigo-700', label: '靛蓝' },
    { value: 'bg-purple-100 text-purple-700', label: '紫色' },
    { value: 'bg-pink-100 text-pink-700', label: '粉色' },
    { value: 'bg-orange-100 text-orange-700', label: '橙色' },
    { value: 'bg-red-100 text-red-700', label: '红色' },
  ];

  return (
    <div className='space-y-3'>
      <div className='flex items-center justify-between'>
        <Label>{label}</Label>
        <Button variant='outline' size='sm' onClick={addSkill}>
          <Plus className='h-4 w-4 mr-1' />
          添加技能
        </Button>
      </div>
      
      {skills.length > 0 ? (
        <div className='space-y-3'>
          {skills.map((skill, index) => (
            <div key={index} className='flex items-start gap-2 p-3 border rounded-lg bg-muted/30'>
              <div className='flex-1 grid grid-cols-2 gap-2'>
                <div className='space-y-1'>
                  <Label className='text-xs text-muted-foreground'>名称</Label>
                  <Input
                    value={skill.name}
                    onChange={(e) => updateSkill(index, 'name', e.target.value)}
                    placeholder='技能名称'
                    className='h-8'
                  />
                </div>
                <div className='space-y-1'>
                  <Label className='text-xs text-muted-foreground'>颜色</Label>
                  <Select value={skill.color} onValueChange={(v) => updateSkill(index, 'color', v)}>
                    <SelectTrigger className='h-8'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {colorOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8 text-destructive hover:text-destructive mt-5'
                onClick={() => removeSkill(index)}
              >
                <Trash2 className='h-4 w-4' />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className='text-sm text-muted-foreground py-4 text-center border rounded-lg bg-muted/30'>
          暂无技能，点击上方按钮添加
        </div>
      )}

      {skills.length > 0 && (
        <div className='flex items-center justify-end pt-2'>
          <Button
            size='sm'
            onClick={handleSave}
            disabled={isSubmitting === settingKey}
          >
            {isSubmitting === settingKey ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <Save className='h-4 w-4 mr-1' />
            )}
            保存
          </Button>
        </div>
      )}
    </div>
  );
}

// Social Links Editor
interface SocialLinkItem {
  icon: string;
  url: string;
  label: string;
}

interface SocialLinksEditorProps {
  label: string;
  settingKey: string;
  initialValue: string;
  onSave: (key: string, value: string) => void;
  isSubmitting: string | null;
}

function SocialLinksEditor({ label, settingKey, initialValue, onSave, isSubmitting }: SocialLinksEditorProps) {
  const [links, setLinks] = useState<SocialLinkItem[]>([]);

  useEffect(() => {
    try {
      const parsed = JSON.parse(initialValue);
      setLinks(Array.isArray(parsed) ? parsed : []);
    } catch {
      setLinks([]);
    }
  }, [initialValue]);

  const addLink = () => {
    setLinks([...links, { icon: 'Link', url: '', label: '' }]);
  };

  const updateLink = (index: number, field: 'icon' | 'url' | 'label', value: string) => {
    const newLinks = [...links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setLinks(newLinks);
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const validLinks = links.filter(link => link.label.trim() && link.url.trim());
    onSave(settingKey, JSON.stringify(validLinks));
  };

  const iconOptions = [
    { value: 'Github', label: 'GitHub' },
    { value: 'Twitter', label: 'Twitter' },
    { value: 'Mail', label: '邮箱' },
    { value: 'Linkedin', label: 'LinkedIn' },
    { value: 'Youtube', label: 'YouTube' },
    { value: 'Instagram', label: 'Instagram' },
    { value: 'Globe', label: '网站' },
    { value: 'Link', label: '链接' },
  ];

  return (
    <div className='space-y-3'>
      <div className='flex items-center justify-between'>
        <Label>{label}</Label>
        <Button variant='outline' size='sm' onClick={addLink}>
          <Plus className='h-4 w-4 mr-1' />
          添加链接
        </Button>
      </div>
      
      {links.length > 0 ? (
        <div className='space-y-3'>
          {links.map((link, index) => (
            <div key={index} className='flex items-start gap-2 p-3 border rounded-lg bg-muted/30'>
              <div className='flex-1 grid grid-cols-3 gap-2'>
                <div className='space-y-1'>
                  <Label className='text-xs text-muted-foreground'>图标</Label>
                  <Select value={link.icon} onValueChange={(v) => updateLink(index, 'icon', v)}>
                    <SelectTrigger className='h-8'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className='space-y-1'>
                  <Label className='text-xs text-muted-foreground'>标签</Label>
                  <Input
                    value={link.label}
                    onChange={(e) => updateLink(index, 'label', e.target.value)}
                    placeholder='显示名称'
                    className='h-8'
                  />
                </div>
                <div className='space-y-1'>
                  <Label className='text-xs text-muted-foreground'>URL</Label>
                  <Input
                    value={link.url}
                    onChange={(e) => updateLink(index, 'url', e.target.value)}
                    placeholder='https://...'
                    className='h-8'
                  />
                </div>
              </div>
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8 text-destructive hover:text-destructive mt-5'
                onClick={() => removeLink(index)}
              >
                <Trash2 className='h-4 w-4' />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className='text-sm text-muted-foreground py-4 text-center border rounded-lg bg-muted/30'>
          暂无链接，点击上方按钮添加
        </div>
      )}

      {links.length > 0 && (
        <div className='flex items-center justify-end pt-2'>
          <Button
            size='sm'
            onClick={handleSave}
            disabled={isSubmitting === settingKey}
          >
            {isSubmitting === settingKey ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <Save className='h-4 w-4 mr-1' />
            )}
            保存
          </Button>
        </div>
      )}
    </div>
  );
}
