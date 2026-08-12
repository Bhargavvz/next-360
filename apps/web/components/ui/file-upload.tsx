'use client';

import { useState, useRef } from 'react';
import { UploadCloud, File, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { api, publicApi } from '@/lib/api';

interface FileUploadProps {
  folder: 'products' | 'kyc' | 'certificates';
  onUploadComplete: (url: string) => void;
  accept?: string;
  maxSizeMB?: number;
  label?: string;
  defaultUrl?: string;
}

export function FileUpload({
  folder,
  onUploadComplete,
  accept = folder === 'products' ? 'image/jpeg, image/png, image/webp' : 'application/pdf, image/jpeg, image/png',
  maxSizeMB = 10,
  label = 'Upload file',
  defaultUrl,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(defaultUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateFile = (file: File) => {
    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB > maxSizeMB) {
      toast.error(`File is too large. Max size is ${maxSizeMB}MB`);
      return false;
    }
    return true;
  };

  const uploadFile = async (file: File) => {
    if (!validateFile(file)) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    try {
      // Use API client which attaches the Auth token
      const res = await api.post('/api/v1/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const url = res.data.data.url;
      setPreview(url);
      onUploadComplete(url);
      toast.success('File uploaded successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await uploadFile(file);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadFile(file);
    }
    // Reset input so the same file can be selected again if needed
    if (e.target) e.target.value = '';
  };

  const isImage = preview?.match(/\.(jpeg|jpg|gif|png|webp)$/i);

  return (
    <div className="w-full">
      <div
        className={`relative flex flex-col items-center justify-center w-full min-h-[160px] rounded-xl border-2 border-dashed transition-colors ${
          isDragging
            ? 'border-primary bg-primary/5'
            : preview
            ? 'border-emerald-500/50 bg-emerald-50/20'
            : 'border-muted-foreground/25 bg-muted/5 hover:bg-muted/30'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={accept}
          className="hidden"
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-2 p-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-muted-foreground">Uploading to secure storage...</p>
          </div>
        ) : preview ? (
          <div className="w-full h-full p-2 flex flex-col items-center justify-center">
            {isImage ? (
              <div className="relative w-full max-w-[200px] aspect-video rounded-lg overflow-hidden border">
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 p-4">
                <File className="h-10 w-10 text-emerald-500" />
                <p className="text-sm font-medium text-emerald-700 truncate max-w-[250px]">
                  {preview.split('/').pop()}
                </p>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-3">Click or drag to replace file</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 p-6 text-center cursor-pointer">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              {folder === 'products' ? (
                <ImageIcon className="h-6 w-6 text-primary" />
              ) : (
                <UploadCloud className="h-6 w-6 text-primary" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {folder === 'products' ? 'PNG, JPG or WebP' : 'PDF, PNG or JPG'} up to {maxSizeMB}MB
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
