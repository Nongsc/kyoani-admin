import { getCategories, getTags } from '@/features/articles/actions/articles';
import { ArticleForm } from '@/features/articles/components/article-form';

export default async function NewArticlePage() {
  const [categories, tags] = await Promise.all([
    getCategories(),
    getTags(),
  ]);

  return (
    <div className='flex flex-col gap-4 p-4'>
      <div>
        <h1 className='text-2xl font-bold'>新建文章</h1>
        <p className='text-muted-foreground'>创建一篇新的博客文章</p>
      </div>
      <ArticleForm categories={categories} tags={tags} />
    </div>
  );
}
