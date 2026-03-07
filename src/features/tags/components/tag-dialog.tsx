'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { createTag, updateTag } from '@/features/tags/actions/tags';
import { toast } from 'sonner';
import { Loader2, Plus } from 'lucide-react';
import type { Tag } from '@/types/blog';

const tagSchema = z.object({
  name: z.string().min(1, '请输入名称'),
  slug: z.string().min(1, '请输入 slug'),
});

type TagFormValues = z.infer<typeof tagSchema>;

interface TagDialogProps {
  tag?: Tag | null;
  children?: React.ReactNode;
}

export function TagDialog({ tag, children }: TagDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TagFormValues>({
    resolver: zodResolver(tagSchema),
    defaultValues: {
      name: tag?.name || '',
      slug: tag?.slug || '',
    },
  });

  const onSubmit = async (data: TagFormValues) => {
    setIsSubmitting(true);
    
    const result = tag
      ? await updateTag(tag.id, data)
      : await createTag(data);

    if (result.success) {
      toast.success(tag ? '标签已更新' : '标签已创建');
      setOpen(false);
      reset();
    } else {
      toast.error(result.error || '操作失败');
    }

    setIsSubmitting(false);
  };

  const generateSlug = () => {
    const name = (document.getElementById('tag-name') as HTMLInputElement)?.value || '';
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
            新建标签
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{tag ? '编辑标签' : '新建标签'}</DialogTitle>
          <DialogDescription>
            {tag ? '修改标签信息' : '创建一个新的文章标签'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='tag-name'>名称</Label>
              <Input id='tag-name' placeholder='标签名称' {...register('name')} />
              {errors.name && (
                <p className='text-sm text-red-500'>{errors.name.message}</p>
              )}
            </div>
            <div className='space-y-2'>
              <Label htmlFor='slug'>Slug</Label>
              <div className='flex gap-2'>
                <Input id='slug' placeholder='tag-slug' {...register('slug')} />
                <Button type='button' variant='outline' onClick={generateSlug}>
                  生成
                </Button>
              </div>
              {errors.slug && (
                <p className='text-sm text-red-500'>{errors.slug.message}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type='button' variant='outline' onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              {tag ? '更新' : '创建'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
