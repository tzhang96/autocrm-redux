'use client';

import { useParams } from 'next/navigation';
import { DocViewer } from '../_components/DocViewer';
import { useEffect, useState } from 'react';

interface DocResponse {
  content: string;
  metadata: {
    title: string;
    description?: string;
    lastUpdated?: string;
    version?: string;
    category?: string;
    tags?: string[];
    relatedDocs?: string[];
    [key: string]: string | string[] | undefined;
  };
}

export default function CategoryPage() {
  const params = useParams();
  const [content, setContent] = useState<string>('');
  const [metadata, setMetadata] = useState<DocResponse['metadata'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadContent() {
      try {
        const response = await fetch(`/api/docs/${params.category}/index`);
        if (!response.ok) {
          throw new Error('Failed to load category content');
        }
        const data: DocResponse = await response.json();
        setContent(data.content);
        setMetadata(data.metadata);
      } catch (err) {
        setError('Failed to load documentation');
        console.error('Error loading doc:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadContent();
  }, [params.category]);

  return (
    <div className="max-w-4xl mx-auto">
      <DocViewer 
        content={content} 
        metadata={metadata || undefined}
        isLoading={isLoading}
        error={error || undefined}
      />
    </div>
  );
} 