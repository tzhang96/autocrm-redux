'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface DocViewerProps {
  content?: string;
  isLoading?: boolean;
  error?: string;
}

export function DocViewer({ content, isLoading, error }: DocViewerProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[50vh] text-red-500">
        {error}
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex items-center justify-center h-[50vh] text-gray-500">
        No content available
      </div>
    );
  }

  return (
    <article className="prose prose-gray max-w-none p-8">
      <ReactMarkdown>{content}</ReactMarkdown>
    </article>
  );
} 