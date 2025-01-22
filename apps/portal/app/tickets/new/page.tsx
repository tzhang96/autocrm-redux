'use client'

import { CustomerAPI } from '@autocrm/api-client'
import { NewTicketForm } from '@autocrm/ui'
import { CreateTicketData } from '@autocrm/core'
import { createSupabaseClient } from '@/utils/supabase'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

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
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">Create New Ticket</h1>
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