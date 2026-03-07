// Article types
export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  cover_image: string | null;
  category_id: string | null;
  author_id: string | null;
  status: 'draft' | 'published';
  published_at: string | null;
  created_at: string;
  updated_at: string;
  categories?: Category | null;
  article_tags?: ArticleTag[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface ArticleTag {
  article_id: string;
  tag_id: string;
  tags?: Tag;
}

export interface Media {
  id: string;
  filename: string;
  original_filename: string | null;
  url: string;
  type: 'image' | 'video' | 'document' | 'other';
  size: number | null;
  mime_type: string | null;
  uploaded_by: string | null;
  created_at: string;
}

export interface SiteSetting {
  id: string;
  key: string;
  value: string | null;
  description: string | null;
  updated_at: string;
}

// Form schemas
export interface ArticleFormData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image: string;
  category_id: string;
  tags: string[];
  status: 'draft' | 'published';
}

export interface CategoryFormData {
  name: string;
  slug: string;
  description?: string;
}

export interface TagFormData {
  name: string;
  slug: string;
}
