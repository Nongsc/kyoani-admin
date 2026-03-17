'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import {
  deleteArticle,
  toggleArticleStatus
} from '@/features/articles/actions/articles';
import { toast } from 'sonner';
import { MoreHorizontal, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { ArticleListItem } from '@/types/blog';

interface ArticlesTableProps {
  articles: ArticleListItem[];
}

export function ArticlesTable({ articles }: ArticlesTableProps) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    const result = await deleteArticle(deleteId);

    if (result.success) {
      toast.success('文章已删除');
      router.refresh();
    } else {
      toast.error(result.error || '删除失败');
    }

    setIsDeleting(false);
    setDeleteId(null);
  };

  const handleToggleStatus = async (id: string) => {
    const result = await toggleArticleStatus(id);

    if (result.success) {
      toast.success('状态已更新');
      router.refresh();
    } else {
      toast.error(result.error || '更新失败');
    }
  };

  if (articles.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-12 text-center'>
        <p className='text-muted-foreground mb-4'>暂无文章</p>
        <Link href='/dashboard/articles/new'>
          <Button>创建第一篇文章</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>标题</TableHead>
              <TableHead>分类</TableHead>
              <TableHead>标签</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className='w-[70px]'>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {articles.map((article) => (
              <TableRow key={article.id}>
                <TableCell>
                  <div className='flex flex-col'>
                    <span className='font-medium'>{article.title}</span>
                    <span className='text-muted-foreground text-xs'>
                      {article.slug}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {article.categories ? (
                    <Badge variant='outline'>{article.categories.name}</Badge>
                  ) : (
                    <span className='text-muted-foreground text-sm'>
                      未分类
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <div className='flex flex-wrap gap-1'>
                    {article.article_tags?.slice(0, 3).map((at) => (
                      <Badge
                        key={at.tag_id}
                        variant='secondary'
                        className='text-xs'
                      >
                        {at.tags?.[0]?.name}
                      </Badge>
                    ))}
                    {article.article_tags &&
                      article.article_tags.length > 3 && (
                        <Badge variant='secondary' className='text-xs'>
                          +{article.article_tags.length - 3}
                        </Badge>
                      )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      article.status === 'published' ? 'default' : 'secondary'
                    }
                    className='cursor-pointer'
                    onClick={() => handleToggleStatus(article.id)}
                  >
                    {article.status === 'published' ? (
                      <>
                        <Eye className='mr-1 h-3 w-3' />
                        已发布
                      </>
                    ) : (
                      <>
                        <EyeOff className='mr-1 h-3 w-3' />
                        草稿
                      </>
                    )}
                  </Badge>
                </TableCell>
                <TableCell>
                  {format(new Date(article.created_at), 'yyyy-MM-dd', {
                    locale: zhCN
                  })}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='ghost' size='icon'>
                        <MoreHorizontal className='h-4 w-4' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/articles/${article.id}`}>
                          <Pencil className='mr-2 h-4 w-4' />
                          编辑
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className='text-red-600'
                        onClick={() => setDeleteId(article.id)}
                      >
                        <Trash2 className='mr-2 h-4 w-4' />
                        删除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
              此操作无法撤销。确定要删除这篇文章吗？
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
