import { createServerClient } from '@supabase/ssr'
import { type cookies } from 'next/headers'
import { Database } from '@autocrm/core'

export const createClient = async (cookieStore: ReturnType<typeof cookies>) => {
  const cookies = await cookieStore
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          try {
            cookies.set({ name, value, ...options })
          } catch (error) {
            // Handle cookies in edge functions
          }
        },
        remove(name: string, options: any) {
          try {
            cookies.delete({ name, ...options })
          } catch (error) {
            // Handle cookies in edge functions
          }
        },
      },
    }
  )
} 