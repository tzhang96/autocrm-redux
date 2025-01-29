import { DocumentSearch, SearchResult } from '@autocrm/docs'
import { HelpDocsResult, HelpDocsToolResponse } from '../../types/ai'

export class HelpDocsTool {
  private search: DocumentSearch

  constructor(
    openaiApiKey: string,
    supabaseUrl: string,
    supabaseKey: string
  ) {
    this.search = new DocumentSearch(openaiApiKey, supabaseUrl, supabaseKey)
  }

  private mapSearchResult(result: SearchResult): HelpDocsResult {
    return {
      content: result.content,
      title: result.metadata.title,
      relevanceScore: result.similarity,
      section: result.metadata.category,
      url: `/help/${result.metadata.source_file.replace(/\.mdx?$/, '')}`
    }
  }

  async searchRelevantDocs(
    ticketTitle: string,
    ticketDescription: string,
    latestMessage?: string,
    options?: {
      limit?: number
      threshold?: number
    }
  ): Promise<HelpDocsToolResponse> {
    try {
      // Combine ticket info into a search query
      const searchQuery = [
        ticketTitle,
        ticketDescription,
        latestMessage
      ]
        .filter(Boolean)
        .join('\n')
        .slice(0, 1000) // Limit query length

      // Search for relevant documentation
      const results = await this.search.search(searchQuery, {
        limit: options?.limit || 3,
        threshold: options?.threshold || 0.7
      })

      return {
        documents: results.map(this.mapSearchResult)
      }
    } catch (error) {
      console.error('Error searching help docs:', error)
      return {
        documents: [],
        error: error instanceof Error ? error.message : 'Failed to search help documentation'
      }
    }
  }

  async searchByCategory(
    query: string,
    category: string,
    options?: {
      limit?: number
      threshold?: number
    }
  ): Promise<HelpDocsToolResponse> {
    try {
      const results = await this.search.searchByCategory(
        query,
        category,
        {
          limit: options?.limit || 3,
          threshold: options?.threshold || 0.7
        }
      )

      return {
        documents: results.map(this.mapSearchResult)
      }
    } catch (error) {
      console.error('Error searching help docs by category:', error)
      return {
        documents: [],
        error: error instanceof Error ? error.message : 'Failed to search help documentation by category'
      }
    }
  }
} 