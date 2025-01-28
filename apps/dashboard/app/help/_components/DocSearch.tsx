'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SearchResult } from '@autocrm/docs';
import ReactMarkdown from 'react-markdown';

export function DocSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
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
    } catch (error) {
      console.error('Search failed:', error);
      setError('Search failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 w-full max-w-3xl mx-auto">
      <div className="flex gap-2">
        <Input
          placeholder="Search documentation..."
          value={query}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
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

      {error && (
        <div className="p-4 text-red-500 bg-red-50 rounded-md">
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-4">
          {results.map((result, i) => (
            <div key={i} className="p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900">
                {result.metadata.title}
              </h3>
              <div className="mt-2 prose prose-sm max-w-none">
                <ReactMarkdown className="text-gray-600">
                  {result.content}
                </ReactMarkdown>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Relevance: {(result.similarity * 100).toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      )}

      {query && !isLoading && results.length === 0 && (
        <div className="text-center p-4 text-gray-500">
          No results found for "{query}"
        </div>
      )}
    </div>
  );
} 