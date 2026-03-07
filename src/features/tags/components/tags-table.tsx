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
import { Badge } from '@/components/ui/badge';
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
import { deleteTag } from '@/features/tags/actions/tags';
import { TagDialog } from './tag-dialog';
import { toast } from 'sonner';
import { Trash2, Pencil } from 'lucide-react';
import type { Tag } from '@/types/blog';

interface TagsTableProps {
  tags: Tag[];
}

export function TagsTable({ tags }: TagsTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteId) return;
    
    setIsDeleting(true);
    const result = await deleteTag(deleteId);
    
    if (result.success) {
      toast.success('标签已删除');
    } else {
      toast.error(result.error || '删除失败');
    }
    
    setIsDeleting(false);
    setDeleteId(null);
  };

  if (tags.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-12 text-center'>
        <p className='text-muted-foreground mb-4'>暂无标签</p>
        <TagDialog />
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
              <TableHead className='w-[100px]'>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tags.map((tag) => (
              <TableRow key={tag.id}>
                <TableCell>
                  <Badge>{tag.name}</Badge>
                </TableCell>
                <TableCell>{tag.slug}</TableCell>
                <TableCell>
                  <div className='flex gap-2'>
                    <TagDialog tag={tag}>
                      <Button variant='ghost' size='icon'>
                        <Pencil className='h-4 w-4' />
                      </Button>
                    </TagDialog>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => setDeleteId(tag.id)}
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
              此操作无法撤销。确定要删除这个标签吗？
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
