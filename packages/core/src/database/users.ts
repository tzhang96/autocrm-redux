import { SupabaseClient } from '@supabase/supabase-js'
import { User, UserRole, UserFilters } from '../types'
import { DatabaseError, wrapDbError } from './errors'
import { applyPagination } from './utils'

export async function getUser(
  supabase: SupabaseClient,
  userId: string
): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw new DatabaseError('Failed to get user', 'getUser', error)
    return data
  } catch (error) {
    throw wrapDbError('getUser', error)
  }
}

export async function getUserByEmail(
  supabase: SupabaseClient,
  email: string
): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error) throw new DatabaseError('Failed to get user by email', 'getUserByEmail', error)
    return data
  } catch (error) {
    throw wrapDbError('getUserByEmail', error)
  }
}

export async function updateUserRole(
  supabase: SupabaseClient,
  userId: string,
  role: UserRole
): Promise<User> {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw new DatabaseError('Failed to update user role', 'updateUserRole', error)
    if (!data) throw new DatabaseError('User not found', 'updateUserRole')
    return data
  } catch (error) {
    throw wrapDbError('updateUserRole', error)
  }
}

export async function listUsers(
  supabase: SupabaseClient,
  filters?: UserFilters
): Promise<User[]> {
  try {
    let query = supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters?.role) {
      query = query.eq('role', filters.role)
    }

    if (filters?.search) {
      query = query.or(
        `email.ilike.%${filters.search}%,name.ilike.%${filters.search}%`
      )
    }

    query = applyPagination(query, filters)
    const { data, error } = await query

    if (error) throw new DatabaseError('Failed to list users', 'listUsers', error)
    return data || []
  } catch (error) {
    throw wrapDbError('listUsers', error)
  }
} 