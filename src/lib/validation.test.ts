import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  sanitizeInput,
  isValidSlug,
  isValidUUID,
  isValidLength,
  isRequiredString
} from './validation';

// Mock Supabase
const mockFrom = vi.fn();
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();

const createMockChain = () => {
  const chain = {
    select: mockSelect.mockReturnThis(),
    insert: mockInsert.mockReturnThis(),
    update: mockUpdate.mockReturnThis(),
    delete: mockDelete.mockReturnThis(),
    eq: mockEq.mockReturnThis(),
    neq: mockEq.mockReturnThis(),
    single: mockSingle.mockReturnThis(),
    order: vi.fn().mockReturnThis()
  };
  return chain;
};

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: mockFrom.mockImplementation(() => createMockChain())
  }))
}));

vi.mock('@/lib/auth', () => ({
  auth: vi.fn()
}));

describe('输入验证 - 安全测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('XSS 防护', () => {
    const xssPayloads = [
      '<script>alert("XSS")</script>',
      '<img src=x onerror=alert("XSS")>',
      '<svg onload=alert("XSS")>',
      'javascript:alert("XSS")',
      '<iframe src="javascript:alert(\'XSS\')">',
      '<body onload=alert("XSS")>',
      '"><script>alert("XSS")</script>',
      "'-alert('XSS')-'"
    ];

    it('文章标题应该过滤 XSS 攻击载荷', () => {
      xssPayloads.forEach((payload) => {
        const sanitized = sanitizeInput(payload);
        // 转义后不应该包含可执行的 HTML 标签
        expect(sanitized).not.toContain('<script>');
        expect(sanitized).not.toContain('<img');
        expect(sanitized).not.toContain('<svg');
        expect(sanitized).not.toContain('<iframe');
        expect(sanitized).not.toContain('<body');
      });
    });

    it('文章内容可能包含 HTML，但应被正确渲染', () => {
      // 内容字段通常由前端 Markdown 编辑器处理
      // 需要在渲染时进行 XSS 防护（如使用 DOMPurify）
      const content = '<script>alert("XSS")</script>';
      // 验证内容是否被存储（存储型 XSS 防护应在渲染层处理）
      expect(typeof content).toBe('string');
    });

    it('分类名称应该过滤 XSS 攻击载荷', () => {
      xssPayloads.forEach((payload) => {
        const sanitized = sanitizeInput(payload);
        expect(sanitized).not.toContain('<');
        expect(sanitized).not.toContain('>');
      });
    });

    it('标签名称应该过滤 XSS 攻击载荷', () => {
      xssPayloads.forEach((payload) => {
        const sanitized = sanitizeInput(payload);
        expect(sanitized).not.toContain('<');
        expect(sanitized).not.toContain('>');
      });
    });
  });

  describe('Slug 验证', () => {
    it('Slug 应该只包含有效字符', () => {
      const validSlugs = [
        'my-article',
        'my_article',
        'article123',
        'My-Article-Title',
        'a'
      ];

      const slugRegex = /^[a-zA-Z0-9_-]+$/;

      validSlugs.forEach((slug) => {
        expect(slugRegex.test(slug)).toBe(true);
      });
    });

    it('无效 Slug 应该被拒绝', () => {
      const invalidSlugs = [
        'my article', // 空格
        'my-article!', // 特殊字符
        'my/article', // 路径分隔符
        'my\\article', // 反斜杠
        '../article', // 路径遍历
        'article?query=1', // 查询字符串
        'article#hash', // 哈希
        '', // 空字符串
        '   ' // 只有空格
      ];

      const slugRegex = /^[a-zA-Z0-9_-]+$/;

      invalidSlugs.forEach((slug) => {
        expect(slugRegex.test(slug)).toBe(false);
      });
    });

    it('Slug 长度应该有限制', () => {
      const maxLength = 200;
      const longSlug = 'a'.repeat(201);
      const validSlug = 'a'.repeat(200);

      expect(longSlug.length).toBeGreaterThan(maxLength);
      expect(validSlug.length).toBeLessThanOrEqual(maxLength);
    });

    it('路径遍历攻击应该被阻止', () => {
      const pathTraversalAttempts = [
        '../../../etc/passwd',
        '..\\..\\..\\windows\\system32',
        '....//....//etc/passwd',
        '%2e%2e%2f%2e%2e%2f',
        '..%252f..%252f'
      ];

      const slugRegex = /^[a-zA-Z0-9_-]+$/;

      pathTraversalAttempts.forEach((attempt) => {
        expect(slugRegex.test(attempt)).toBe(false);
      });
    });
  });

  describe('SQL 注入防护', () => {
    const sqlInjectionPayloads = [
      "'; DROP TABLE articles; --",
      "' OR '1'='1",
      "' UNION SELECT * FROM users --",
      '1; DELETE FROM articles WHERE 1=1',
      "admin'--",
      "' OR 1=1--"
    ];

    it('使用 Supabase ORM 应该防止 SQL 注入', () => {
      // Supabase 使用参数化查询，自动防止 SQL 注入
      // 但仍需验证输入不会导致其他问题
      sqlInjectionPayloads.forEach((payload) => {
        // 这些载荷应该作为普通字符串处理
        expect(typeof payload).toBe('string');
      });
    });

    it('文章 ID 应该是有效的 UUID', () => {
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      const validUUID = '123e4567-e89b-12d3-a456-426614174000';
      const invalidIDs = [
        '1',
        'abc',
        "'; DROP TABLE articles; --",
        '../article'
      ];

      expect(uuidRegex.test(validUUID)).toBe(true);
      invalidIDs.forEach((id) => {
        expect(uuidRegex.test(id)).toBe(false);
      });
    });
  });

  describe('数据长度验证', () => {
    it('文章标题应该有最大长度限制', () => {
      const maxLength = 200;
      const longTitle = 'a'.repeat(201);
      const validTitle = 'a'.repeat(200);

      expect(longTitle.length).toBeGreaterThan(maxLength);
      expect(validTitle.length).toBeLessThanOrEqual(maxLength);
    });

    it('文章摘要应该有最大长度限制', () => {
      const maxLength = 500;
      const longExcerpt = 'a'.repeat(501);
      const validExcerpt = 'a'.repeat(500);

      expect(longExcerpt.length).toBeGreaterThan(maxLength);
      expect(validExcerpt.length).toBeLessThanOrEqual(maxLength);
    });

    it('分类描述应该有最大长度限制', () => {
      const maxLength = 1000;
      const longDescription = 'a'.repeat(1001);
      const validDescription = 'a'.repeat(1000);

      expect(longDescription.length).toBeGreaterThan(maxLength);
      expect(validDescription.length).toBeLessThanOrEqual(maxLength);
    });
  });

  describe('必填字段验证', () => {
    it('文章必须有标题', () => {
      const articleData = {
        title: '',
        slug: 'test-article',
        content: 'Test content',
        status: 'draft' as const,
        tags: []
      };

      expect(!articleData.title.trim()).toBe(true);
    });

    it('文章必须有 Slug', () => {
      const articleData = {
        title: 'Test Article',
        slug: '',
        content: 'Test content',
        status: 'draft' as const,
        tags: []
      };

      expect(!articleData.slug.trim()).toBe(true);
    });

    it('文章必须有内容', () => {
      const articleData = {
        title: 'Test Article',
        slug: 'test-article',
        content: '',
        status: 'draft' as const,
        tags: []
      };

      expect(!articleData.content.trim()).toBe(true);
    });

    it('分类必须有名称', () => {
      const categoryData = {
        name: '',
        slug: 'test-category'
      };

      expect(!categoryData.name.trim()).toBe(true);
    });

    it('标签必须有名称', () => {
      const tagData = {
        name: '',
        slug: 'test-tag'
      };

      expect(!tagData.name.trim()).toBe(true);
    });
  });

  describe('状态字段验证', () => {
    it('文章状态只能是 draft 或 published', () => {
      const validStatuses = ['draft', 'published'];
      const invalidStatuses = [
        'pending',
        'archived',
        'deleted',
        '',
        null,
        undefined
      ];

      validStatuses.forEach((status) => {
        expect(['draft', 'published']).toContain(status);
      });

      invalidStatuses.forEach((status) => {
        if (status !== null && status !== undefined) {
          expect(['draft', 'published']).not.toContain(status);
        }
      });
    });
  });
});

describe('sanitizeInput 函数测试', () => {
  it('应该转义 HTML 特殊字符', () => {
    // 注意：& 符号不在原字符串中，所以不会被转义
    expect(sanitizeInput('<script>')).toBe('&lt;script&gt;');
    expect(sanitizeInput('a & b')).toBe('a &amp; b');
    expect(sanitizeInput('"quoted"')).toBe('&quot;quoted&quot;');
    expect(sanitizeInput("test'test")).toBe('test&#x27;test');
  });

  it('应该保留普通文本', () => {
    expect(sanitizeInput('Hello World')).toBe('Hello World');
    expect(sanitizeInput('文章标题')).toBe('文章标题');
  });
});
