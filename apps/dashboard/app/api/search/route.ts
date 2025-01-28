import { NextResponse } from 'next/server';
import { EmbeddingGenerator, VectorStore } from '@autocrm/docs';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!OPENAI_API_KEY || !SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing environment variables:', {
    hasOpenAI: !!OPENAI_API_KEY,
    hasSupabaseUrl: !!SUPABASE_URL,
    hasSupabaseKey: !!SUPABASE_ANON_KEY,
    hasSupabaseServiceRoleKey: !!SUPABASE_SERVICE_ROLE_KEY
  });
  throw new Error('Missing required environment variables for document search');
}

// Initialize services
const embedder = new EmbeddingGenerator(OPENAI_API_KEY, {
  batchSize: 1  // We only need to embed the search query
});

const vectorStore = new VectorStore(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request: Request) {
  try {
    const { query, limit = 5, threshold = 0.7 } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Invalid query' },
        { status: 400 }
      );
    }

    // Generate embedding for the search query
    const [queryEmbedding] = await embedder.generateEmbeddings([{
      content: query,
      metadata: { title: 'search query', source_file: '' },
      startLine: 0,
      endLine: 0
    }]);

    // Search for similar documents
    const results = await vectorStore.searchSimilar(queryEmbedding.embedding!, {
      limit,
      threshold
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error('Search failed:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
} 