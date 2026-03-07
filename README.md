# Kyoani Blog Admin

博客管理后台，基于 [next-shadcn-dashboard-starter](https://github.com/Kiranism/next-shadcn-dashboard-starter) 模板构建。

## 功能特性

- **文章管理** - 创建、编辑、发布文章，支持 Markdown 编辑器
- **分类管理** - 创建和管理文章分类
- **标签管理** - 创建和管理文章标签
- **媒体管理** - 上传和管理图片、文件（Supabase Storage）
- **站点设置** - 配置网站标题、描述、关于页面等信息
- **认证系统** - 基于 Supabase Auth 的用户认证

## 技术栈

| 技术 | 说明 |
|------|------|
| [Next.js 16](https://nextjs.org) | React 框架 (App Router) |
| [shadcn/ui](https://ui.shadcn.com) | UI 组件库 |
| [Tailwind CSS v4](https://tailwindcss.com) | 样式框架 |
| [Supabase](https://supabase.com) | 数据库 + 认证 + 存储 |
| [NextAuth.js](https://authjs.dev) | 认证框架 |
| [React Hook Form](https://react-hook-form.com) | 表单处理 |
| [Zod](https://zod.dev) | 数据验证 |

## 目录结构

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   │   ├── auth/          # NextAuth 认证
│   │   └── upload/        # 文件上传
│   ├── dashboard/         # 管理后台页面
│   │   ├── articles/      # 文章管理
│   │   ├── categories/    # 分类管理
│   │   ├── tags/          # 标签管理
│   │   ├── media/         # 媒体管理
│   │   └── settings/      # 站点设置
│   └── sign-in/           # 登录页面
├── features/              # 功能模块
│   ├── articles/          # 文章功能
│   ├── categories/        # 分类功能
│   ├── tags/              # 标签功能
│   ├── media/             # 媒体功能
│   └── settings/          # 设置功能
├── lib/                   # 工具库
│   ├── auth.ts           # 认证配置
│   └── supabase/         # Supabase 客户端
└── types/                 # 类型定义
```

## 快速开始

### 1. 克隆仓库

```bash
git clone https://github.com/你的用户名/blog-admin.git
cd blog-admin
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

创建 `.env.local` 文件：

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# NextAuth.js
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# Sentry (可选)
NEXT_PUBLIC_SENTRY_DISABLED=true
```

### 4. 运行开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 创建管理员账户

在 Supabase Dashboard 中创建用户：

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 **Authentication > Users**
4. 点击 **Add user** 创建用户
5. 使用创建的邮箱和密码登录管理后台

## 部署到 Vercel

1. 将代码推送到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 配置环境变量（同上）
4. 部署完成后，更新 `NEXTAUTH_URL` 为生产域名

## 相关项目

- **博客前端**: [blog-frontend](https://github.com/你的用户名/blog-frontend)

---

## 致谢

本项目基于 [next-shadcn-dashboard-starter](https://github.com/Kiranism/next-shadcn-dashboard-starter) 模板开发，感谢原作者 [Kiranism](https://github.com/Kiranism) 的开源贡献。

<p align="center">
  <a href="https://github.com/Kiranism/next-shadcn-dashboard-starter/stargazers">
    <img src="https://img.shields.io/github/stars/Kiranism/next-shadcn-dashboard-starter?style=social" alt="GitHub stars" />
  </a>
  <a href="https://github.com/Kiranism/next-shadcn-dashboard-starter/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/Kiranism/next-shadcn-dashboard-starter" alt="MIT License" />
  </a>
</p>

### ⭐ 支持原作者

如果你觉得原模板有帮助，请给 [next-shadcn-dashboard-starter](https://github.com/Kiranism/next-shadcn-dashboard-starter) 一个 Star ⭐

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-support-yellow?style=flat-square&logo=buymeacoffee)](https://buymeacoffee.com/kir4n)
