// Load environment variables before any imports
import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env file
config({ path: resolve(__dirname, '../../../.env') })

// Verify environment variables are loaded
const requiredEnvVars = [
  'OPENAI_API_KEY',
  'LANGCHAIN_API_KEY',
  'LANGCHAIN_ENDPOINT',
  'LANGCHAIN_PROJECT',
  'LANGSMITH_API_KEY',
  'LANGSMITH_ENDPOINT',
  'LANGSMITH_PROJECT',
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY'
]

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`)
  }
}

// Now import LangChain and other dependencies
import { AIReplyChain } from '../chains'
import { HelpDocsTool } from '../tools'
import { MessageHistoryEntry, TicketContext } from '../../types/ai'

async function testAIReply() {
  // 1. Set up test data
  const testTicket = {
    ticket_id: 'test-123',
    title: 'Need help with login issues',
    description: 'I cannot log in to my account. It keeps saying invalid credentials even though I\'m sure my password is correct.',
    status: 'open' as const,
    priority: 'high' as const,
    customer_email: 'test@example.com',
    customer_name: 'Test User',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_activity_at: new Date().toISOString(),
    created_by: 'test-user-id',
    assigned_to: undefined,
    tags: ['login', 'authentication'],
    custom_fields: {}
  }

  const testMessages: MessageHistoryEntry[] = [
    {
      role: 'customer',
      content: 'Hi, I\'m having trouble logging in to my account. I\'ve tried resetting my password but still no luck.',
      timestamp: new Date().toISOString(),
      visibility: 'public',
      type: 'text',
      metadata: {}
    },
    {
      role: 'agent',
      content: 'Hello! I\'m sorry to hear you\'re having trouble. Could you tell me what error message you\'re seeing?',
      timestamp: new Date().toISOString(),
      visibility: 'public',
      type: 'text',
      metadata: {}
    },
    {
      role: 'customer',
      content: 'It says "Invalid credentials" even after I reset my password. I\'m using the new password from the reset email.',
      timestamp: new Date().toISOString(),
      visibility: 'public',
      type: 'text',
      metadata: {}
    }
  ]

  // 2. Initialize tools
  const helpDocsTool = new HelpDocsTool(
    process.env.OPENAI_API_KEY!,
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const aiReplyChain = new AIReplyChain(
    process.env.OPENAI_API_KEY!,
    process.env.AI_MODEL_NAME,
    Number(process.env.AI_TEMPERATURE)
  )

  try {
    // 3. Search for relevant docs
    console.log('Searching for relevant documentation...')
    const helpDocsResponse = await helpDocsTool.searchRelevantDocs(
      testTicket.title,
      testTicket.description,
      testMessages[testMessages.length - 1].content,
      { limit: 3, threshold: 0.7 }
    )
    console.log('Found docs:', helpDocsResponse.documents.map(d => d.title))

    // 4. Generate AI reply
    console.log('\nGenerating AI reply...')
    const ticketContext: TicketContext = {
      ticket: testTicket,
      customer: {
        name: testTicket.customer_name,
        email: testTicket.customer_email
      }
    }

    const chainResponse = await aiReplyChain.generateReply({
      ticketId: testTicket.ticket_id,
      ticketContext,
      messageHistory: testMessages,
      relevantDocs: helpDocsResponse.documents
    })

    // 5. Log results
    console.log('\nAI Reply Generated:')
    console.log('-------------------')
    console.log(chainResponse.reply)
    console.log('\nMetadata:')
    console.log('- Confidence:', chainResponse.confidence)
    console.log('- Model:', chainResponse.modelName)
    console.log('- Used Docs:', chainResponse.usedDocs)
  } catch (error) {
    console.error('Test failed:', error)
  }
}

// Run if called directly
if (require.main === module) {
  testAIReply()
} 