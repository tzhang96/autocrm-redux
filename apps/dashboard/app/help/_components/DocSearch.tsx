'use client';

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SearchResult } from '@autocrm/docs';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function getDocumentPath(sourceFile: string): string {
  // Normalize backslashes to forward slashes
  const normalizedPath = sourceFile.replace(/\\/g, '/');
  
  // Remove .mdx extension
  const path = normalizedPath.replace(/\.mdx$/, '');
  
  // If it's just a directory name (like 'specs'), use it directly
  if (!path.includes('/')) {
    return `/help/${path}`;
  }
  
  // Split the path and remove 'index' if it's the last part
  const parts = path.split('/');
  if (parts[parts.length - 1] === 'index') {
    parts.pop();
  }
  
  return `/help/${parts.join('/')}`;
}

export function DocSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on Escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) {
      setIsOpen(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, limit: 5 }),
      });

      if (!response.ok) {
        throw new Error('Search request failed');
      }

      const searchResults = await response.json();
      setResults(searchResults);
      setIsOpen(true);
    } catch (error) {
      console.error('Search failed:', error);
      setError('Search failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResultClick = (path: string) => {
    setIsOpen(false);
    setQuery('');
    router.push(path);
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto" ref={dropdownRef}>
      <div className="flex gap-2">
        <Input
          placeholder="Search documentation..."
          value={query}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setQuery(e.target.value);
            if (!e.target.value) {
              setIsOpen(false);
            }
          }}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSearch()}
          className="flex-1"
        />
        <Button 
          onClick={handleSearch} 
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isLoading ? 'Searching...' : 'Search'}
        </Button>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-4 text-red-500 bg-red-50">
              {error}
            </div>
          )}

          {results.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {results.map((result, i) => {
                const displayTitle = result.metadata.title === 'index' 
                  ? result.metadata.source_file.split(/[/\\]/).filter(part => part !== 'index.mdx')[0]
                  : result.metadata.title;
                
                const path = getDocumentPath(result.metadata.source_file);
                
                return (
                  <button
                    key={i}
                    onClick={() => handleResultClick(path)}
                    className="w-full text-left p-4 hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="text-lg font-semibold text-gray-900">
                      {displayTitle || 'Untitled'}
                    </h3>
                    <div className="mt-1 text-sm text-gray-600 line-clamp-2">
                      <ReactMarkdown className="text-gray-600">
                        {result.content}
                      </ReactMarkdown>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                      <span>Relevance: {(result.similarity * 100).toFixed(1)}%</span>
                      {result.metadata.category && (
                        <span className="px-2 py-1 bg-gray-100 rounded-full">
                          {result.metadata.category}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            query && !isLoading && (
              <div className="text-center p-4 text-gray-500">
                No results found for &quot;{query}&quot;
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
} 