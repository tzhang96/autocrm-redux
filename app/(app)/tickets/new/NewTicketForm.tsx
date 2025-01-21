'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import RichTextEditor from '@/app/components/RichTextEditor'
import { TicketPriority, TicketStatus } from '@/lib/core/types'

interface NewTicketFormProps {
  userRole: string
  userEmail: string
}

export default function NewTicketForm({ userRole, userEmail }: NewTicketFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TicketPriority>('low')
  const [customerEmail, setCustomerEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize customerEmail when component mounts
  useEffect(() => {
    console.log('Current userRole:', userRole) // Debug log
    if (userRole === 'customer') {
      setCustomerEmail(userEmail)
    }
  }, [userRole, userEmail])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const supabase = await createClient()

      if (!customerEmail) {
        throw new Error('Customer email is required')
      }

      // First, get the user ID of the creator
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('user_id')
        .eq('email', userEmail)
        .single()

      console.log('Looking up user with email:', userEmail)
      console.log('User lookup result:', { userData, userError })

      if (userError || !userData) {
        throw new Error('Could not find user information')
      }

      // Then create the ticket with the user ID
      const { error: insertError } = await supabase
        .from('tickets')
        .insert([
          {
            title,
            description,
            priority,
            status: 'open' as TicketStatus,
            customer_email: customerEmail,
            created_by: userData.user_id,
          },
        ])

      if (insertError) throw insertError

      router.push('/tickets')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while creating the ticket')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Determine if the field should be readonly based on role
  const isReadOnly = userRole === 'customer'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-800 p-4 rounded-md">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
          Priority
        </label>
        <select
          id="priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value as TicketPriority)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div>
        <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700">
          Customer Email {isReadOnly ? '(Your email)' : ''}
        </label>
        <input
          type="email"
          id="customerEmail"
          value={customerEmail}
          onChange={(e) => setCustomerEmail(e.target.value)}
          readOnly={isReadOnly}
          required
          placeholder={isReadOnly ? '' : "Enter customer's email"}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
        />
      </div>

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Creating...' : 'Create Ticket'}
        </button>
      </div>
    </form>
  )
} 