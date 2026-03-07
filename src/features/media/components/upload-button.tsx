'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Upload, Loader2, X, Image, FileText, Film } from 'lucide-react';

interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

async function uploadFile(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    return { success: false, error: data.error || '上传失败' };
  }

  return { success: true, url: data.url };
}

export function UploadButton() {
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'],
      'video/*': ['.mp4', '.webm', '.mov'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const result = await uploadFile(file);

      if (result.success) {
        successCount++;
      } else {
        failCount++;
        toast.error(`${file.name}: ${result.error}`);
      }

      setUploadProgress(Math.round(((i + 1) / files.length) * 100));
    }

    setIsUploading(false);
    setUploadProgress(0);

    if (successCount > 0) {
      toast.success(`成功上传 ${successCount} 个文件`);
      // Refresh the page to show new files
      window.location.reload();
    }

    if (successCount === files.length) {
      setOpen(false);
      setFiles([]);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (file.type.startsWith('video/')) return <Film className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className='mr-2 h-4 w-4' />
          上传文件
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>上传媒体文件</DialogTitle>
          <DialogDescription>
            支持图片、视频和文档文件，单个文件最大 10MB
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 拖拽区域 */}
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
              transition-colors duration-200
              ${isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
              }
            `}
          >
            <input {...getInputProps()} />
            <Upload className={`mx-auto h-10 w-10 mb-3 ${isDragActive ? 'text-primary' : 'text-muted-foreground'}`} />
            {isDragActive ? (
              <p className="text-primary font-medium">放开以上传文件</p>
            ) : (
              <div>
                <p className="text-muted-foreground">
                  拖拽文件到此处，或 <span className="text-primary font-medium">点击选择文件</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  支持 PNG, JPG, GIF, SVG, MP4, PDF, DOC, DOCX
                </p>
              </div>
            )}
          </div>

          {/* 已选择的文件列表 */}
          {files.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">已选择 {files.length} 个文件</p>
              <div className="max-h-[200px] overflow-y-auto space-y-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-muted rounded-md"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {getFileIcon(file)}
                      <span className="text-sm truncate">{file.name}</span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        ({formatFileSize(file.size)})
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={() => removeFile(index)}
                      disabled={isUploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 上传进度 */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>上传中...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => {
              setOpen(false);
              setFiles([]);
            }}
            disabled={isUploading}
          >
            取消
          </Button>
          <Button
            onClick={handleUpload}
            disabled={files.length === 0 || isUploading}
          >
            {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isUploading ? '上传中...' : `上传 ${files.length > 0 ? `(${files.length})` : ''}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
