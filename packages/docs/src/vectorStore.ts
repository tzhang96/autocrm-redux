import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DocumentChunk, DocumentEmbedding, SearchOptions, SearchResult } from './types';

export class VectorStore {
  private client: SupabaseClient;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.client = createClient(supabaseUrl, supabaseKey);
  }

  async storeEmbeddings(chunks: DocumentChunk[], filePath: string): Promise<void> {
    const embeddings = chunks.map(chunk => ({
      content: chunk.content,
      embedding: chunk.embedding,
      metadata: chunk.metadata,
      chunk_start: chunk.startLine,
      chunk_end: chunk.endLine,
      file_path: filePath,
    }));

    const { error } = await this.client
      .from('document_embeddings')
      .insert(embeddings);

    if (error) throw new Error(`Failed to store embeddings: ${error.message}`);
  }

  async searchSimilar(
    queryEmbedding: number[],
    options: SearchOptions = {}
  ): Promise<SearchResult[]> {
    const {
      category,
      audience,
      limit = 5,
      threshold = 0.7,
    } = options;

    let query = this.client
      .rpc('match_documents', {
        query_embedding: queryEmbedding,
        match_threshold: threshold,
        match_count: limit,
      });

    if (category) {
      query = query.eq('metadata->>category', category);
    }

    if (audience) {
      query = query.eq('metadata->>audience', audience);
    }

    const { data, error } = await query;

    if (error) throw new Error(`Search failed: ${error.message}`);

    return data.map((result: any) => ({
      content: result.content,
      metadata: result.metadata,
      similarity: result.similarity,
    }));
  }

  async deleteEmbeddings(filePath: string): Promise<void> {
    const { error } = await this.client
      .from('document_embeddings')
      .delete()
      .eq('file_path', filePath);

    if (error) throw new Error(`Failed to delete embeddings: ${error.message}`);
  }

  async clearAllEmbeddings(): Promise<void> {
    const { error } = await this.client
      .from('document_embeddings')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (error) throw new Error(`Failed to clear embeddings: ${error.message}`);
  }

  async getEmbedding(id: string): Promise<DocumentEmbedding | null> {
    const { data, error } = await this.client
      .from('document_embeddings')
      .select()
      .eq('id', id)
      .single();

    if (error) throw new Error(`Failed to get embedding: ${error.message}`);
    return data;
  }
} 