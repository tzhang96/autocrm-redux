import { ChatOpenAI } from '@langchain/openai'
import { PromptTemplate } from '@langchain/core/prompts'
import { RunnableSequence } from '@langchain/core/runnables'
import { StringOutputParser } from '@langchain/core/output_parsers'

const SYSTEM_TEMPLATE = `You are an expert customer service message validator. Your role is to analyze support messages for quality, tone, professionalism, and most importantly, accuracy and consistency with the ticket context and documentation.

Analyze the message for:
1. Accuracy and consistency with:
   - Ticket context and customer's issue
   - Previous message history
   - Relevant documentation
2. Professional tone and language
3. Clarity and conciseness
4. Grammar and spelling

Return ONLY a JSON object in the following format, with no markdown formatting or backticks:
{
  "isValid": boolean,
  "message": "Your detailed feedback here"
}

Keep feedback concise but actionable. If the message needs improvements, explain what and why.
If the message is good, briefly mention its strengths.

Pay special attention to factual accuracy and consistency with provided context.`

export interface AICheckerInput {
  content: string
  ticketContext?: string
  messageHistory?: string
  documentationContext?: string
}

export class AICheckerChain {
  private chain: RunnableSequence
  private model: ChatOpenAI

  constructor(
    apiKey: string,
    modelName: string = 'gpt-4-turbo-preview',
    temperature: number = 0.3
  ) {
    this.model = new ChatOpenAI({
      openAIApiKey: apiKey,
      modelName,
      temperature,
      configuration: {
        baseURL: process.env.OPENAI_API_BASE_URL,
      }
    })

    const prompt = PromptTemplate.fromTemplate(`
      System: {system}
      
      Ticket Context: {ticketContext}
      
      Previous Messages: {messageHistory}
      
      Relevant Documentation: {documentationContext}
      
      Message to analyze: {content}
      
      Remember to return ONLY a raw JSON object with no markdown formatting or backticks.
    `)

    this.chain = RunnableSequence.from([
      {
        system: () => SYSTEM_TEMPLATE,
        ticketContext: (input: AICheckerInput) => input.ticketContext || "No ticket context provided",
        messageHistory: (input: AICheckerInput) => input.messageHistory || "No message history",
        documentationContext: (input: AICheckerInput) => input.documentationContext || "No documentation context",
        content: (input: AICheckerInput) => input.content,
      },
      prompt,
      this.model,
      new StringOutputParser(),
      (output: string) => {
        try {
          // Clean up any potential markdown formatting
          const cleanJson = output.replace(/```json\n?|\n?```/g, '').trim()
          const result = JSON.parse(cleanJson)
          
          // Validate the expected structure
          if (typeof result.isValid !== 'boolean' || typeof result.message !== 'string') {
            throw new Error('Invalid response format')
          }
          return result
        } catch (error) {
          console.error('Error parsing AI checker output:', error)
          console.error('Raw output:', output)
          return {
            isValid: false,
            message: 'Error analyzing message. Please try again.',
          }
        }
      },
    ])
  }

  async check(input: AICheckerInput) {
    try {
      const result = await this.chain.invoke(
        input,
        {
          configurable: {
            tags: ['ai-checker'],
            metadata: { project: process.env.LANGCHAIN_PROJECT_CHECKER || 'autocrm-message-validation' }
          }
        }
      )
      return result
    } catch (error) {
      console.error('Error in AI checker chain:', error)
      return {
        isValid: false,
        message: 'Error analyzing message. Please try again.',
      }
    }
  }
} 