'use server'

import { createServerSupabaseClient } from '@/utils/supabase-server'
import { TicketFilters } from '@autocrm/core'

export async function fetchTickets(filters: TicketFilters) {
  const supabase = await createServerSupabaseClient()

  // Get current user and their role
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  // Get user's role from the users table
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (userError || !userData) {
    throw new Error('Could not fetch user role')
  }

  // First get total count without pagination
  let countQuery = supabase
    .from('tickets')
    .select('*', { count: 'exact', head: true })

  // Apply role-based filtering to count query
  if (userData.role === 'agent') {
    countQuery = countQuery.or(`assigned_to.is.${user.id},and(assigned_to.is.null,created_by.neq.${user.id})`)
  }

  const { count } = await countQuery

  // Then get paginated results with all fields
  let query = supabase
    .from('tickets')
    .select(`
      *,
      created_by_user:users!tickets_created_by_fkey(user_id, email, name),
      assigned_to_user:users!tickets_assigned_to_fkey(user_id, email, name)
    `)

  // Apply role-based filtering
  if (userData.role === 'agent') {
    // Agents see:
    // 1. Tickets assigned to them
    // 2. Unassigned tickets (except ones they created as a customer)
    query = query.or(`assigned_to.is.${user.id},and(assigned_to.is.null,created_by.neq.${user.id})`)
  }
  // Admins see all tickets by default

  if (filters.status) {
    query = query.eq('status', filters.status)
  }

  if (filters.priority) {
    query = query.eq('priority', filters.priority)
  }

  if (filters.assignedTo) {
    query = query.eq('assigned_to', filters.assignedTo)
  }

  if (filters.createdBy) {
    query = query.eq('created_by', filters.createdBy)
  }

  if (filters.tags && filters.tags.length > 0) {
    query = query.contains('tags', filters.tags)
  }

  if (filters.sortBy) {
    const order = filters.sortOrder === 'desc' ? true : false
    switch (filters.sortBy) {
      case 'created_at':
        query = query.order('created_at', { ascending: !order })
        break
      case 'updated_at':
        query = query.order('updated_at', { ascending: !order })
        break
      case 'last_activity_at':
        query = query.order('last_activity_at', { ascending: !order })
        break
      case 'priority':
        query = query.order('priority', { ascending: !order })
        break
      case 'status':
        query = query.order('status', { ascending: !order })
        break
    }
  } else {
    // Default sort by created_at desc
    query = query.order('created_at', { ascending: false })
  }

  // Apply pagination
  if (filters.limit) {
    query = query.limit(filters.limit)
  }
  if (typeof filters.offset === 'number') {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
  }

  const { data: tickets, error } = await query

  if (error) {
    throw error
  }

  return { tickets, total: count || 0 }
} 