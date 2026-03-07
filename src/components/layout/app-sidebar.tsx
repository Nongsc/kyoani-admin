'use client';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { navItems } from '@/config/nav-config';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useSession, signOut } from 'next-auth/react';
import {
  IconBell,
  IconChevronRight,
  IconChevronsDown,
  IconCreditCard,
  IconLogout,
  IconUserCircle,
  IconArticle,
  IconFolder,
  IconTags,
  IconPhoto,
  IconSettings
} from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';
import { Icons } from '../icons';

// Blog admin navigation items
const blogNavItems = [
  {
    title: '仪表盘',
    url: '/dashboard',
    icon: 'dashboard'
  },
  {
    title: '文章管理',
    url: '/dashboard/articles',
    icon: 'article',
    items: [
      { title: '文章列表', url: '/dashboard/articles' },
      { title: '新建文章', url: '/dashboard/articles/new' }
    ]
  },
  {
    title: '分类管理',
    url: '/dashboard/categories',
    icon: 'folder'
  },
  {
    title: '标签管理',
    url: '/dashboard/tags',
    icon: 'tags'
  },
  {
    title: '媒体管理',
    url: '/dashboard/media',
    icon: 'photo'
  },
  {
    title: '站点设置',
    url: '/dashboard/settings',
    icon: 'settings'
  }
];

export default function AppSidebar() {
  const pathname = usePathname();
  const { isOpen } = useMediaQuery();
  const { data: session } = useSession();
  const router = useRouter();

  React.useEffect(() => {
    // Side effects based on sidebar state changes
  }, [isOpen]);

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size='lg' asChild>
              <Link href='/dashboard'>
                <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground'>
                  <IconArticle className='size-4' />
                </div>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-semibold'>博客管理</span>
                  <span className='truncate text-xs text-muted-foreground'>
                    管理后台
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className='overflow-x-hidden'>
        <SidebarGroup>
          <SidebarGroupLabel>导航菜单</SidebarGroupLabel>
          <SidebarMenu>
            {blogNavItems.map((item) => {
              const Icon = item.icon === 'dashboard' ? Icons.logo :
                          item.icon === 'article' ? IconArticle :
                          item.icon === 'folder' ? IconFolder :
                          item.icon === 'tags' ? IconTags :
                          item.icon === 'photo' ? IconPhoto :
                          IconSettings;
              return item?.items && item?.items?.length > 0 ? (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={pathname.startsWith(item.url)}
                  className='group/collapsible'
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={item.title}
                        isActive={pathname === item.url}
                      >
                        <Icon className='size-4' />
                        <span>{item.title}</span>
                        <IconChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={pathname === subItem.url}
                            >
                              <Link href={subItem.url}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ) : (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={pathname === item.url}
                  >
                    <Link href={item.url}>
                      <Icon className='size-4' />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size='lg'
                  className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
                >
                  <Avatar className='h-8 w-8 rounded-lg'>
                    <AvatarImage src={session?.user?.image || ''} alt={session?.user?.name || ''} />
                    <AvatarFallback className='rounded-lg'>
                      {session?.user?.name?.charAt(0).toUpperCase() || session?.user?.email?.charAt(0).toUpperCase() || 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <div className='grid flex-1 text-left text-sm leading-tight'>
                    <span className='truncate font-semibold'>
                      {session?.user?.name || 'Admin'}
                    </span>
                    <span className='truncate text-xs text-muted-foreground'>
                      {session?.user?.email}
                    </span>
                  </div>
                  <IconChevronsDown className='ml-auto size-4' />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
                side='bottom'
                align='end'
                sideOffset={4}
              >
                <DropdownMenuLabel className='p-0 font-normal'>
                  <div className='flex items-center gap-2 px-1 py-1.5'>
                    <Avatar className='h-8 w-8 rounded-lg'>
                      <AvatarImage src={session?.user?.image || ''} alt={session?.user?.name || ''} />
                      <AvatarFallback className='rounded-lg'>
                        {session?.user?.name?.charAt(0).toUpperCase() || session?.user?.email?.charAt(0).toUpperCase() || 'A'}
                      </AvatarFallback>
                    </Avatar>
                    <div className='grid flex-1 text-left text-sm leading-tight'>
                      <span className='truncate font-semibold'>
                        {session?.user?.name || 'Admin'}
                      </span>
                      <span className='truncate text-xs text-muted-foreground'>
                        {session?.user?.email}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() => router.push('/dashboard/profile')}
                  >
                    <IconUserCircle className='mr-2 h-4 w-4' />
                    个人资料
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push('/dashboard/settings')}
                  >
                    <IconSettings className='mr-2 h-4 w-4' />
                    设置
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => signOut({ callbackUrl: '/sign-in' })}
                  className='text-red-600 focus:text-red-600'
                >
                  <IconLogout className='mr-2 h-4 w-4' />
                  退出登录
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
