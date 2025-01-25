import { createServerSupabaseClient } from '@/utils/supabase-server'
import { CustomerAPI } from '@/lib/api/customer'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const customerApi = new CustomerAPI(supabase, user.email)
  const tickets = await customerApi.listMyTickets()

  return NextResponse.json(tickets)
} 