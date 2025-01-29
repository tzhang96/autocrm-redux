import { ChatOpenAI } from '@langchain/openai'
import { PromptTemplate } from 'langchain/prompts'
import { LLMChain } from 'langchain/chains'
import { AIReplyChainInput, AIReplyChainOutput, MessageHistoryEntry, HelpDocsResult } from '../../types/ai'

const SYSTEM_TEMPLATE = `You are a helpful customer support agent. Your goal is to provide accurate, professional, and empathetic responses to customer inquiries.

Context about the ticket:
Title: {ticketTitle}
Description: {ticketDescription}
Status: {ticketStatus}
Priority: {ticketPriority}

Relevant documentation:
{relevantDocs}

Previous conversation history:
{conversationHistory}

Guidelines:
1. Be professional and courteous
2. Reference relevant documentation when applicable
3. Provide clear, actionable steps when giving instructions
4. If technical details are involved, explain them clearly
5. End with a clear next step or invitation for further questions

Compose a response that addresses the customer's needs:`

export class AIReplyChain {
  private chain: LLMChain
  private model: ChatOpenAI

  constructor(
    apiKey: string,
    modelName: string = 'gpt-4-turbo-preview',
    temperature: number = 0.7
  ) {
    this.model = new ChatOpenAI({
      openAIApiKey: apiKey,
      modelName,
      temperature,
      configuration: {
        baseURL: process.env.OPENAI_API_BASE_URL,
      }
    })

    const prompt = new PromptTemplate({
      template: SYSTEM_TEMPLATE,
      inputVariables: [
        'ticketTitle',
        'ticketDescription',
        'ticketStatus',
        'ticketPriority',
        'relevantDocs',
        'conversationHistory'
      ]
    })

    this.chain = new LLMChain({
      llm: this.model,
      prompt,
      verbose: true,
      tags: ['ai-reply', process.env.LANGCHAIN_PROJECT || 'autocrm-ticket-replies']
    })
  }

  private formatConversationHistory(messages: MessageHistoryEntry[]): string {
    return messages
      .map(msg => `${msg.role.toUpperCase()}: ${msg.content}`)
      .join('\n\n')
  }

  private formatRelevantDocs(docs: HelpDocsResult[]): string {
    if (!docs.length) return 'No relevant documentation found.'
    
    return docs
      .map(doc => `[${doc.title}]\n${doc.content}\nURL: ${doc.url}`)
      .join('\n\n')
  }

  async generateReply(input: AIReplyChainInput): Promise<AIReplyChainOutput> {
    try {
      const { ticketContext, messageHistory, relevantDocs = [] } = input

      const response = await this.chain.call({
        ticketTitle: ticketContext.ticket.title,
        ticketDescription: ticketContext.ticket.description,
        ticketStatus: ticketContext.ticket.status,
        ticketPriority: ticketContext.ticket.priority,
        relevantDocs: this.formatRelevantDocs(relevantDocs),
        conversationHistory: this.formatConversationHistory(messageHistory)
      }, {
        tags: [`ticket-${input.ticketId}`, `priority-${ticketContext.ticket.priority}`]
      })

      return {
        reply: response.text,
        confidence: 0.95, // TODO: Implement proper confidence scoring
        usedDocs: relevantDocs.map(doc => doc.url).filter((url): url is string => url !== undefined),
        modelName: this.model.modelName
      }
    } catch (error) {
      console.error('Error generating AI reply:', error)
      throw error
    }
  }
} 