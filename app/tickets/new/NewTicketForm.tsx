'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserRole, TicketPriority } from '@/lib/core/types'
import RichTextEditor from '@/components/RichTextEditor'

interface Customer {
  user_id: string
  name: string
  email: string
}

interface NewTicketFormProps {
  userRole: UserRole
  customers: Customer[]
  userName: string
}

export default function NewTicketForm({ userRole, customers, userName }: NewTicketFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [onBehalfOf, setOnBehalfOf] = useState<string>('')
  const [description, setDescription] = useState('')
  const [validationErrors, setValidationErrors] = useState<{
    title?: string;
    description?: string;
    priority?: string;
  }>({})

  // Add character count state
  const [charCount, setCharCount] = useState(0)

  const validateForm = (formData: FormData): boolean => {
    const errors: typeof validationErrors = {}
    let isValid = true

    // Validate title
    const title = formData.get('title') as string
    if (!title?.trim()) {
      errors.title = 'Title is required'
      isValid = false
    } else if (title.length < 3) {
      errors.title = 'Title must be at least 3 characters'
      isValid = false
    } else if (title.length > 200) {
      errors.title = 'Title must be less than 200 characters'
      isValid = false
    }

    // Validate description
    if (!description?.trim()) {
      errors.description = 'Description is required'
      isValid = false
    }

    // Validate priority
    const priority = formData.get('priority') as TicketPriority
    if (!priority) {
      errors.priority = 'Priority is required'
      isValid = false
    } else if (!['low', 'medium', 'high'].includes(priority)) {
      errors.priority = 'Invalid priority level'
      isValid = false
    }

    setValidationErrors(errors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setValidationErrors({})

    const formData = new FormData(e.currentTarget)
    
    // Client-side validation
    if (!validateForm(formData)) {
      return
    }

    setIsSubmitting(true)

    const data = {
      title: formData.get('title') as string,
      description,
      priority: formData.get('priority') as TicketPriority,
      ...(onBehalfOf && { onBehalfOf })
    }

    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create ticket')
      }

      setSuccess(true)
      // Wait a moment to show the success message before redirecting
      setTimeout(() => {
        router.push(`/tickets/${result.id}`)
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Update the description change handler
  const handleDescriptionChange = (newContent: string) => {
    // Strip HTML tags to count only text characters
    const textContent = newContent.replace(/<[^>]*>/g, '')
    if (textContent.length <= 5000) {
      setDescription(newContent)
      setCharCount(textContent.length)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-full">
      {/* Success Message */}
      {success && (
        <div className="rounded-md bg-green-50 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Ticket created successfully!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* On Behalf Of (for agents/admins) */}
      {userRole !== 'customer' && (
        <div>
          <label htmlFor="onBehalfOf" className="block text-sm font-medium text-gray-700">
            Create Ticket For
          </label>
          <select
            id="onBehalfOf"
            name="onBehalfOf"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={onBehalfOf}
            onChange={(e) => setOnBehalfOf(e.target.value)}
          >
            <option value="">Myself ({userName})</option>
            <optgroup label="Customers">
              {customers.map((customer) => (
                <option key={customer.user_id} value={customer.email}>
                  {customer.name} ({customer.email})
                </option>
              ))}
            </optgroup>
          </select>
        </div>
      )}

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          name="title"
          id="title"
          required
          minLength={3}
          maxLength={200}
          className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
            validationErrors.title
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
          }`}
          placeholder="Brief summary of the issue"
        />
        {validationErrors.title && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.title}</p>
        )}
      </div>

      {/* Description with Rich Text Editor */}
      <div className="w-full">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <div className="prose-sm max-w-none">
          <RichTextEditor
            content={description}
            onChange={handleDescriptionChange}
            placeholder="Please provide as much detail as possible..."
          />
          <div className="mt-1 text-sm text-gray-500 flex justify-end">
            {charCount}/5000 characters
          </div>
        </div>
        {validationErrors.description && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.description}</p>
        )}
      </div>

      {/* Priority */}
      <div>
        <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
          Priority
        </label>
        <select
          id="priority"
          name="priority"
          className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
            validationErrors.priority
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
          }`}
          defaultValue="medium"
        >
          <option value="low">Low - Minor issue, no urgency</option>
          <option value="medium">Medium - Standard priority</option>
          <option value="high">High - Urgent issue requiring immediate attention</option>
        </select>
        {validationErrors.priority && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.priority}</p>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`
            inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm
            ${isSubmitting
              ? 'bg-indigo-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
            }
          `}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating...
            </>
          ) : 'Create Ticket'}
        </button>
      </div>
    </form>
  )
} 