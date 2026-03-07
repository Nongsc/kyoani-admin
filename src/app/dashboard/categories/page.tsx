import { getCategories } from '@/features/categories/actions/categories';
import { CategoriesTable } from '@/features/categories/components/categories-table';
import { CategoryDialog } from '@/features/categories/components/category-dialog';

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className='flex flex-col gap-4 p-4'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold'>分类管理</h1>
          <p className='text-muted-foreground'>管理文章分类</p>
        </div>
        <CategoryDialog />
      </div>
      <CategoriesTable categories={categories} />
    </div>
  );
}
