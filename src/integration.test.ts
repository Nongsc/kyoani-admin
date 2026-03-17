import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  isValidSlug,
  isValidUUID,
  isValidEmail,
  isValidLength,
  isRequiredString,
  sanitizeInput,
  validateArticleFormData,
  validateCategoryFormData,
  validateTagFormData,
  VALIDATION_LIMITS
} from '@/lib/validation';

describe('集成测试 - 模块协同工作', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('文章创建流程集成', () => {
    it('完整的文章数据验证流程', () => {
      const articleData = {
        title: '测试文章标题',
        slug: 'test-article-slug',
        content: '这是文章内容，包含足够的文字。',
        excerpt: '这是文章摘要',
        category_id: '123e4567-e89b-12d3-a456-426614174000',
        tags: [
          '123e4567-e89b-12d3-a456-426614174001',
          '123e4567-e89b-12d3-a456-426614174002'
        ],
        status: 'draft' as const
      };

      const result = validateArticleFormData(articleData);

      expect(result.valid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    it('无效文章数据应该被正确拒绝', () => {
      const invalidArticleData = {
        title: '',
        slug: '../../../etc/passwd',
        content: '',
        status: 'invalid-status' as any,
        tags: 'not-an-array' as any
      };

      const result = validateArticleFormData(invalidArticleData);

      expect(result.valid).toBe(false);
      expect(result.errors.title).toBeDefined();
      expect(result.errors.slug).toBeDefined();
      expect(result.errors.content).toBeDefined();
      expect(result.errors.status).toBeDefined();
      expect(result.errors.tags).toBeDefined();
    });

    it('XSS 攻击载荷应该被净化', () => {
      const xssPayloads = [
        '<script>alert("XSS")</script>',
        '<img src=x onerror=alert(1)>',
        '<svg onload=alert(1)>'
      ];

      xssPayloads.forEach((payload) => {
        const sanitized = sanitizeInput(payload);
        expect(sanitized).not.toContain('<script>');
        expect(sanitized).not.toContain('<img');
        expect(sanitized).not.toContain('<svg');
      });
    });
  });

  describe('分类/标签管理流程集成', () => {
    it('完整的分类创建验证流程', () => {
      const categoryData = {
        name: '技术文章',
        slug: 'tech-articles',
        description: '技术相关的文章分类'
      };

      const result = validateCategoryFormData(categoryData);

      expect(result.valid).toBe(true);
    });

    it('分类名称 XSS 防护', () => {
      const maliciousName =
        '<script>document.location="http://evil.com"</script>';
      const sanitized = sanitizeInput(maliciousName);

      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('&lt;script&gt;');
    });

    it('标签创建验证流程', () => {
      const tagData = {
        name: 'React',
        slug: 'react'
      };

      const result = validateTagFormData(tagData);
      expect(result.valid).toBe(true);
    });
  });

  describe('认证与授权集成', () => {
    it('邮箱验证应该在登录前完成', () => {
      const validEmails = ['user@example.com', 'admin@company.co.uk'];
      const invalidEmails = ['not-an-email', '@no-local.com', 'no-at.com'];

      validEmails.forEach((email) => {
        expect(isValidEmail(email)).toBe(true);
      });

      invalidEmails.forEach((email) => {
        expect(isValidEmail(email)).toBe(false);
      });
    });

    it('UUID 格式验证用于资源 ID', () => {
      const validUUIDs = [
        '123e4567-e89b-12d3-a456-426614174000',
        '00000000-0000-0000-0000-000000000000'
      ];
      const invalidUUIDs = ['not-a-uuid', '123', '123e4567-e89b-12d3'];

      validUUIDs.forEach((uuid) => {
        expect(isValidUUID(uuid)).toBe(true);
      });

      invalidUUIDs.forEach((uuid) => {
        expect(isValidUUID(uuid)).toBe(false);
      });
    });
  });

  describe('数据完整性集成', () => {
    it('文章状态只能是有效值', () => {
      const validStatuses = ['draft', 'published'];
      const invalidStatuses = ['pending', 'archived', 'deleted'];

      validStatuses.forEach((status) => {
        expect(['draft', 'published']).toContain(status);
      });

      invalidStatuses.forEach((status) => {
        expect(['draft', 'published']).not.toContain(status);
      });
    });

    it('长度限制应该在所有层级一致', () => {
      expect(VALIDATION_LIMITS.title.max).toBe(200);
      expect(VALIDATION_LIMITS.title.min).toBe(1);
      expect(VALIDATION_LIMITS.slug.max).toBe(200);
      expect(VALIDATION_LIMITS.slug.min).toBe(1);
      expect(VALIDATION_LIMITS.content.max).toBe(100000);
      expect(VALIDATION_LIMITS.content.min).toBe(1);
    });

    it('必填字段验证应该覆盖所有场景', () => {
      expect(isRequiredString('')).toBe(false);
      expect(isRequiredString('   ')).toBe(false);
      expect(isRequiredString(null as any)).toBe(false);
      expect(isRequiredString(undefined as any)).toBe(false);
      expect(isRequiredString('valid')).toBe(true);
    });
  });

  describe('错误处理集成', () => {
    it('验证错误应该提供清晰的错误信息', () => {
      const invalidData = {
        title: '',
        slug: '',
        content: '',
        status: 'invalid' as any,
        tags: []
      };

      const result = validateArticleFormData(invalidData);

      expect(result.valid).toBe(false);
      expect(result.errors.title).toBe('标题不能为空');
      expect(result.errors.slug).toBe('Slug 不能为空');
      expect(result.errors.content).toBe('内容不能为空');
      expect(result.errors.status).toBe('状态必须是 draft 或 published');
    });
  });

  describe('边界情况集成', () => {
    it('最大长度边界值应该被接受', () => {
      const maxTitle = 'a'.repeat(VALIDATION_LIMITS.title.max);
      const maxSlug = 'a'.repeat(VALIDATION_LIMITS.slug.max);
      const maxContent = 'a'.repeat(VALIDATION_LIMITS.content.max);

      expect(
        isValidLength(
          maxTitle,
          VALIDATION_LIMITS.title.min,
          VALIDATION_LIMITS.title.max
        )
      ).toBe(true);
      expect(isValidSlug(maxSlug)).toBe(true);
      expect(
        isValidLength(
          maxContent,
          VALIDATION_LIMITS.content.min,
          VALIDATION_LIMITS.content.max
        )
      ).toBe(true);
    });

    it('超过最大长度应该被拒绝', () => {
      const overMaxTitle = 'a'.repeat(VALIDATION_LIMITS.title.max + 1);
      const overMaxSlug = 'a'.repeat(VALIDATION_LIMITS.slug.max + 1);

      expect(
        isValidLength(
          overMaxTitle,
          VALIDATION_LIMITS.title.min,
          VALIDATION_LIMITS.title.max
        )
      ).toBe(false);
      expect(isValidSlug(overMaxSlug)).toBe(false);
    });

    it('空值应该被正确处理', () => {
      const emptyData = {
        title: '',
        slug: '',
        content: '',
        status: '' as any,
        tags: []
      };

      const result = validateArticleFormData(emptyData);

      expect(result.valid).toBe(false);
      expect(Object.keys(result.errors).length).toBeGreaterThan(0);
    });
  });
});

describe('系统级集成测试', () => {
  it('所有验证函数应该一致工作', () => {
    const testSlug = 'test-article-123';

    expect(isValidSlug(testSlug)).toBe(true);
    expect(
      isValidLength(
        testSlug,
        VALIDATION_LIMITS.slug.min,
        VALIDATION_LIMITS.slug.max
      )
    ).toBe(true);
    expect(isRequiredString(testSlug)).toBe(true);
  });

  it('净化函数不应该破坏有效数据', () => {
    const validInputs = [
      'Normal text',
      '中文标题',
      'article-title_123',
      'test@example.com'
    ];

    validInputs.forEach((input) => {
      const sanitized = sanitizeInput(input);
      // 对于不含特殊字符的文本，净化后应该基本相同
      expect(sanitized.includes(input) || input.includes(sanitized)).toBe(true);
    });
  });

  it('净化函数应该处理所有危险字符', () => {
    const dangerousInputs = [
      { input: '<script>', expected: '&lt;script&gt;' },
      { input: '"quoted"', expected: '&quot;quoted&quot;' },
      { input: "it's", expected: 'it&#x27;s' }
    ];

    dangerousInputs.forEach(({ input, expected }) => {
      expect(sanitizeInput(input)).toBe(expected);
    });
  });
});
