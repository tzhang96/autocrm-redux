# Documentation System

This package manages the documentation content and provides vector search capabilities for AI features.

## Directory Structure

```
packages/docs/
├── src/
│   ├── content/      # Documentation markdown files
│   ├── scripts/      # Utility scripts
│   └── types.ts      # Type definitions
```

## Adding New Documents

1. Create a new markdown file in the appropriate directory under `src/content/`
2. The file should be named `index.md` or have a descriptive name ending in `.md`
3. Run the embedding generation script to update the vector database:
   ```bash
   npm run generate-embeddings
   ```

## Updating Existing Documents

1. Edit the markdown file directly
2. Run the embedding generation script to update the vector database:
   ```bash
   npm run generate-embeddings
   ```

## Testing Search Functionality

Run the test script to verify search functionality:
```bash
npm run test-search
```

## Environment Variables

The following environment variables are required:
- `OPENAI_API_KEY`: Your OpenAI API key
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_KEY`: Your Supabase service role key

## Search API Usage

```typescript
import { DocumentSearch } from '@autocrm/docs';

const search = new DocumentSearch(
  process.env.OPENAI_API_KEY!,
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

// Basic search
const results = await search.search('How do I get started?', { limit: 3 });

// Search by category
const categoryResults = await search.searchByCategory(
  'error during setup',
  'troubleshooting'
);

// Search with high threshold for more precise results
const preciseResults = await search.search('warranty info', { threshold: 0.8 });
```

## Performance Considerations

- Each document is automatically chunked into smaller pieces for better search results
- Default chunk size is 1500 characters with 200 character overlap
- Embeddings are generated using OpenAI's text-embedding-ada-002 model
- Search results are ranked by cosine similarity 