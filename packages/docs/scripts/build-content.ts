import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';
import matter from 'gray-matter';

const CONTENT_DIR = join(__dirname, '..', 'src', 'content');
const OUTPUT_FILE = join(__dirname, '..', 'src', 'content.ts');

function getAllMdxFiles(dir: string, baseDir: string = dir): string[] {
  const files: string[] = [];
  const entries = readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getAllMdxFiles(fullPath, baseDir));
    } else if (entry.name.endsWith('.mdx')) {
      files.push(fullPath);
    }
  }

  return files;
}

function generateContentMap() {
  const files = getAllMdxFiles(CONTENT_DIR);
  const contentMap: Record<string, { content: string; metadata: any }> = {};

  for (const file of files) {
    const relativePath = file
      .replace(CONTENT_DIR + '/', '')
      .replace(/\.mdx$/, '');
    
    const fileContent = readFileSync(file, 'utf-8');
    const { data: frontMatter, content } = matter(fileContent);

    contentMap[relativePath] = {
      content: content.trim(),
      metadata: {
        ...frontMatter,
        title: frontMatter.title || relativePath.split('/').pop(),
        category: relativePath.split('/')[0]
      }
    };
  }

  const output = `// This file is auto-generated. Do not edit directly.
export const contentMap = ${JSON.stringify(contentMap, null, 2)};`;

  writeFileSync(OUTPUT_FILE, output);
  console.log('Content map generated successfully!');
}

generateContentMap(); 