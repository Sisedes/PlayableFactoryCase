"use client";
import React, { useState, useCallback, useRef } from "react";
import Image from "next/image";
import { useController, Control } from "react-hook-form";

interface FileUploadProps {
  name: string;
  control: Control<any>;
  label: string;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number; 
  preview?: boolean;
  required?: boolean;
  className?: string;
}

interface FileWithPreview extends File {
  preview?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  name,
  control,
  label,
  accept = "image/*",
  multiple = false,
  maxFiles = multiple ? 5 : 1,
  maxSize = 5, 
  preview = true,
  required = false,
  className = ""
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);

  const {
    field: { onChange, value },
    fieldState: { error }
  } = useController({
    name,
    control,
    rules: { required: required ? `${label} gereklidir` : false }
  });

  const createPreview = useCallback((files: FileWithPreview[]) => {
    if (!preview) return;

    const newPreviews = files.map(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return URL.createObjectURL(file);
    });

    setPreviews(prev => {
      prev.forEach(url => URL.revokeObjectURL(url));
      return newPreviews;
    });
  }, [preview]);

  const validateFiles = useCallback((files: File[]): File[] => {
    const validFiles: File[] = [];
    const maxSizeBytes = maxSize * 1024 * 1024;

    for (const file of files) {
      if (file.size > maxSizeBytes) {
        alert(`${file.name} dosyası çok büyük. Maksimum ${maxSize}MB olmalıdır.`);
        continue;
      }

      if (accept && !file.type.match(accept.replace('*', '.*'))) {
        alert(`${file.name} dosya türü desteklenmiyor.`);
        continue;
      }

      validFiles.push(file);

      if (validFiles.length >= maxFiles) {
        if (files.length > maxFiles) {
          alert(`Maksimum ${maxFiles} dosya seçebilirsiniz.`);
        }
        break;
      }
    }

    return validFiles;
  }, [accept, maxFiles, maxSize]);

  const handleFileChange = useCallback((files: File[]) => {
    const validFiles = validateFiles(files);
    
    if (validFiles.length > 0) {
      const filesWithPreview = validFiles as FileWithPreview[];
      
      if (multiple) {
        const currentFiles = Array.isArray(value) ? value : [];
        const newFiles = [...currentFiles, ...filesWithPreview].slice(0, maxFiles);
        onChange(newFiles);
        createPreview(newFiles);
      } else {
        onChange(filesWithPreview[0]);
        createPreview(filesWithPreview);
      }
    }
  }, [validateFiles, multiple, value, onChange, createPreview, maxFiles]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFileChange(files);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    handleFileChange(files);
  };

  const removeFile = (indexToRemove: number) => {
    if (multiple && Array.isArray(value)) {
      const newFiles = value.filter((_, index) => index !== indexToRemove);
      onChange(newFiles.length > 0 ? newFiles : null);
      
      const newPreviews = previews.filter((_, index) => index !== indexToRemove);
      setPreviews(newPreviews);
    } else {
      onChange(null);
      setPreviews([]);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  React.useEffect(() => {
    return () => {
      previews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const hasFiles = multiple ? Array.isArray(value) && value.length > 0 : !!value;

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors duration-200 cursor-pointer ${
          isDragOver
            ? "border-blue-400 bg-blue-50"
            : error
            ? "border-red-300 bg-red-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          className="hidden"
        />

        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              <span className="font-medium text-blue-600">Dosya seçin</span> veya buraya sürükleyin
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {accept} • Maksimum {maxSize}MB
              {multiple && ` • En fazla ${maxFiles} dosya`}
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600">{error.message}</p>
      )}

      {/* File Previews */}
      {hasFiles && preview && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Seçilen Dosyalar:</h4>
          <div className={`grid gap-3 ${multiple ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1"}`}>
            {(multiple ? (Array.isArray(value) ? value : []) : [value]).map((file: File, index: number) => (
              <div key={index} className="relative group">
                <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  {file && file.type.startsWith('image/') && previews[index] ? (
                    <Image
                      src={previews[index]}
                      alt={file.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  )}
                  
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <p className="mt-1 text-xs text-gray-600 truncate" title={file?.name}>
                  {file?.name}
                </p>
                <p className="text-xs text-gray-400">
                  {file ? (file.size / (1024 * 1024)).toFixed(2) : 0}MB
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload; 