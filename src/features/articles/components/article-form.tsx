'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  createArticle,
  updateArticle
} from '@/features/articles/actions/articles';
import { MarkdownEditor } from './markdown-editor';
import { toast } from 'sonner';
import { Loader2, X } from 'lucide-react';
import type { Article, CategoryListItem, TagListItem } from '@/types/blog';

const articleSchema = z.object({
  title: z.string().min(1, '请输入标题'),
  slug: z.string().min(1, '请输入 slug'),
  content: z.string().min(1, '请输入内容'),
  excerpt: z.string().optional(),
  cover_image: z.string().url('请输入有效的 URL').optional().or(z.literal('')),
  category_id: z.string().optional(),
  tags: z.array(z.string()),
  status: z.enum(['draft', 'published'])
});

type ArticleFormValues = z.infer<typeof articleSchema>;

interface ArticleFormProps {
  article?: Article | null;
  categories: CategoryListItem[];
  tags: TagListItem[];
}

export function ArticleForm({ article, categories, tags }: ArticleFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>(
    article?.article_tags?.map((at) => at.tag_id) || []
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<ArticleFormValues>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: article?.title || '',
      slug: article?.slug || '',
      content: article?.content || '',
      excerpt: article?.excerpt || '',
      cover_image: article?.cover_image || '',
      category_id: article?.category_id || '',
      tags: article?.article_tags?.map((at) => at.tag_id) || [],
      status: article?.status || 'draft'
    }
  });

  const title = watch('title');

  // Auto-generate slug from title
  const generateSlug = () => {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      .replace(/^-|-$/g, '');
    setValue('slug', slug);
  };

  const toggleTag = (tagId: string) => {
    const newTags = selectedTags.includes(tagId)
      ? selectedTags.filter((id) => id !== tagId)
      : [...selectedTags, tagId];
    setSelectedTags(newTags);
    setValue('tags', newTags);
  };

  const onSubmit = async (data: ArticleFormValues) => {
    setIsSubmitting(true);

    const formData = {
      ...data,
      excerpt: data.excerpt || '',
      cover_image: data.cover_image || '',
      category_id: data.category_id || ''
    };

    let result;
    if (article) {
      result = await updateArticle(article.id, formData);
    } else {
      result = await createArticle(formData);
    }

    if (result.success) {
      toast.success(article ? '文章已更新' : '文章已创建');
      router.push('/dashboard/articles');
      router.refresh();
    } else {
      toast.error(result.error || '操作失败');
    }

    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className='grid gap-6 lg:grid-cols-[1fr_300px]'>
        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='title'>标题</Label>
                <Input
                  id='title'
                  placeholder='输入文章标题'
                  {...register('title')}
                />
                {errors.title && (
                  <p className='text-sm text-red-500'>{errors.title.message}</p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='slug'>Slug</Label>
                <div className='flex gap-2'>
                  <Input
                    id='slug'
                    placeholder='article-url-slug'
                    {...register('slug')}
                  />
                  <Button
                    type='button'
                    variant='outline'
                    onClick={generateSlug}
                  >
                    生成
                  </Button>
                </div>
                {errors.slug && (
                  <p className='text-sm text-red-500'>{errors.slug.message}</p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='excerpt'>摘要</Label>
                <Textarea
                  id='excerpt'
                  placeholder='文章简短描述'
                  rows={3}
                  {...register('excerpt')}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='cover_image'>封面图片 URL</Label>
                <Input
                  id='cover_image'
                  placeholder='https://example.com/image.jpg'
                  {...register('cover_image')}
                />
                {errors.cover_image && (
                  <p className='text-sm text-red-500'>
                    {errors.cover_image.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>文章内容</CardTitle>
              <CardDescription>支持 Markdown 格式</CardDescription>
            </CardHeader>
            <CardContent>
              <MarkdownEditor
                value={watch('content') || ''}
                onChange={(value) => setValue('content', value)}
                placeholder='在这里编写文章内容...'
                className='min-h-[400px] font-mono'
              />
              {errors.content && (
                <p className='mt-2 text-sm text-red-500'>
                  {errors.content.message}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>发布设置</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='status'>状态</Label>
                <Select
                  value={watch('status')}
                  onValueChange={(value) =>
                    setValue('status', value as 'draft' | 'published')
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='draft'>草稿</SelectItem>
                    <SelectItem value='published'>已发布</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='category_id'>分类</Label>
                <Select
                  value={watch('category_id') || 'none'}
                  onValueChange={(value) =>
                    setValue('category_id', value === 'none' ? '' : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='选择分类' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='none'>无分类</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>标签</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex flex-wrap gap-2'>
                {tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant={
                      selectedTags.includes(tag.id) ? 'default' : 'outline'
                    }
                    className='cursor-pointer'
                    onClick={() => toggleTag(tag.id)}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
              {tags.length === 0 && (
                <p className='text-muted-foreground text-sm'>
                  暂无标签，请先创建标签
                </p>
              )}
            </CardContent>
          </Card>

          <div className='flex gap-2'>
            <Button type='submit' disabled={isSubmitting} className='flex-1'>
              {isSubmitting && (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              )}
              {article ? '更新文章' : '创建文章'}
            </Button>
            <Button
              type='button'
              variant='outline'
              onClick={() => router.push('/dashboard/articles')}
            >
              取消
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
