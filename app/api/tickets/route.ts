import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { TicketPriority } from '@/lib/core/types'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const json = await request.json()
    const { title, description, priority, customer_email } = json

    // Validate required fields
    if (!title || !description || !priority || !customer_email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate title length
    if (title.length < 3 || title.length > 200) {
      return NextResponse.json(
        { error: 'Title must be between 3 and 200 characters' },
        { status: 400 }
      )
    }

    // Validate priority
    const validPriorities: TicketPriority[] = ['low', 'medium', 'high']
    if (!validPriorities.includes(priority as TicketPriority)) {
      return NextResponse.json(
        { error: 'Invalid priority level' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
    if (!emailRegex.test(customer_email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // For customers, validate they're creating a ticket with their own email
    if (session.user.user_metadata.role === 'customer' && 
        customer_email !== session.user.email) {
      return NextResponse.json(
        { error: 'Customers can only create tickets with their own email' },
        { status: 403 }
      )
    }

    // For agents/admins creating tickets for others, verify permissions
    if (customer_email !== session.user.email) {
      if (!session.user.user_metadata.role || 
          (session.user.user_metadata.role !== 'agent' && 
           session.user.user_metadata.role !== 'admin')) {
        return NextResponse.json(
          { error: 'Not authorized to create tickets for others' },
          { status: 403 }
        )
      }
    }

    // For customers, check ticket limit
    if (session.user.user_metadata.role === 'customer') {
      const { count } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('customer_email', customer_email)
        .in('status', ['open', 'in_progress'])

      if (count && count >= 10) {
        return NextResponse.json(
          { error: 'Maximum number of active tickets reached (10)' },
          { status: 400 }
        )
      }
    }

    // Create ticket
    const ticketData = {
      title,
      description,
      status: 'open',
      priority,
      created_by: session.user.id,
      customer_email
    }

    const { data: ticket, error: insertError } = await supabase
      .from('tickets')
      .insert(ticketData)
      .select()
      .single()

    if (insertError) {
      console.error('Error creating ticket:', insertError)
      return NextResponse.json(
        { error: 'Failed to create ticket' },
        { status: 500 }
      )
    }

    return NextResponse.json(ticket)
  } catch (error) {
    console.error('Error processing request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 