import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 受保护的路由前缀
const PROTECTED_PATHS = ['/dashboard'];

// 公开路由（无需认证）
const PUBLIC_PATHS = ['/sign-in', '/api/auth'];

/**
 * 检查路径是否匹配
 */
function isMatch(pathname: string, paths: string[]): boolean {
  return paths.some((path) => pathname.startsWith(path));
}

/**
 * 认证代理
 * 保护 /dashboard 路由，未认证用户重定向到登录页
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 公开路由直接放行
  if (isMatch(pathname, PUBLIC_PATHS)) {
    return NextResponse.next();
  }

  // 检查是否为受保护路由
  if (!isMatch(pathname, PROTECTED_PATHS)) {
    return NextResponse.next();
  }

  // 检查会话 Cookie（NextAuth.js 默认使用 next-auth.session-token）
  const sessionToken =
    request.cookies.get('next-auth.session-token')?.value ||
    request.cookies.get('__Secure-next-auth.session-token')?.value;

  // 未登录则重定向到登录页
  if (!sessionToken) {
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

// 配置匹配的路由
export const config = {
  matcher: [
    /*
     * 匹配所有路径，除了：
     * - _next/static (静态文件)
     * - _next/image (图片优化文件)
     * - favicon.ico (网站图标)
     * - 公开的静态资源
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'
  ]
};
