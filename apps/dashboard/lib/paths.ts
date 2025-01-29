import { join } from 'path';

// Get the monorepo root by going up from the dashboard app
export function getMonorepoRoot() {
    // process.cwd() in Next.js points to the app root (apps/dashboard)
    // So we need to go up two levels to reach the monorepo root
    return join(process.cwd(), '..', '..');
}

// Get the docs content directory
export function getDocsContentDir() {
    return join(getMonorepoRoot(), 'packages', 'docs', 'dist', 'content');
}

// Get the path to a specific doc file
export function getDocPath(category: string, slug: string) {
    return join(getDocsContentDir(), category, `${slug}.mdx`);
}

// Get the path to a category index file
export function getCategoryPath(category: string) {
    return join(getDocsContentDir(), category, 'index.mdx');
}

// For debugging
export function logPaths() {
    console.log('CWD:', process.cwd());
    console.log('Monorepo root:', getMonorepoRoot());
    console.log('Docs content:', getDocsContentDir());
} 