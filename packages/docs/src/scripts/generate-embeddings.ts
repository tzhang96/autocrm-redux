import { config } from 'dotenv';
import { readFile, readdir } from 'fs/promises';
import { join } from 'path';
import { DocumentChunker } from '../chunking';
import { EmbeddingGenerator } from '../embeddings';
import { VectorStore } from '../vectorStore';
import { DocumentMetadata, DocumentChunk } from '../types';

// Load environment variables
config();

// Validate environment variables
if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing required Supabase environment variables');
}

// Configuration
const DOCS_DIR = join(process.cwd(), 'src/content');
const chunker = new DocumentChunker({
  maxChunkSize: 500,  // Increased for better context
  overlapSize: 50     // Increased for better continuity
});
const embedder = new EmbeddingGenerator(process.env.OPENAI_API_KEY, {
  batchSize: 5  // Process fewer embeddings at once
});
const vectorStore = new VectorStore(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Helper function to parse YAML value
function parseYamlValue(value: string): any {
  // Remove quotes if present
  value = value.trim().replace(/^["'](.*)["']$/, '$1');
  
  // Handle arrays
  if (value.startsWith('[') && value.endsWith(']')) {
    return value
      .slice(1, -1)
      .split(',')
      .map(item => parseYamlValue(item.trim()));
  }
  
  // Handle dates
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    return new Date(value);
  }
  
  // Handle booleans
  if (value.toLowerCase() === 'true') return true;
  if (value.toLowerCase() === 'false') return false;
  
  // Handle numbers
  if (!isNaN(Number(value))) return Number(value);
  
  return value;
}

// Helper function to extract front matter
function extractFrontMatter(content: string): { frontMatter: any; content: string } {
  const frontMatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontMatterRegex);

  if (!match) {
    return { frontMatter: {}, content };
  }

  const [, frontMatterYaml, mainContent] = match;
  const frontMatter: any = {};
  
  frontMatterYaml.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) return;
    
    const key = line.slice(0, colonIndex).trim();
    const value = line.slice(colonIndex + 1).trim();
    
    if (key) {
      frontMatter[key] = parseYamlValue(value);
    }
  });

  return { frontMatter, content: mainContent.trim() };
}

// Helper function to clean MDX content
function cleanMDXContent(content: string): string {
  // First, normalize line endings
  content = content.replace(/\r\n/g, '\n');
  
  // Remove code blocks
  content = content.replace(/```[\s\S]*?```/g, '');
  
  // Remove inline code
  content = content.replace(/`[^`]*`/g, '');
  
  // Remove HTML-style comments
  content = content.replace(/<!--[\s\S]*?-->/g, '');
  
  // Handle headers - keep the text but add a period for better sentence boundaries
  content = content.replace(/^(#+)\s+(.+)$/gm, '$2.');
  
  // Remove emphasis markers but keep the text
  content = content.replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, '$1');
  
  // Remove link syntax but keep the text
  content = content.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  
  // Remove HTML tags but keep their content
  content = content.replace(/<[^>]+>/g, '');
  
  // Handle nested lists - preserve hierarchy with proper spacing
  const lines = content.split('\n').map(line => {
    // Count leading spaces to determine list level
    const leadingSpaces = line.match(/^\s*/);
    const indent = leadingSpaces ? leadingSpaces[0].length : 0;
    const level = Math.floor(indent / 2);
    
    // Remove list markers but keep indentation structure
    line = line.replace(/^(\s*)[-*+]\s+/, '$1');
    line = line.replace(/^(\s*)\d+\.\s+/, '$1');
    
    // Add a period if the line doesn't end with punctuation
    if (line.trim() && !/[.!?:]$/.test(line.trim())) {
      line = line.trimEnd() + '.';
    }
    
    return line;
  });
  
  content = lines.join('\n');
  
  // Normalize whitespace
  content = content
    // Remove multiple blank lines
    .replace(/\n{3,}/g, '\n\n')
    // Remove spaces at the end of lines
    .replace(/[ \t]+$/gm, '')
    // Ensure proper spacing around periods
    .replace(/\.+/g, '.')
    .replace(/\.\s*\./g, '.')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Add periods to the end of lines that don't have sentence-ending punctuation
  content = content.split('\n').map(line => {
    line = line.trim();
    if (line && !/[.!?:]$/.test(line)) {
      return line + '.';
    }
    return line;
  }).join('\n');
  
  return content;
}

// Helper function to process chunks in small batches
async function processChunks(
  chunkGenerator: Generator<DocumentChunk>,
  relativePath: string
) {
  const batchSize = 5;
  let currentBatch: DocumentChunk[] = [];
  let processedChunks = 0;
  
  for (const chunk of chunkGenerator) {
    // Skip empty chunks or chunks with only whitespace/punctuation
    if (!chunk.content.trim() || !/[a-zA-Z0-9]/.test(chunk.content)) {
      continue;
    }
    
    currentBatch.push(chunk);
    processedChunks++;
    
    if (currentBatch.length >= batchSize) {
      console.log(`Processing batch of ${currentBatch.length} chunks (${processedChunks} total processed)`);
      
      try {
        // Generate embeddings for this batch
        const batchWithEmbeddings = await embedder.generateEmbeddings(currentBatch);
        
        // Store this batch
        await vectorStore.storeEmbeddings(batchWithEmbeddings, relativePath);
        
        // Clear the batch
        currentBatch = [];
        
        // Wait a bit between batches
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('Error processing batch:', error);
        throw error;
      }
    }
  }
  
  // Process any remaining chunks
  if (currentBatch.length > 0) {
    console.log(`Processing final batch of ${currentBatch.length} chunks (${processedChunks} total processed)`);
    try {
      const batchWithEmbeddings = await embedder.generateEmbeddings(currentBatch);
      await vectorStore.storeEmbeddings(batchWithEmbeddings, relativePath);
    } catch (error) {
      console.error('Error processing final batch:', error);
      throw error;
    }
  }
}

async function processFile(filePath: string): Promise<void> {
  console.log(`\nProcessing ${filePath}...`);
  
  try {
    // Read file
    const content = await readFile(filePath, 'utf-8');
    console.log(`Read file successfully: ${filePath}`);
    
    // Extract front matter and content
    const { frontMatter, content: mdxContent } = extractFrontMatter(content);
    console.log(`Extracted front matter:`, frontMatter);
    
    // Clean the MDX content
    const cleanedContent = cleanMDXContent(mdxContent);
    console.log('Content cleaned and ready for processing');
    
    // Create metadata
    const relativePath = filePath.replace(DOCS_DIR, '').replace(/^[\\/]/, '');
    const metadata: DocumentMetadata = {
      title: frontMatter.title || relativePath.split(/[\\/]/).pop()?.replace(/\.(md|mdx)$/, '') || '',
      source_file: relativePath,
      category: frontMatter.category,
      audience: frontMatter.audience,
      lastUpdated: frontMatter.lastUpdated instanceof Date ? frontMatter.lastUpdated : undefined,
      version: frontMatter.version,
      tags: Array.isArray(frontMatter.tags) ? frontMatter.tags : undefined,
      relatedDocs: Array.isArray(frontMatter.relatedDocs) ? frontMatter.relatedDocs : undefined,
    };

    // Get chunk generator
    console.log('Starting chunk processing...');
    const chunkGenerator = chunker.chunkDocumentGenerator(cleanedContent, metadata);
    
    // Process chunks
    await processChunks(chunkGenerator, relativePath);
    
    console.log(`Successfully processed ${relativePath}`);
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    throw error;
  }
}

async function processDirectory(dir: string): Promise<void> {
  const entries = await readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const path = join(dir, entry.name);
    
    if (entry.isDirectory()) {
      await processDirectory(path);
    } else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
      try {
        await processFile(path);
        // Wait between files to allow for garbage collection
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Failed to process ${path}:`, error);
        // Continue with next file
      }
    }
  }
}

async function main() {
  try {
    console.log('Starting embedding generation...');
    console.log('Looking for docs in:', DOCS_DIR);
    await processDirectory(DOCS_DIR);
    console.log('\nEmbedding generation complete!');
  } catch (error) {
    console.error('Error generating embeddings:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
} 