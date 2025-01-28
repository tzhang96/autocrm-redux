'use client';

import { useParams } from 'next/navigation';
import { DocViewer } from '../../_components/DocViewer';
import { useEffect, useState } from 'react';

interface DocResponse {
  content: string;
  metadata: {
    title: string;
    description?: string;
    [key: string]: any;
  };
}

export default function DocPage() {
  const params = useParams();
  const [content, setContent] = useState<string>('');
  const [metadata, setMetadata] = useState<DocResponse['metadata'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadContent() {
      try {
        const response = await fetch(`/api/docs/${params.category}/${params.slug}`);
        if (!response.ok) {
          throw new Error('Failed to load document');
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
  }, [params.category, params.slug]);

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