import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { AICheckerChain } from '@autocrm/core/ai/chains/AICheckerChain'
import { HelpDocsTool } from '@autocrm/core'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const helpDocsTool = new HelpDocsTool(
  process.env.OPENAI_API_KEY!,
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { content } = await request.json()
    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    // Fetch ticket with messages
    const { data: ticket } = await supabase
      .from('tickets')
      .select(`
        *,
        messages!messages_ticket_id_fkey(
          *,
          user:users(*)
        )
      `)
      .eq('ticket_id', params.id)
      .single()

    if (!ticket) {
      console.error(`Ticket not found: ${params.id}`)
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key not configured')
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    // Format ticket context
    const ticketContext = `
Ticket Title: ${ticket.title}
Description: ${ticket.description}
Status: ${ticket.status}
Priority: ${ticket.priority}
Customer: ${ticket.customer_name} (${ticket.customer_email})
    `.trim()

    // Format message history
    const messageHistory = ticket.messages
      .map((msg: any) => {
        const role = msg.user?.role === 'customer' ? 'Customer' : 'Agent'
        return `${role}: ${msg.content}`
      })
      .join('\n\n')

    // Search for relevant documentation
    const helpDocsResponse = await helpDocsTool.searchRelevantDocs(
      ticket.title,
      ticket.description,
      content,
      { limit: 3, threshold: 0.7 }
    )

    const documentationContext = helpDocsResponse.documents
      .map(doc => `${doc.title}\n${doc.content}`)
      .join('\n\n')

    const chain = new AICheckerChain(
      process.env.OPENAI_API_KEY!,
      process.env.AI_MODEL_NAME,
      0.3 // Lower temperature for more consistent feedback
    )

    console.log('Checking message with context...')
    const feedback = await chain.check({
      content,
      ticketContext,
      messageHistory,
      documentationContext
    })

    if (!feedback || typeof feedback.isValid !== 'boolean' || typeof feedback.message !== 'string') {
      console.error('Invalid feedback format:', feedback)
      return NextResponse.json(
        { error: 'Invalid feedback format from AI checker' },
        { status: 500 }
      )
    }

    return NextResponse.json(feedback)
  } catch (error) {
    console.error('Error in AI checker:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 