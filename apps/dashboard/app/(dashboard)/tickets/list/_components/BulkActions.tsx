'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { TicketStatus, TicketPriority } from '@autocrm/core'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { bulkUpdateTicketStatus, bulkUpdateTicketPriority, bulkAssignTickets } from '../../actions'

interface BulkActionsProps {
  selectedTickets: string[]
  availableAgents: Array<{
    user_id: string
    name: string | null
    email: string
    role: 'agent' | 'admin'
  }>
  onActionComplete?: () => void
}

const statusOptions: TicketStatus[] = ['open', 'pending', 'resolved', 'closed']
const priorityOptions: TicketPriority[] = ['low', 'medium', 'high']

export function BulkActions({ selectedTickets, availableAgents, onActionComplete }: BulkActionsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleStatusChange = async (status: TicketStatus) => {
    if (isLoading) return
    try {
      setIsLoading(true)
      await bulkUpdateTicketStatus(selectedTickets, status)
      toast.success(`Updated status to ${status} for ${selectedTickets.length} tickets`)
      onActionComplete?.()
      router.refresh()
    } catch (error) {
      console.error('Failed to update status:', error)
      toast.error('Failed to update ticket status')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePriorityChange = async (priority: TicketPriority) => {
    if (isLoading) return
    try {
      setIsLoading(true)
      await bulkUpdateTicketPriority(selectedTickets, priority)
      toast.success(`Updated priority to ${priority} for ${selectedTickets.length} tickets`)
      onActionComplete?.()
      router.refresh()
    } catch (error) {
      console.error('Failed to update priority:', error)
      toast.error('Failed to update ticket priority')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAssignmentChange = async (agentId: string | null) => {
    if (isLoading) return
    try {
      setIsLoading(true)
      await bulkAssignTickets(selectedTickets, agentId)
      const actionText = agentId === null ? 'Unassigned' : 'Assigned'
      toast.success(`${actionText} ${selectedTickets.length} tickets`)
      onActionComplete?.()
      router.refresh()
    } catch (error) {
      console.error('Failed to update assignment:', error)
      toast.error('Failed to update ticket assignment')
    } finally {
      setIsLoading(false)
    }
  }

  if (selectedTickets.length === 0) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="default"
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
          disabled={isLoading}
        >
          Bulk Actions ({selectedTickets.length})
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem disabled className="text-sm font-medium text-gray-500">
          Status
        </DropdownMenuItem>
        {statusOptions.map((status) => (
          <DropdownMenuItem
            key={status}
            onClick={() => handleStatusChange(status)}
            disabled={isLoading}
          >
            Set status to {status}
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem disabled className="text-sm font-medium text-gray-500">
          Priority
        </DropdownMenuItem>
        {priorityOptions.map((priority) => (
          <DropdownMenuItem
            key={priority}
            onClick={() => handlePriorityChange(priority)}
            disabled={isLoading}
          >
            Set priority to {priority}
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem disabled className="text-sm font-medium text-gray-500">
          Assignment
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleAssignmentChange(null)}
          disabled={isLoading}
        >
          Unassign tickets
        </DropdownMenuItem>
        {availableAgents.map((agent) => (
          <DropdownMenuItem
            key={agent.user_id}
            onClick={() => handleAssignmentChange(agent.user_id)}
            disabled={isLoading}
          >
            Assign to {agent.name || agent.email}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 