'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { createCategory, updateCategory } from '@/features/categories/actions/categories';
import { toast } from 'sonner';
import { Loader2, Plus } from 'lucide-react';
import type { Category } from '@/types/blog';

const categorySchema = z.object({
  name: z.string().min(1, '请输入名称'),
  slug: z.string().min(1, '请输入 slug'),
  description: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryDialogProps {
  category?: Category | null;
  children?: React.ReactNode;
}

export function CategoryDialog({ category, children }: CategoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name || '',
      slug: category?.slug || '',
      description: category?.description || '',
    },
  });

  const onSubmit = async (data: CategoryFormValues) => {
    setIsSubmitting(true);
    
    const result = category
      ? await updateCategory(category.id, data)
      : await createCategory(data);

    if (result.success) {
      toast.success(category ? '分类已更新' : '分类已创建');
      setOpen(false);
      reset();
    } else {
      toast.error(result.error || '操作失败');
    }

    setIsSubmitting(false);
  };

  const generateSlug = () => {
    const name = (document.getElementById('name') as HTMLInputElement)?.value || '';
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      .replace(/^-|-$/g, '');
    setValue('slug', slug);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className='mr-2 h-4 w-4' />
            新建分类
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{category ? '编辑分类' : '新建分类'}</DialogTitle>
          <DialogDescription>
            {category ? '修改分类信息' : '创建一个新的文章分类'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='name'>名称</Label>
              <Input id='name' placeholder='分类名称' {...register('name')} />
              {errors.name && (
                <p className='text-sm text-red-500'>{errors.name.message}</p>
              )}
            </div>
            <div className='space-y-2'>
              <Label htmlFor='slug'>Slug</Label>
              <div className='flex gap-2'>
                <Input id='slug' placeholder='category-slug' {...register('slug')} />
                <Button type='button' variant='outline' onClick={generateSlug}>
                  生成
                </Button>
              </div>
              {errors.slug && (
                <p className='text-sm text-red-500'>{errors.slug.message}</p>
              )}
            </div>
            <div className='space-y-2'>
              <Label htmlFor='description'>描述</Label>
              <Textarea
                id='description'
                placeholder='分类描述（可选）'
                {...register('description')}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type='button' variant='outline' onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              {category ? '更新' : '创建'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
