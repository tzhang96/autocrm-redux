'use client'

import { CustomerAPI } from '@/lib/api/customer'
import { NewTicketForm } from '@autocrm/ui'
import { CreateTicketData } from '@autocrm/core'
import { createSupabaseClient } from '@/utils/supabase'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Navigation } from '@/components/Navigation'
import Link from 'next/link'

export default function NewTicketPage() {
  const router = useRouter()
  const [customerApi, setCustomerApi] = useState<CustomerAPI | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function initializeApi() {
      try {
        const supabase = createSupabaseClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user?.email) {
          router.push('/login')
          return
        }

        setCustomerApi(new CustomerAPI(supabase, user.email))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize')
      }
    }

    initializeApi()
  }, [router])

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navigation />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!customerApi) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navigation />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="text-center">Loading...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Create New Ticket</h1>
            <Link
              href="/tickets"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <NewTicketForm
                onSubmit={async (data: CreateTicketData) => {
                  await customerApi.createTicket(data)
                }}
                onSuccess={() => router.push('/tickets')}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 