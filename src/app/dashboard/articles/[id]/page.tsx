import { notFound } from 'next/navigation';
import { getArticleById, getCategories, getTags } from '@/features/articles/actions/articles';
import { ArticleForm } from '@/features/articles/components/article-form';

interface EditArticlePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const { id } = await params;
  
  const [article, categories, tags] = await Promise.all([
    getArticleById(id),
    getCategories(),
    getTags(),
  ]);

  if (!article) {
    notFound();
  }

  return (
    <div className='flex flex-col gap-4 p-4'>
      <div>
        <h1 className='text-2xl font-bold'>编辑文章</h1>
        <p className='text-muted-foreground'>修改文章内容</p>
      </div>
      <ArticleForm 
        article={article} 
        categories={categories} 
        tags={tags} 
      />
    </div>
  );
}
