"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/src/utils/supabase/client";

interface FileUploadProps {
  onUploadStart?: () => void;
  onUploadComplete?: (campaignId: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  onUploadStart, 
  onUploadComplete 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFile = async (file: File) => {
    // 1. Validation
    const validExtensions = [".pdf", ".docx", ".txt"];
    const fileExtension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
      alert("Invalid file type. Please upload a PDF, DOCX, or TXT file.");
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      alert("File is too large. Maximum size is 25MB.");
      return;
    }

    // 2. Start Upload Process
    setIsUploading(true);
    onUploadStart?.();

    try {
      const mockId = `CAM-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      
      const supabase = createClient();
      const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '');
      const uniqueFileName = `${mockId}_${safeName}`;
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('campaign_documents')
        .upload(uniqueFileName, file, { cacheControl: '3600', upsert: false });

      if (uploadError) {
        throw new Error(`Cloud upload failed: ${uploadError.message}`);
      }

      // Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('campaign_documents')
        .getPublicUrl(uniqueFileName);

      // 3. Prepare FormData for FastAPI
      const formData = new FormData();
      formData.append("file_url", publicUrl);
      formData.append("filename", file.name);
      
      // 4. Submit to Backend
      const response = await fetch(`http://localhost:8000/api/v1/campaign/upload?campaign_id=${mockId}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Backend Response:", data);

      // Simulation of a brief "Processing" delay for UX
      setUploadProgress(100);
      
      setTimeout(() => {
        onUploadComplete?.(mockId);
        router.push(`/campaign/${mockId}/room`);
      }, 800);

    } catch (error) {
      console.error("Upload Error:", error);
      alert("Failed to connect to the Assembly Line. Please check if your backend is running.");
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isUploading) setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (isUploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        accept=".pdf,.docx,.txt"
        className="hidden"
      />

      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`relative group cursor-pointer transition-all duration-500 hover:scale-[1.01] ${
          isUploading ? "pointer-events-none" : ""
        }`}
      >
        {/* Decorative Glow - Vibrant Blue/Indigo */}
        <div 
          className={`absolute -inset-4 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-[4rem] blur-2xl transition duration-1000 ${
            isDragging || isUploading ? "opacity-100 scale-105" : "opacity-0 group-hover:opacity-100"
          }`} 
        />
        
        <div 
          className={`relative flex flex-col items-center justify-center p-16 rounded-[3rem] border-2 border-dashed transition-all duration-300 ${
            isDragging 
              ? "bg-blue-50/50 border-blue-400 scale-[0.99]" 
              : "border-zinc-200 bg-white/40 backdrop-blur-xl group-hover:bg-white/80 group-hover:border-zinc-300"
          }`}
        >
          {/* Animated Icon Container */}
          <div className={`mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-zinc-900 text-white shadow-2xl transition-all duration-500 ${
            isDragging ? "rotate-12 scale-110 bg-blue-600" : "group-hover:rotate-6 group-hover:scale-110"
          }`}>
            {isUploading ? (
              <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" x2="12" y1="3" y2="15" />
              </svg>
            )}
          </div>

          <div className="space-y-2 text-center">
            <h3 className="font-playfair text-2xl font-bold text-zinc-900 italic">
              {isUploading ? "Starting Assembly Line..." : isDragging ? "Release to start" : "Drop source document"}
            </h3>
            <p className="text-sm font-medium text-zinc-500">
              {isUploading ? `UPLOADING: ${Math.round(uploadProgress)}%` : "PDF, DOCX, or TXT (Max 25MB)"}
            </p>
          </div>

          {/* Progress Bar (Visible during upload) */}
          {isUploading && (
            <div className="mt-8 w-64 h-1.5 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200/50">
              <div 
                className="h-full bg-zinc-900 transition-all duration-300 ease-out" 
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}

          {!isUploading && (
            <div className="mt-10 flex gap-4">
              <button 
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                className="px-8 py-3 rounded-2xl bg-zinc-900 text-white text-[13px] font-bold shadow-xl shadow-zinc-200 transition-all hover:bg-zinc-800 active:scale-95"
              >
                Browse Files
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
