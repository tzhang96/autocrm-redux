import { NextResponse } from 'next/server'
import { createServerClient } from '@autocrm/auth'
import { cookies } from 'next/headers'
import { 
  Message, 
  AIReplyResponse, 
  MessageHistoryEntry, 
  TicketContext,
  HelpDocsTool,
  AIReplyChain
} from '@autocrm/core'

// Initialize tools with environment variables
const helpDocsTool = new HelpDocsTool(
  process.env.OPENAI_API_KEY!,
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const aiReplyChain = new AIReplyChain(
  process.env.OPENAI_API_KEY!,
  process.env.AI_MODEL_NAME || 'gpt-4-turbo-preview',
  Number(process.env.AI_TEMPERATURE) || 0.7
)

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse<AIReplyResponse>> {
  console.log('AI Reply request received for ticket:', params.id)
  
  try {
    const cookieStore = cookies()
    const supabase = await createServerClient(cookieStore)
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.error('Unauthorized request')
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const ticketId = params.id
    if (!ticketId) {
      console.error('Missing ticket ID')
      return new NextResponse('Ticket ID is required', { status: 400 })
    }

    console.log('Fetching ticket details...')
    // 1. Get ticket details
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select(`
        *,
        messages!messages_ticket_id_fkey(
          *,
          user:users(*)
        )
      `)
      .eq('ticket_id', ticketId)
      .single()

    if (ticketError || !ticket) {
      console.error('Ticket not found:', ticketError)
      return new NextResponse('Ticket not found', { status: 404 })
    }

    console.log('Formatting conversation history...')
    // 2. Format conversation history
    const conversationHistory: MessageHistoryEntry[] = ticket.messages.map((msg: Message & { user?: { role?: string } }) => ({
      role: msg.user?.role === 'customer' ? 'customer' : 'agent',
      content: msg.content,
      timestamp: msg.created_at,
      visibility: msg.visibility,
      type: msg.message_type,
      metadata: msg.metadata
    }))

    console.log('Searching relevant documentation...')
    // 3. Search for relevant documentation
    const latestMessage = conversationHistory[conversationHistory.length - 1]?.content
    const helpDocsResponse = await helpDocsTool.searchRelevantDocs(
      ticket.title,
      ticket.description,
      latestMessage,
      { limit: 3, threshold: 0.7 }
    )

    console.log('Generating AI reply...')
    // 4. Generate AI reply using the chain
    const ticketContext: TicketContext = {
      ticket,
      customer: {
        name: ticket.customer_name || null,
        email: ticket.customer_email
      }
    }

    const chainResponse = await aiReplyChain.generateReply({
      ticketId,
      ticketContext,
      messageHistory: conversationHistory,
      relevantDocs: helpDocsResponse.documents
    })

    console.log('AI reply generated successfully')
    return NextResponse.json({
      reply: chainResponse.reply,
      metadata: {
        confidence: chainResponse.confidence,
        modelName: chainResponse.modelName,
        usedDocs: chainResponse.usedDocs
      }
    })
  } catch (error) {
    console.error('Error in AI reply generation:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 