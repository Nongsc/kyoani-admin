import { getSiteSettings } from '@/features/settings/actions/settings';
import { SettingsForm } from '@/features/settings/components/settings-form';
import { MusicSettingsForm } from '@/features/settings/components/music-settings-form';

export default async function SettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className='flex flex-col gap-4 p-4'>
      <div>
        <h1 className='text-2xl font-bold'>站点设置</h1>
        <p className='text-muted-foreground'>管理博客站点配置</p>
      </div>
      <SettingsForm settings={settings} />
      <MusicSettingsForm />
    </div>
  );
}
