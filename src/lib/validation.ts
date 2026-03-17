/**
 * 输入验证工具函数
 */

// Slug 验证正则：只允许字母、数字、下划线和连字符
const SLUG_REGEX = /^[a-zA-Z0-9_-]+$/;

// UUID 验证正则
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// 邮箱验证正则
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 长度限制
export const VALIDATION_LIMITS = {
  title: { min: 1, max: 200 },
  slug: { min: 1, max: 200 },
  excerpt: { min: 0, max: 500 },
  content: { min: 1, max: 100000 },
  name: { min: 1, max: 100 },
  description: { min: 0, max: 1000 }
} as const;

// 文章状态
export const ARTICLE_STATUSES = ['draft', 'published'] as const;
export type ArticleStatus = (typeof ARTICLE_STATUSES)[number];

/**
 * 验证 Slug 格式
 */
export function isValidSlug(slug: string): boolean {
  if (!slug || typeof slug !== 'string') return false;

  const trimmed = slug.trim();
  if (
    trimmed.length < VALIDATION_LIMITS.slug.min ||
    trimmed.length > VALIDATION_LIMITS.slug.max
  ) {
    return false;
  }

  return SLUG_REGEX.test(trimmed);
}

/**
 * 验证 UUID 格式
 */
export function isValidUUID(uuid: string): boolean {
  if (!uuid || typeof uuid !== 'string') return false;
  return UUID_REGEX.test(uuid.trim());
}

/**
 * 验证邮箱格式
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  return EMAIL_REGEX.test(email.trim());
}

/**
 * 验证字符串长度
 */
export function isValidLength(
  value: string,
  min: number,
  max: number
): boolean {
  if (typeof value !== 'string') return false;
  const length = value.trim().length;
  return length >= min && length <= max;
}

/**
 * 验证必填字符串
 */
export function isRequiredString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * 验证文章状态
 */
export function isValidArticleStatus(status: string): status is ArticleStatus {
  return ARTICLE_STATUSES.includes(status as ArticleStatus);
}

/**
 * 净化输入（转义 HTML 特殊字符）
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';

  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * 净化 Slug（移除非法字符）
 */
export function sanitizeSlug(slug: string): string {
  if (typeof slug !== 'string') return '';

  return slug
    .toLowerCase()
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, VALIDATION_LIMITS.slug.max);
}

/**
 * 验证文章表单数据
 */
export interface ArticleFormData {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  cover_image?: string;
  category_id?: string;
  tags: string[];
  status: ArticleStatus;
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export function validateArticleFormData(
  data: Partial<ArticleFormData>
): ValidationResult {
  const errors: Record<string, string> = {};

  // 标题验证
  if (!isRequiredString(data.title)) {
    errors.title = '标题不能为空';
  } else if (
    !isValidLength(
      data.title,
      VALIDATION_LIMITS.title.min,
      VALIDATION_LIMITS.title.max
    )
  ) {
    errors.title = `标题长度必须在 ${VALIDATION_LIMITS.title.min}-${VALIDATION_LIMITS.title.max} 字符之间`;
  }

  // Slug 验证
  if (!isRequiredString(data.slug)) {
    errors.slug = 'Slug 不能为空';
  } else if (!isValidSlug(data.slug)) {
    errors.slug = 'Slug 只能包含字母、数字、下划线和连字符';
  }

  // 内容验证
  if (!isRequiredString(data.content)) {
    errors.content = '内容不能为空';
  } else if (
    !isValidLength(
      data.content,
      VALIDATION_LIMITS.content.min,
      VALIDATION_LIMITS.content.max
    )
  ) {
    errors.content = `内容长度必须在 ${VALIDATION_LIMITS.content.min}-${VALIDATION_LIMITS.content.max} 字符之间`;
  }

  // 摘要验证（可选）
  if (
    data.excerpt &&
    !isValidLength(data.excerpt, 0, VALIDATION_LIMITS.excerpt.max)
  ) {
    errors.excerpt = `摘要长度不能超过 ${VALIDATION_LIMITS.excerpt.max} 字符`;
  }

  // 状态验证
  if (!data.status || !isValidArticleStatus(data.status)) {
    errors.status = '状态必须是 draft 或 published';
  }

  // 分类 ID 验证（可选）
  if (data.category_id && !isValidUUID(data.category_id)) {
    errors.category_id = '分类 ID 格式无效';
  }

  // 标签验证
  if (!Array.isArray(data.tags)) {
    errors.tags = '标签必须是数组';
  } else {
    const invalidTags = data.tags.filter((tag) => !isValidUUID(tag));
    if (invalidTags.length > 0) {
      errors.tags = '标签 ID 格式无效';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * 验证分类/标签表单数据
 */
export interface CategoryFormData {
  name: string;
  slug: string;
  description?: string;
}

export interface TagFormData {
  name: string;
  slug: string;
}

export function validateCategoryFormData(
  data: Partial<CategoryFormData>
): ValidationResult {
  const errors: Record<string, string> = {};

  if (!isRequiredString(data.name)) {
    errors.name = '名称不能为空';
  } else if (
    !isValidLength(
      data.name,
      VALIDATION_LIMITS.name.min,
      VALIDATION_LIMITS.name.max
    )
  ) {
    errors.name = `名称长度必须在 ${VALIDATION_LIMITS.name.min}-${VALIDATION_LIMITS.name.max} 字符之间`;
  }

  if (!isRequiredString(data.slug)) {
    errors.slug = 'Slug 不能为空';
  } else if (!isValidSlug(data.slug)) {
    errors.slug = 'Slug 只能包含字母、数字、下划线和连字符';
  }

  if (
    data.description &&
    !isValidLength(data.description, 0, VALIDATION_LIMITS.description.max)
  ) {
    errors.description = `描述长度不能超过 ${VALIDATION_LIMITS.description.max} 字符`;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateTagFormData(
  data: Partial<TagFormData>
): ValidationResult {
  const errors: Record<string, string> = {};

  if (!isRequiredString(data.name)) {
    errors.name = '名称不能为空';
  } else if (
    !isValidLength(
      data.name,
      VALIDATION_LIMITS.name.min,
      VALIDATION_LIMITS.name.max
    )
  ) {
    errors.name = `名称长度必须在 ${VALIDATION_LIMITS.name.min}-${VALIDATION_LIMITS.name.max} 字符之间`;
  }

  if (!isRequiredString(data.slug)) {
    errors.slug = 'Slug 不能为空';
  } else if (!isValidSlug(data.slug)) {
    errors.slug = 'Slug 只能包含字母、数字、下划线和连字符';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}
