import { SupabaseClient } from '@supabase/supabase-js'
import { PostgrestFilterBuilder } from '@supabase/postgrest-js'

// Constants
export const DEFAULT_PAGE_SIZE = 10

// Query field selectors
export const USER_FIELDS = {
  select: '*, created_by_user:users!tickets_created_by_fkey(id,email,name,role,created_at), assigned_to_user:users!tickets_assigned_to_fkey(id,email,name,role,created_at)'
} as const

export const MESSAGE_FIELDS = {
  select: '*, user:users(id,email,name,role,created_at)'
} as const

// Query builders
export function applyPagination<T>(
  query: PostgrestFilterBuilder<any, any, T>,
  filters?: { limit?: number; offset?: number }
): PostgrestFilterBuilder<any, any, T> {
  if (filters?.limit) {
    query = query.limit(filters.limit)
  }
  if (filters?.offset) {
    query = query.range(
      filters.offset,
      filters.offset + (filters.limit || DEFAULT_PAGE_SIZE) - 1
    )
  }
  return query
}

// Utility types
export interface CountQueryResult {
  count: number | null
} 