import OpenAI from 'openai';
import { DocumentChunk, EmbeddingOptions } from './types';

const DEFAULT_OPTIONS: EmbeddingOptions = {
  model: 'text-embedding-ada-002',
  batchSize: 100,
};

export class EmbeddingGenerator {
  private openai: OpenAI;
  private options: EmbeddingOptions;

  constructor(apiKey: string, options: Partial<EmbeddingOptions> = {}) {
    this.openai = new OpenAI({ apiKey });
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: this.options.model,
      input: text,
    });

    return response.data[0].embedding;
  }

  async generateEmbeddings(chunks: DocumentChunk[]): Promise<DocumentChunk[]> {
    const batchSize = this.options.batchSize;
    const results: DocumentChunk[] = [];

    // Process in batches to avoid rate limits
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      const texts = batch.map(chunk => chunk.content);

      const response = await this.openai.embeddings.create({
        model: this.options.model,
        input: texts,
      });

      const embeddedChunks = batch.map((chunk, index) => ({
        ...chunk,
        embedding: response.data[index].embedding,
      }));

      results.push(...embeddedChunks);
    }

    return results;
  }
} 