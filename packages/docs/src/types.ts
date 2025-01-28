export interface DocumentMetadata {
  title: string;
  source_file: string;
  category?: string;
  audience?: string;
  lastUpdated?: Date;
  version?: string;
  tags?: string[];
  relatedDocs?: string[];
}

export interface DocumentChunk {
  content: string;
  metadata: DocumentMetadata;
  startLine: number;
  endLine: number;
  embedding?: number[];
}

export interface DocumentEmbedding {
  id: string;
  content: string;
  embedding: number[];
  metadata: DocumentMetadata;
  chunkStart: number;
  chunkEnd: number;
  filePath: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchResult {
  content: string;
  metadata: DocumentMetadata;
  similarity: number;
}

export interface ChunkingOptions {
  maxChunkSize: number;
  minChunkSize: number;
  overlapSize: number;
}

export interface EmbeddingOptions {
  model: string;
  batchSize: number;
}

export interface SearchOptions {
  limit?: number;
  threshold?: number;
  category?: string;
  audience?: string;
} 