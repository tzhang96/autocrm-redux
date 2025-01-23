'use server'

import { createServerSupabaseClient } from '@/utils/supabase-server'
import { cookies } from 'next/headers'
import { TicketFilters, Ticket } from '@autocrm/core'

type SortField = 'created_at' | 'last_activity_at' | 'priority' | 'status'
type SortOrder = 'asc' | 'desc'

interface ExtendedTicketFilters extends TicketFilters {
  sortBy?: SortField
  sortOrder?: SortOrder
  assignedTo?: string | null // For filtering by assigned agent
  createdBy?: string // For filtering by creator
  tags?: string[] // For filtering by tags
}

export async function fetchTickets(filters: ExtendedTicketFilters): Promise<{ tickets: Ticket[]; total: number }> {
  const cookieStore = cookies()
  const supabase = await createServerSupabaseClient()

  let query = supabase
    .from('tickets')
    .select('*, assigned_to:users!assigned_to(name), created_by:users!created_by(name)', { count: 'exact' })

  // Apply filters
  if (filters.status) {
    query = query.eq('status', filters.status)
  }
  if (filters.priority) {
    query = query.eq('priority', filters.priority)
  }
  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,customer_email.ilike.%${filters.search}%`)
  }
  if (filters.assignedTo !== undefined) {
    if (filters.assignedTo === null) {
      query = query.is('assigned_to', null)
    } else {
      query = query.eq('assigned_to', filters.assignedTo)
    }
  }
  if (filters.createdBy) {
    query = query.eq('created_by', filters.createdBy)
  }
  if (filters.tags && filters.tags.length > 0) {
    query = query.contains('tags', filters.tags)
  }

  // Apply sorting
  const sortField = filters.sortBy || 'created_at'
  const sortOrder = filters.sortOrder || 'desc'
  query = query.order(sortField, { ascending: sortOrder === 'asc' })

  // Apply pagination
  query = query.range(filters.offset || 0, (filters.offset || 0) + (filters.limit || 10) - 1)

  const { data: tickets, count, error } = await query

  if (error) {
    console.error('Error fetching tickets:', error)
    throw new Error('Failed to fetch tickets')
  }

  return {
    tickets: tickets as Ticket[],
    total: count || 0
  }
} 