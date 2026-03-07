'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { deleteCategory } from '@/features/categories/actions/categories';
import { CategoryDialog } from './category-dialog';
import { toast } from 'sonner';
import { Trash2, Pencil } from 'lucide-react';
import type { Category } from '@/types/blog';

interface CategoriesTableProps {
  categories: Category[];
}

export function CategoriesTable({ categories }: CategoriesTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteId) return;
    
    setIsDeleting(true);
    const result = await deleteCategory(deleteId);
    
    if (result.success) {
      toast.success('分类已删除');
    } else {
      toast.error(result.error || '删除失败');
    }
    
    setIsDeleting(false);
    setDeleteId(null);
  };

  if (categories.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-12 text-center'>
        <p className='text-muted-foreground mb-4'>暂无分类</p>
        <CategoryDialog />
      </div>
    );
  }

  return (
    <>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名称</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>描述</TableHead>
              <TableHead className='w-[100px]'>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className='font-medium'>{category.name}</TableCell>
                <TableCell>{category.slug}</TableCell>
                <TableCell>{category.description || '-'}</TableCell>
                <TableCell>
                  <div className='flex gap-2'>
                    <CategoryDialog category={category}>
                      <Button variant='ghost' size='icon'>
                        <Pencil className='h-4 w-4' />
                      </Button>
                    </CategoryDialog>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => setDeleteId(category.id)}
                    >
                      <Trash2 className='h-4 w-4 text-red-500' />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              此操作无法撤销。确定要删除这个分类吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className='bg-red-600 hover:bg-red-700'
            >
              {isDeleting ? '删除中...' : '删除'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
