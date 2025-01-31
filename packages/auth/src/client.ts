import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@autocrm/core'
import { SupabaseClient } from '@supabase/supabase-js'

export const createClient = (): SupabaseClient<Database> => {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export type Client = ReturnType<typeof createClient> 