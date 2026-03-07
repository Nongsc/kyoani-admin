'use client';

import { useSession } from 'next-auth/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function ProfileViewPage() {
  const { data: session } = useSession();

  return (
    <div className='flex w-full flex-col p-4 gap-6'>
      <Card>
        <CardHeader>
          <CardTitle>个人资料</CardTitle>
          <CardDescription>查看和管理您的账户信息</CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='flex items-center gap-4'>
            <Avatar className='h-20 w-20'>
              <AvatarImage src={session?.user?.image || ''} alt={session?.user?.name || ''} />
              <AvatarFallback className='text-2xl'>
                {session?.user?.name?.charAt(0).toUpperCase() || session?.user?.email?.charAt(0).toUpperCase() || 'A'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className='text-lg font-semibold'>{session?.user?.name || '用户'}</h3>
              <p className='text-sm text-muted-foreground'>{session?.user?.email}</p>
            </div>
          </div>
          
          <div className='grid gap-4'>
            <div className='grid gap-2'>
              <Label htmlFor='name'>用户名</Label>
              <Input 
                id='name' 
                value={session?.user?.name || ''} 
                disabled 
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='email'>邮箱</Label>
              <Input 
                id='email' 
                value={session?.user?.email || ''} 
                disabled 
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
