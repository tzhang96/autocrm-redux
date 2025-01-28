import { readFileSync } from 'fs';
import { config } from 'dotenv';
import { VectorStore } from '../vectorStore';
import { DocumentChunker } from '../chunking';
import { EmbeddingGenerator } from '../embeddings';
import { DocumentChunk, DocumentMetadata } from '../types';

// Load environment variables from .env file
config();

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase environment variables');
}

// Helper function to wait between operations
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to extract front matter and content from MDX
function extractFrontMatterAndContent(fileContent: string): { frontMatter: any; content: string } {
  const frontMatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = fileContent.match(frontMatterRegex);

  if (!match) {
    return { frontMatter: {}, content: fileContent };
  }

  const [, frontMatterYaml, content] = match;
  const frontMatter: any = {};
  
  // Parse the YAML front matter manually
  frontMatterYaml.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length > 0) {
      const value = valueParts.join(':').trim();
      // Remove quotes if present
      frontMatter[key.trim()] = value.replace(/^"(.*)"$/, '$1');
    }
  });

  return { frontMatter, content: content.trim() };
}

async function processChunk(chunk: DocumentChunk, embeddings: EmbeddingGenerator, vectorStore: VectorStore, filePath: string, index: number, total: number) {
  console.log(`Processing chunk ${index + 1} of ${total}...`);
  try {
    const embedding = await embeddings.generateEmbedding(chunk.content);
    await vectorStore.storeEmbeddings([{ ...chunk, embedding }], filePath);
    // Wait 500ms between chunks to allow for garbage collection
    await wait(500);
  } catch (error) {
    console.error('Error processing chunk:', error);
    throw error;
  }
}

async function processFile(filePath: string, docsDir: string) {
  const file = filePath.split(/[\\/]/).pop()!;
  console.log(`\nProcessing ${file}...`);
  
  try {
    const embeddings = new EmbeddingGenerator(process.env.OPENAI_API_KEY!);
    const vectorStore = new VectorStore(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const chunker = new DocumentChunker();

    const fileContent = readFileSync(filePath, 'utf-8');
    const { frontMatter, content } = extractFrontMatterAndContent(fileContent);
    
    // Get metadata from front matter and file path
    const relativePath = filePath.replace(docsDir, '').replace(/^[\\/]/, '');
    const metadata: DocumentMetadata = {
      title: frontMatter.title || file.replace(/\.(md|mdx)$/, '').replace(/-/g, ' '),
      source_file: relativePath,
      category: frontMatter.category,
      audience: frontMatter.audience,
      lastUpdated: frontMatter.lastUpdated ? new Date(frontMatter.lastUpdated) : undefined,
      version: frontMatter.version,
      tags: frontMatter.tags,
      relatedDocs: frontMatter.relatedDocs,
    };
    
    // Split the content into chunks
    const chunks = chunker.chunkDocument(content, metadata);
    console.log(`Split into ${chunks.length} chunks`);

    // Process chunks one at a time
    for (let i = 0; i < chunks.length; i++) {
      await processChunk(chunks[i], embeddings, vectorStore, relativePath, i, chunks.length);
    }
    
    console.log(`Completed processing ${file}`);
  } catch (error) {
    console.error(`Error processing file ${file}:`, error);
    process.exit(1);
  }
}

// Get file path and docs directory from command line arguments
const [,, filePath, docsDir] = process.argv;

if (!filePath || !docsDir) {
  console.error('Usage: node process-file.js <file-path> <docs-dir>');
  process.exit(1);
}

processFile(filePath, docsDir); 