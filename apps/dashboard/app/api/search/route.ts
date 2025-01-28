import { NextResponse } from 'next/server';
import { DocumentSearch } from '@autocrm/docs';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!OPENAI_API_KEY || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing environment variables:', {
    hasOpenAI: !!OPENAI_API_KEY,
    hasSupabaseUrl: !!SUPABASE_URL,
    hasSupabaseKey: !!SUPABASE_ANON_KEY
  });
  throw new Error('Missing required environment variables for document search');
}

const search = new DocumentSearch(OPENAI_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY);

export async function POST(request: Request) {
  try {
    const { query, limit = 5 } = await request.json();
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    const results = await search.search(query, { limit });
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