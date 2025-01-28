'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface DocViewerProps {
  content?: string;
  metadata?: {
    title?: string;
    description?: string;
    lastUpdated?: string;
    [key: string]: any;
  };
  isLoading?: boolean;
  error?: string;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function DocViewer({ content, metadata, isLoading, error }: DocViewerProps) {
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
      <div className="mb-8">
        {metadata?.title && (
          <h1 className="text-3xl font-bold mb-2">{metadata.title}</h1>
        )}
        {metadata?.lastUpdated && (
          <div className="text-sm text-gray-500">
            Last updated: {formatDate(metadata.lastUpdated)}
          </div>
        )}
      </div>
      <ReactMarkdown>{content}</ReactMarkdown>
    </article>
  );
} 