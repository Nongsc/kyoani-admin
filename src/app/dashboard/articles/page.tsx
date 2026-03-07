import { getArticles } from '@/features/articles/actions/articles';
import { ArticlesTable } from '@/features/articles/components/articles-table';

export default async function ArticlesPage() {
  const articles = await getArticles();

  return (
    <div className='flex flex-col gap-4 p-4'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold'>文章管理</h1>
          <p className='text-muted-foreground'>管理博客文章内容</p>
        </div>
      </div>
      <ArticlesTable articles={articles} />
    </div>
  );
}
