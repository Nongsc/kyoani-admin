import { auth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  IconArticle,
  IconFolder,
  IconTags,
  IconPhoto,
  IconClock,
  IconCheck,
  IconFile
} from '@tabler/icons-react';
import Link from 'next/link';

export default async function Dashboard() {
  const session = await auth();

  if (!session) {
    return redirect('/sign-in');
  }

  const supabase = await createClient();

  // 获取统计数据
  const [
    { count: articleCount },
    { count: categoryCount },
    { count: tagCount },
    { count: mediaCount },
    { count: publishedCount },
    { count: draftCount },
    { data: recentArticles }
  ] = await Promise.all([
    supabase.from('articles').select('*', { count: 'exact', head: true }),
    supabase.from('categories').select('*', { count: 'exact', head: true }),
    supabase.from('tags').select('*', { count: 'exact', head: true }),
    supabase.from('media').select('*', { count: 'exact', head: true }),
    supabase.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
    supabase
      .from('articles')
      .select('id, title, slug, status, created_at, categories(name)')
      .order('created_at', { ascending: false })
      .limit(5)
  ]);

  const stats = [
    {
      title: '文章总数',
      value: articleCount || 0,
      icon: IconArticle,
      href: '/dashboard/articles',
      color: 'text-blue-600'
    },
    {
      title: '分类数量',
      value: categoryCount || 0,
      icon: IconFolder,
      href: '/dashboard/categories',
      color: 'text-green-600'
    },
    {
      title: '标签数量',
      value: tagCount || 0,
      icon: IconTags,
      href: '/dashboard/tags',
      color: 'text-purple-600'
    },
    {
      title: '媒体文件',
      value: mediaCount || 0,
      icon: IconPhoto,
      href: '/dashboard/media',
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold">仪表盘</h1>
        <p className="text-muted-foreground">博客内容概览</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* 文章状态与最近文章 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* 文章状态统计 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">文章状态</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconCheck className="h-4 w-4 text-green-600" />
                <span>已发布</span>
              </div>
              <Badge variant="secondary">{publishedCount || 0}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconFile className="h-4 w-4 text-yellow-600" />
                <span>草稿</span>
              </div>
              <Badge variant="secondary">{draftCount || 0}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* 最近文章 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">最近文章</CardTitle>
          </CardHeader>
          <CardContent>
            {recentArticles && recentArticles.length > 0 ? (
              <div className="space-y-4">
                {recentArticles.map((article: any) => (
                  <div
                    key={article.id}
                    className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/dashboard/articles/${article.id}`}
                        className="font-medium hover:text-primary truncate block"
                      >
                        {article.title}
                      </Link>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <IconClock className="h-3 w-3" />
                        <span>
                          {new Date(article.created_at).toLocaleDateString('zh-CN')}
                        </span>
                        {article.categories?.name && (
                          <>
                            <span>·</span>
                            <span>{article.categories.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <Badge
                      variant={article.status === 'published' ? 'default' : 'secondary'}
                    >
                      {article.status === 'published' ? '已发布' : '草稿'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-4">
                暂无文章
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
