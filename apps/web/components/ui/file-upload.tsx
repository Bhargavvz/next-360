'use client';

import { useState, useRef } from 'react';
import { UploadCloud, File, Loader2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { api, apiErrorMessage } from '@/lib/api';
import axios from 'axios';

interface FileUploadProps {
  folder: 'products' | 'kyc' | 'certificates' | 'avatars';
  /** Receives the stored file's URL, plus its S3 object key for later deletion. */
  onUploadComplete: (url: string, objectKey?: string) => void;
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
  const [progress, setProgress] = useState(0);
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

  /**
   * Upload straight to S3 with a presigned PUT so the file never streams through the
   * API. Falls back to the multipart endpoint if presigning is unavailable.
   */
  const uploadFile = async (file: File) => {
    if (!validateFile(file)) return;

    setIsUploading(true);
    setProgress(0);

    try {
      let url: string;
      let objectKey: string | undefined;

      try {
        const ticketRes = await api.post('/api/v1/uploads/presign', {
          folder,
          contentType: file.type,
          sizeBytes: file.size,
        });
        const ticket = ticketRes.data.data;

        await axios.put(ticket.uploadUrl, file, {
          headers: { 'Content-Type': file.type },
          onUploadProgress: (event) => {
            if (event.total) setProgress(Math.round((event.loaded / event.total) * 100));
          },
        });

        const confirmRes = await api.post('/api/v1/uploads/confirm', { key: ticket.objectKey });
        url = confirmRes.data.data.url;
        objectKey = confirmRes.data.data.key;
      } catch (presignErr) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);
        const res = await api.post('/api/v1/uploads', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (event) => {
            if (event.total) setProgress(Math.round((event.loaded / event.total) * 100));
          },
        });
        url = res.data.data.url;
        objectKey = res.data.data.key;
      }

      setPreview(url);
      onUploadComplete(url, objectKey);
      toast.success('File uploaded');
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Failed to upload file'));
    } finally {
      setIsUploading(false);
      setProgress(0);
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
            ? 'border-success/30 bg-success-muted'
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
          <div className="flex flex-col items-center gap-2 p-6 w-full max-w-[220px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-muted-foreground">
              Uploading{progress > 0 ? ` — ${progress}%` : '…'}
            </p>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary transition-[width] duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : preview ? (
          <div className="w-full h-full p-2 flex flex-col items-center justify-center">
            {isImage ? (
              <div className="relative w-full max-w-[200px] aspect-video rounded-lg overflow-hidden border">
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 p-4">
                <File className="h-10 w-10 text-success" />
                <p className="text-sm font-medium text-success truncate max-w-[250px]">
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
