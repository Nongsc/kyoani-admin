'use client';

import { useRef, useCallback, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder,
  className,
  disabled,
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [uploading, setUploading] = useState(false);

  const uploadImage = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '上传失败');
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    }
  };

  const insertAtCursor = useCallback((text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newValue = value.substring(0, start) + text + value.substring(end);

    onChange(newValue);

    // Set cursor position after inserted text
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + text.length;
    }, 0);
  }, [value, onChange]);

  const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    // Find image in clipboard
    const imageItems = Array.from(items).filter(
      (item) => item.type.startsWith('image/')
    );

    if (imageItems.length === 0) return;

    // Prevent default paste for images
    e.preventDefault();

    setUploading(true);

    for (const item of imageItems) {
      const file = item.getAsFile();
      if (!file) continue;

      toast.info('正在上传图片...');

      const url = await uploadImage(file);

      if (url) {
        // Generate alt text from filename
        const altText = file.name.replace(/\.[^/.]+$/, '');
        const markdown = `![${altText}](${url})`;
        insertAtCursor(markdown);
        toast.success('图片上传成功');
      } else {
        toast.error('图片上传失败');
      }
    }

    setUploading(false);
  }, [insertAtCursor]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();

    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith('image/')
    );

    if (files.length === 0) return;

    setUploading(true);

    for (const file of files) {
      toast.info('正在上传图片...');

      const url = await uploadImage(file);

      if (url) {
        const altText = file.name.replace(/\.[^/.]+$/, '');
        const markdown = `![${altText}](${url})`;
        insertAtCursor(markdown);
        toast.success('图片上传成功');
      } else {
        toast.error('图片上传失败');
      }
    }

    setUploading(false);
  }, [insertAtCursor]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  return (
    <div className="relative">
      {uploading && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10 rounded-md">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>上传中...</span>
          </div>
        </div>
      )}
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onPaste={handlePaste}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        placeholder={placeholder}
        className={className}
        disabled={disabled || uploading}
      />
      <p className="text-xs text-muted-foreground mt-1">
        支持 Ctrl+V 粘贴图片或拖拽图片到编辑器
      </p>
    </div>
  );
}
