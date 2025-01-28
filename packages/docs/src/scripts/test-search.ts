import { DocumentSearch } from '../search';
import { readFile } from 'fs/promises';
import { join } from 'path';

const search = new DocumentSearch(
  process.env.OPENAI_API_KEY!,
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

async function testSearch() {
  console.log('Testing search functionality...\n');

  // Test basic search
  console.log('Basic search test:');
  const results = await search.search('How do I get started?', { limit: 3 });
  console.log('Top 3 results:');
  results.forEach((result, i) => {
    console.log(`\n${i + 1}. [${result.metadata.title}] (score: ${result.similarity.toFixed(3)})`);
    console.log(`Excerpt: ${result.content.slice(0, 200)}...\n`);
  });

  // Test category search
  console.log('\nCategory search test:');
  const troubleshootingResults = await search.searchByCategory(
    'error during setup',
    'troubleshooting',
    { limit: 2 }
  );
  console.log('Top 2 troubleshooting results:');
  troubleshootingResults.forEach((result, i) => {
    console.log(`\n${i + 1}. [${result.metadata.title}] (score: ${result.similarity.toFixed(3)})`);
    console.log(`Excerpt: ${result.content.slice(0, 200)}...\n`);
  });

  // Test search with high threshold
  console.log('\nHigh threshold search test:');
  const preciseResults = await search.search(
    'warranty coverage for hardware defects',
    { threshold: 0.8 }
  );
  console.log(`Found ${preciseResults.length} results with similarity > 0.8`);
  preciseResults.forEach((result, i) => {
    console.log(`\n${i + 1}. [${result.metadata.title}] (score: ${result.similarity.toFixed(3)})`);
    console.log(`Excerpt: ${result.content.slice(0, 200)}...\n`);
  });
}

async function main() {
  try {
    await testSearch();
  } catch (error) {
    console.error('Error during testing:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
} 