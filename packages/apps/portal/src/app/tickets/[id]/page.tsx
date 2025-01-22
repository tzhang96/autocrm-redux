import { CustomerAPI } from '@autocrm/api-client'
import { createServerSupabaseClient } from '@/utils/supabase'
import TicketContent from '@/components/TicketContent'
import TicketMessages from '@/components/TicketMessages'

interface Props {
  params: {
    id: string
  }
}

async function getTicketData(ticketId: string) {
  const supabase = createServerSupabaseClient()
  const customerApi = new CustomerAPI(supabase)
  
  const [ticket, messages] = await Promise.all([
    customerApi.getMyTicket(ticketId),
    customerApi.getTicketMessages(ticketId)
  ])

  if (!ticket) {
    throw new Error('Ticket not found')
  }

  return { ticket, messages }
}

export default async function TicketPage({ params }: Props) {
  const { ticket, messages } = await getTicketData(params.id)

  return (
    <div className="space-y-6">
      <TicketContent ticket={ticket} />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <TicketMessages 
            ticketId={ticket.id} 
            messages={messages} 
            customerApi={new CustomerAPI(createServerSupabaseClient())} 
          />
        </div>
      </div>
    </div>
  )
} 