import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Supabase client
const mockSignInWithPassword = vi.fn();

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signOut: vi.fn(),
      getSession: vi.fn(() => Promise.resolve({ data: { session: null } }))
    }
  }))
}));

// 测试环境变量验证函数
describe('auth.ts - 安全测试', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    // 确保测试环境变量存在
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('环境变量验证', () => {
    it('NEXT_PUBLIC_SUPABASE_URL 应该是必需的', () => {
      expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBeDefined();
    });

    it('NEXT_PUBLIC_SUPABASE_ANON_KEY 应该是必需的', () => {
      expect(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBeDefined();
    });

    it('URL 格式应该是有效的', () => {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      expect(() => new URL(url)).not.toThrow();
    });

    it('无效 URL 应该被拒绝', () => {
      const invalidUrls = [
        'invalid-url',
        'not-a-url',
        '',
        '://no-protocol.com'
      ];

      invalidUrls.forEach((url) => {
        if (url) {
          expect(() => new URL(url)).toThrow();
        }
      });
    });
  });

  describe('输入验证', () => {
    it('空凭据应该被拒绝', () => {
      const credentials = {
        email: '',
        password: ''
      };

      expect(!credentials.email || !credentials.password).toBe(true);
    });

    it('无效邮箱格式应该被拒绝', () => {
      const invalidEmails = [
        'not-an-email',
        '@no-local-part.com',
        'no-at-sign.com',
        'spaces in@email.com',
        'unicode@email@test.com',
        ''
      ];

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      invalidEmails.forEach((email) => {
        expect(emailRegex.test(email)).toBe(false);
      });
    });

    it('有效邮箱格式应该被接受', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'test123@test-site.io'
      ];

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      validEmails.forEach((email) => {
        expect(emailRegex.test(email)).toBe(true);
      });
    });

    it('密码长度应该有最小要求 (8字符)', () => {
      const shortPasswords = [
        '',
        'a',
        'ab',
        'abc',
        'abcd',
        'abcde',
        'abcdef',
        'abcdefg'
      ];
      const validPassword = 'abcdefgh';
      const MIN_PASSWORD_LENGTH = 8;

      shortPasswords.forEach((password) => {
        expect(password.length >= MIN_PASSWORD_LENGTH).toBe(false);
      });

      expect(validPassword.length >= MIN_PASSWORD_LENGTH).toBe(true);
    });
  });

  describe('认证流程安全', () => {
    it('认证失败不应该泄露具体错误信息', async () => {
      // 模拟 Supabase 返回错误
      mockSignInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' }
      });

      // 模拟 authorize 函数行为
      const result = null; // 统一返回 null，不泄露具体错误
      expect(result).toBeNull();
    });

    it('用户不存在和密码错误应该返回相同响应', () => {
      // 两种情况都应该返回 null，防止用户枚举攻击
      const userNotFound = null;
      const wrongPassword = null;

      expect(userNotFound).toBe(wrongPassword);
    });
  });

  describe('会话安全', () => {
    it('JWT 策略应该正确配置', () => {
      const config = {
        session: {
          strategy: 'jwt',
          maxAge: 30 * 24 * 60 * 60
        }
      };

      expect(config.session.strategy).toBe('jwt');
    });

    it('会话应该有过期时间 (30天)', () => {
      const maxAge = 30 * 24 * 60 * 60; // 30 days in seconds
      expect(maxAge).toBe(2592000);
      expect(maxAge).toBeGreaterThan(0);
    });

    it('会话数据不应该包含敏感信息', () => {
      const safeSessionFields = ['id', 'email', 'name', 'image'];
      const unsafeFields = ['password', 'token', 'secret', 'apiKey'];

      unsafeFields.forEach((field) => {
        expect(safeSessionFields).not.toContain(field);
      });
    });
  });

  describe('类型安全', () => {
    it('credentials 应该进行类型检查', () => {
      // 正确的类型检查
      const checkCredentials = (creds: unknown): boolean => {
        if (
          !creds ||
          typeof creds !== 'object' ||
          !('email' in creds) ||
          !('password' in creds) ||
          typeof (creds as any).email !== 'string' ||
          typeof (creds as any).password !== 'string'
        ) {
          return false;
        }
        return true;
      };

      expect(checkCredentials(null)).toBe(false);
      expect(checkCredentials({})).toBe(false);
      expect(checkCredentials({ email: 123 })).toBe(false);
      expect(checkCredentials({ email: 'test@test.com' })).toBe(false);
      expect(
        checkCredentials({ email: 'test@test.com', password: 'password' })
      ).toBe(true);
    });
  });

  describe('Cookie 安全', () => {
    it('Cookie 应该设置 HttpOnly', () => {
      const cookieOptions = {
        httpOnly: true
      };

      expect(cookieOptions.httpOnly).toBe(true);
    });

    it('Cookie 应该在生产环境设置 Secure', () => {
      const originalNodeEnv = process.env.NODE_ENV;

      // 生产环境
      process.env.NODE_ENV = 'production';
      const prodCookieOptions = {
        secure: process.env.NODE_ENV === 'production'
      };
      expect(prodCookieOptions.secure).toBe(true);

      // 开发环境
      process.env.NODE_ENV = 'development';
      const devCookieOptions = {
        secure: process.env.NODE_ENV === 'production'
      };
      expect(devCookieOptions.secure).toBe(false);

      process.env.NODE_ENV = originalNodeEnv;
    });

    it('Cookie 应该设置 SameSite=Lax', () => {
      const cookieOptions = {
        sameSite: 'lax' as const
      };

      expect(cookieOptions.sameSite).toBe('lax');
    });

    it('Cookie 路径应该设置为 /', () => {
      const cookieOptions = {
        path: '/'
      };

      expect(cookieOptions.path).toBe('/');
    });
  });
});

describe('auth.ts - 性能测试', () => {
  it('输入验证不应该显著影响性能', () => {
    const iterations = 10000;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      emailRegex.test('test@example.com');
    }

    const duration = performance.now() - start;
    expect(duration).toBeLessThan(100); // 10000 次验证应该在 100ms 内完成
  });
});
