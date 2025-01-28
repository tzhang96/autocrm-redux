export type DocumentCategory = 'pricing' | 'returns' | 'roadmap' | 'specs' | 'troubleshooting' | 'getting-started';

export type DocumentAudience = 'customer' | 'internal' | 'both';

export interface DocumentMetadata {
  title: string;
  description: string;
  category: DocumentCategory;
  lastUpdated: string; // ISO date string
  version: string;
  audience: DocumentAudience;
  tags: string[];
  relatedDocs?: string[]; // paths to related documents
}

export interface DocumentChunk {
  id: string;
  content: string;
  metadata: DocumentMetadata;
  embedding?: number[];
  startLine: number;
  endLine: number;
} 