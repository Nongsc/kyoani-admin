import { getTags } from '@/features/tags/actions/tags';
import { TagsTable } from '@/features/tags/components/tags-table';
import { TagDialog } from '@/features/tags/components/tag-dialog';

export default async function TagsPage() {
  const tags = await getTags();

  return (
    <div className='flex flex-col gap-4 p-4'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold'>标签管理</h1>
          <p className='text-muted-foreground'>管理文章标签</p>
        </div>
        <TagDialog />
      </div>
      <TagsTable tags={tags} />
    </div>
  );
}
