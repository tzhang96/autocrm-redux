import { ChatOpenAI } from '@langchain/openai'
import { PromptTemplate } from '@langchain/core/prompts'
import { RunnableSequence } from '@langchain/core/runnables'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { BaseCallbackConfig } from '@langchain/core/callbacks/manager'
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
1. Be professional, courteous, and concise
2. Use knowledge from the documentation to inform your response, but don't reference or link to it
3. Provide clear, actionable steps when giving instructions
4. Start with "Dear Customer," and sign off with your response as "Best regards, Widget Inc."
5. Focus on addressing the immediate concern without overwhelming with information
6. Keep responses clear but brief - aim for 2-3 short paragraphs maximum
7. End with a simple, clear next step or brief invitation for questions

Compose a response that addresses the customer's needs:`

export class AIReplyChain {
  private chain: RunnableSequence
  private model: ChatOpenAI
  private readonly timeout: number = 25000 // 25 second timeout
  private readonly projectName: string

  constructor(
    apiKey: string,
    modelName: string = 'gpt-4-turbo-preview',
    temperature: number = 0.7
  ) {
    this.projectName = process.env.LANGSMITH_PROJECT || 'autocrm-ticket-replies'
    
    this.model = new ChatOpenAI({
      openAIApiKey: apiKey,
      modelName,
      temperature,
      configuration: {
        baseURL: process.env.OPENAI_API_BASE_URL,
      },
      timeout: this.timeout
    })

    const prompt = PromptTemplate.fromTemplate(SYSTEM_TEMPLATE)

    this.chain = RunnableSequence.from([
      {
        ticketTitle: (input: AIReplyChainInput) => input.ticketContext.ticket.title,
        ticketDescription: (input: AIReplyChainInput) => input.ticketContext.ticket.description,
        ticketStatus: (input: AIReplyChainInput) => input.ticketContext.ticket.status,
        ticketPriority: (input: AIReplyChainInput) => input.ticketContext.ticket.priority,
        relevantDocs: (input: AIReplyChainInput) => this.formatRelevantDocs(input.relevantDocs || []),
        conversationHistory: (input: AIReplyChainInput) => this.formatConversationHistory(input.messageHistory)
      },
      prompt,
      this.model,
      new StringOutputParser(),
      (text: string) => {
        try {
          // Format the response into HTML paragraphs
          const formattedHtml = text
            .split('\n\n')
            .map(paragraph => `<p>${paragraph.replace(/\n/g, '<br />')}</p>`)
            .join('\n')

          if (!formattedHtml.trim()) {
            throw new Error('Empty response received from model')
          }

          return formattedHtml
        } catch (error) {
          console.error('Error formatting AI reply:', error)
          return '<p>I apologize, but I was unable to generate a response at this time. Please try again.</p>'
        }
      }
    ])
  }

  private formatConversationHistory(messages: MessageHistoryEntry[]): string {
    return messages
      .map(msg => `${msg.role.toUpperCase()}: ${msg.content}`)
      .join('\n\n')
  }

  private formatRelevantDocs(docs: HelpDocsResult[]): string {
    if (!docs.length) return 'No relevant documentation found.'
    
    // Only include content and title, no URLs
    return docs
      .map(doc => `[${doc.title}]\n${doc.content}`)
      .join('\n\n')
  }

  async generateReply(input: AIReplyChainInput): Promise<AIReplyChainOutput> {
    const runId = `reply-${input.ticketId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    
    const config: BaseCallbackConfig = {
      runName: runId,
      tags: ['ai-reply'],
      metadata: { 
        project: this.projectName,
        ticketId: input.ticketId,
        timestamp: new Date().toISOString()
      }
    }

    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Operation timed out')), this.timeout)
      })

      const formattedReply = await Promise.race([
        this.chain.invoke(input, config),
        timeoutPromise
      ])

      return {
        reply: formattedReply,
        confidence: 0.95,
        usedDocs: (input.relevantDocs || []).map(doc => doc.url).filter((url): url is string => url !== undefined),
        modelName: this.model.modelName
      }
    } catch (error) {
      console.error('Error generating AI reply:', error)
      
      return {
        reply: '<p>I apologize, but I was unable to generate a response at this time. Please try again.</p>',
        confidence: 0,
        usedDocs: [],
        modelName: this.model.modelName
      }
    }
  }
} 