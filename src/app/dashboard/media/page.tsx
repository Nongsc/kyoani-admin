import { getMedia } from '@/features/media/actions/media';
import { MediaGrid } from '@/features/media/components/media-grid';
import { UploadButton } from '@/features/media/components/upload-button';

export default async function MediaPage() {
  const media = await getMedia();

  return (
    <div className='flex flex-col gap-4 p-4'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold'>媒体管理</h1>
          <p className='text-muted-foreground'>管理上传的媒体文件</p>
        </div>
        <UploadButton />
      </div>
      <MediaGrid media={media} />
    </div>
  );
}
