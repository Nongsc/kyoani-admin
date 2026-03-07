'use client';

import { useState } from 'react';
import Image from 'next/image';
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
import { deleteMedia } from '@/features/media/actions/media';
import { toast } from 'sonner';
import { Trash2, File, Copy } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { Media } from '@/types/blog';

interface MediaGridProps {
  media: Media[];
}

export function MediaGrid({ media }: MediaGridProps) {
  const [deleteItem, setDeleteItem] = useState<Media | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteItem) return;
    
    setIsDeleting(true);
    const result = await deleteMedia(deleteItem.id, deleteItem.filename);
    
    if (result.success) {
      toast.success('文件已删除');
    } else {
      toast.error(result.error || '删除失败');
    }
    
    setIsDeleting(false);
    setDeleteItem(null);
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL 已复制');
  };

  if (media.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-12 text-center'>
        <p className='text-muted-foreground mb-4'>暂无媒体文件</p>
      </div>
    );
  }

  return (
    <>
      <div className='grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
        {media.map((item) => (
          <div
            key={item.id}
            className='group relative aspect-square rounded-lg border bg-muted overflow-hidden'
          >
            {item.type === 'image' ? (
              <Image
                src={item.url}
                alt={item.original_filename || item.filename}
                fill
                className='object-cover'
              />
            ) : (
              <div className='flex items-center justify-center h-full'>
                <File className='h-12 w-12 text-muted-foreground' />
              </div>
            )}
            <div className='absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2'>
              <p className='text-white text-xs text-center px-2 truncate w-full'>
                {item.original_filename || item.filename}
              </p>
              <p className='text-white/60 text-xs'>
                {format(new Date(item.created_at), 'yyyy-MM-dd', { locale: zhCN })}
              </p>
              <div className='flex gap-2'>
                <Button
                  size='sm'
                  variant='secondary'
                  onClick={() => copyUrl(item.url)}
                >
                  <Copy className='h-4 w-4' />
                </Button>
                <Button
                  size='sm'
                  variant='destructive'
                  onClick={() => setDeleteItem(item)}
                >
                  <Trash2 className='h-4 w-4' />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              此操作无法撤销。确定要删除这个文件吗？
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
