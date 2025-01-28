import { config } from 'dotenv';
import { VectorStore } from '../vectorStore';

// Load environment variables
config();

async function clearEmbeddings() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing required Supabase environment variables');
  }

  const vectorStore = new VectorStore(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    await vectorStore.clearAllEmbeddings();
    console.log('Successfully cleared all embeddings from the database');
  } catch (error) {
    console.error('Failed to clear embeddings:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  clearEmbeddings();
} 