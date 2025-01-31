import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@autocrm/core'
import { SupabaseClient } from '@supabase/supabase-js'

type CookieStore = ReturnType<typeof cookies>

export const createClient = async (cookieStore: CookieStore = cookies()): Promise<SupabaseClient<Database>> => {
  const cookieJar = await cookieStore
  let response = new Response()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieJar.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieJar.set(name, value, options)
          })
        }
      }
    }
  )
} 