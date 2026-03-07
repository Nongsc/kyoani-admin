"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, Mail, Lock, Github } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("邮箱或密码错误");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError("登录失败，请稍后重试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex flex-col justify-center bg-gradient-to-br from-sky-100 via-blue-50 to-violet-100 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-800 p-10">
        <div className="space-y-6">
          <blockquote className="space-y-2">
            <p className="text-base text-muted-foreground leading-relaxed">
              若是在清朗的夜晚，那便如实称赞她的美丽。
            </p>
            <p className="text-base text-muted-foreground leading-relaxed">
              若是在阴雨的日子，那便讲关于星座的神话。
            </p>
            <p className="text-base text-muted-foreground leading-relaxed">
              若那是一颗二百年一现的彗星到来的日子，那便和她一起仰望星空，细述曾经。
            </p>
            <footer className="text-sm font-medium pt-2">
              —— 晓佳奈 《紫罗兰永恒花园》
            </footer>
          </blockquote>
          
          <div className="aspect-video rounded-xl overflow-hidden">
            <img 
              src="https://xgmqehljorvpdrmykxyv.supabase.co/storage/v1/object/public/media/1772879158761-1399937.jpg"
              alt="紫罗兰永恒花园"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        
      </div>
      
      {/* Right Side - Login Form */}
      <div className="flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-2xl font-bold">欢迎回来</h1>
            <p className="text-muted-foreground">
              请输入您的账号信息登录
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">邮箱</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="请输入密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  登录中...
                </>
              ) : (
                "登录"
              )}
            </Button>
          </form>
          
        <div className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            首次使用请在 Supabase 中创建用户
          </p>
          <p className="text-xs text-muted-foreground">
            基于 Next.js 和 shadcn/ui 构建的博客管理后台
          </p>
        </div>
          

        </div>
      </div>
    </div>
  );
}
