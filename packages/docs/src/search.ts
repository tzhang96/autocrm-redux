import OpenAI from 'openai';
import { VectorStore } from './vectorStore';
import { SearchOptions, SearchResult } from './types';

export class DocumentSearch {
  private openai: OpenAI;
  private vectorStore: VectorStore;

  constructor(
    openaiApiKey: string,
    supabaseUrl: string,
    supabaseKey: string
  ) {
    this.openai = new OpenAI({ apiKey: openaiApiKey });
    this.vectorStore = new VectorStore(supabaseUrl, supabaseKey);
  }

  async search(query: string, options?: SearchOptions): Promise<SearchResult[]> {
    const response = await this.openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: query,
    });

    return this.vectorStore.searchSimilar(response.data[0].embedding, options);
  }

  async searchByCategory(
    query: string,
    category: string,
    options?: Omit<SearchOptions, 'category'>
  ): Promise<SearchResult[]> {
    return this.search(query, { ...options, category });
  }

  async searchByAudience(
    query: string,
    audience: string,
    options?: Omit<SearchOptions, 'audience'>
  ): Promise<SearchResult[]> {
    return this.search(query, { ...options, audience });
  }
} 