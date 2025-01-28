import { readFile } from 'fs/promises';
import { NextResponse } from 'next/server';
import { getDocPath, logPaths } from '@/lib/paths';

interface FrontMatter {
  title?: string;
  description?: string;
  category?: string;
  lastUpdated?: string;
  version?: string;
  audience?: string;
  tags?: string[];
  relatedDocs?: string[];
  [key: string]: any;
}

// Helper function to extract front matter and clean content
function extractFrontMatter(content: string): { frontMatter: FrontMatter; content: string } {
  // Look for content between --- markers at the start of the file
  const matches = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  
  if (!matches) {
    console.log('No frontmatter found');
    return { frontMatter: {}, content };
  }

  const [, frontMatterText, mainContent] = matches;
  const frontMatter: FrontMatter = {};
  
  // Parse YAML front matter
  frontMatterText.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) return;
    
    const colonIndex = trimmedLine.indexOf(':');
    if (colonIndex === -1) return;
    
    const key = trimmedLine.slice(0, colonIndex).trim();
    let value = trimmedLine.slice(colonIndex + 1).trim();
    
    if (key) {
      // Handle arrays in YAML
      if (value.startsWith('[') && value.endsWith(']')) {
        frontMatter[key] = value.slice(1, -1).split(',').map(v => v.trim().replace(/^["'](.*)["']$/, '$1'));
      } else {
        // Handle regular values
        frontMatter[key] = value.replace(/^["'](.*)["']$/, '$1');
      }
    }
  });

  // Clean up the main content by removing only the main title (h1)
  const lines = mainContent.split('\n');
  let cleanedContent = mainContent;

  // Find the first h1 header and remove it
  const h1Index = lines.findIndex(line => line.trim().match(/^#\s+/));
  if (h1Index !== -1) {
    lines.splice(h1Index, 1);
    cleanedContent = lines.join('\n').trim();
  }

  console.log('Frontmatter:', frontMatter);
  console.log('Content preview:', cleanedContent.slice(0, 100));

  return { frontMatter, content: cleanedContent };
}

export async function GET(
  request: Request,
  { params }: { params: { category: string; slug: string } }
) {
  try {
    logPaths();
    
    const docPath = getDocPath(params.category, params.slug);
    console.log('Attempting to read file:', docPath);
    
    const content = await readFile(docPath, 'utf-8');
    console.log('Successfully read file');
    
    // Extract front matter and content
    const { frontMatter, content: mdxContent } = extractFrontMatter(content);
    
    return NextResponse.json({
      content: mdxContent,
      metadata: {
        ...frontMatter,
        title: frontMatter.title || params.slug
      }
    });
  } catch (error) {
    console.error('Error loading document:', error);
    return NextResponse.json(
      { 
        error: 'Failed to load document',
        details: error instanceof Error ? error.message : String(error),
        path: getDocPath(params.category, params.slug)
      },
      { status: 404 }
    );
  }
} 