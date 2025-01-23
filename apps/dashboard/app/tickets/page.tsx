'use client'

import { useState, useEffect, useCallback, useTransition } from 'react'
import { DashboardTicketList } from '@autocrm/ui'
import { Ticket, TicketStatus, TicketPriority } from '@autocrm/core'
import { useRouter } from 'next/navigation'
import { fetchTickets } from './actions'

const statusOptions: TicketStatus[] = ['open', 'pending', 'resolved', 'closed']
const priorityOptions: TicketPriority[] = ['low', 'medium', 'high']
const sortOptions = [
  { value: 'created_at', label: 'Created Date' },
  { value: 'last_activity_at', label: 'Last Activity' },
  { value: 'priority', label: 'Priority' },
  { value: 'status', label: 'Status' }
] as const

type SortField = typeof sortOptions[number]['value']
type SortOrder = 'asc' | 'desc'

export default function TicketsListPage() {
  const router = useRouter()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [totalTickets, setTotalTickets] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTickets, setSelectedTickets] = useState<string[]>([])
  const [isPending, startTransition] = useTransition()
  const [filters, setFilters] = useState({
    limit: 10,
    offset: 0,
    status: undefined as TicketStatus | undefined,
    priority: undefined as TicketPriority | undefined,
    search: '',
    assignedTo: undefined as string | null | undefined,
    sortBy: 'created_at' as SortField,
    sortOrder: 'desc' as SortOrder,
    tags: [] as string[]
  })

  const loadTickets = useCallback(async () => {
    try {
      setError(null)
      setLoading(true)
      
      // Use startTransition to avoid UI freezing during server action
      startTransition(async () => {
        const { tickets: newTickets, total } = await fetchTickets(filters)
        setTickets(newTickets)
        setTotalTickets(total)
      })
    } catch (err) {
      console.error('Failed to load tickets:', err)
      setError('Failed to load tickets. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    loadTickets()
  }, [loadTickets])

  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    // Debounce search input changes
    if (key === 'search') {
      const timeoutId = setTimeout(() => {
        setFilters(prev => ({
          ...prev,
          [key]: value,
          offset: 0,
        }))
      }, 300)
      return () => clearTimeout(timeoutId)
    }

    setFilters(prev => ({
      ...prev,
      [key]: value,
      // Reset offset when changing filters except for pagination
      ...(key !== 'offset' && { offset: 0 }),
    }))
  }

  const handleTicketClick = (ticketId: string) => {
    console.log('Dashboard: Navigating to ticket:', ticketId)
    router.push(`/tickets/${ticketId}`)
  }

  const handleSelectionChange = (selectedIds: string[]) => {
    setSelectedTickets(selectedIds)
  }

  const toggleSortOrder = () => {
    const newOrder: SortOrder = filters.sortOrder === 'asc' ? 'desc' : 'asc'
    handleFilterChange('sortOrder', newOrder)
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">All Tickets</h1>
          {selectedTickets.length > 0 && (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {selectedTickets.length} selected
              </span>
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => {
                  // TODO: Implement bulk actions
                  console.log('Bulk action for tickets:', selectedTickets)
                }}
              >
                Bulk Actions
              </button>
            </div>
          )}
        </div>
        
        {/* Filters */}
        <div className="mt-4 space-y-4">
          {/* First Row: Status, Priority, and Search */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Status Filter */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="status"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
              >
                <option value="">All Statuses</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                Priority
              </label>
              <select
                id="priority"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={filters.priority || ''}
                onChange={(e) => handleFilterChange('priority', e.target.value || undefined)}
              >
                <option value="">All Priorities</option>
                {priorityOptions.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                Search
              </label>
              <input
                type="text"
                id="search"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Search tickets..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
          </div>

          {/* Second Row: Assignment and Sorting */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Assignment Filter */}
            <div>
              <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700">
                Assignment
              </label>
              <select
                id="assignedTo"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={filters.assignedTo === undefined ? '' : filters.assignedTo === null ? 'unassigned' : filters.assignedTo}
                onChange={(e) => {
                  const value = e.target.value
                  handleFilterChange('assignedTo', value === '' ? undefined : value === 'unassigned' ? null : value)
                }}
              >
                <option value="">All Tickets</option>
                <option value="unassigned">Unassigned</option>
                {/* TODO: Add list of agents */}
              </select>
            </div>

            {/* Sort Field */}
            <div>
              <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700">
                Sort By
              </label>
              <select
                id="sortBy"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value as SortField)}
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Sort Order
              </label>
              <button
                type="button"
                onClick={toggleSortOrder}
                className="mt-1 inline-flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                {filters.sortOrder === 'asc' ? (
                  <span className="flex items-center">
                    Ascending
                    <svg className="ml-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                  </span>
                ) : (
                  <span className="flex items-center">
                    Descending
                    <svg className="ml-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-md">
          {error}
          <button 
            onClick={loadTickets}
            className="ml-4 text-sm underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Loading State */}
      {(loading || isPending) ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <>
          {/* Ticket List */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <DashboardTicketList
              tickets={tickets}
              onTicketClick={handleTicketClick}
              onSelectionChange={handleSelectionChange}
              sortBy={filters.sortBy}
              sortOrder={filters.sortOrder}
            />
          </div>

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={() => handleFilterChange('offset', Math.max(0, (filters.offset || 0) - (filters.limit || 10)))}
                disabled={(filters.offset || 0) === 0}
                className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => handleFilterChange('offset', (filters.offset || 0) + (filters.limit || 10))}
                disabled={(filters.offset || 0) + tickets.length >= totalTickets}
                className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{Math.min(totalTickets, (filters.offset || 0) + 1)}</span> to{' '}
                  <span className="font-medium">{Math.min(totalTickets, (filters.offset || 0) + tickets.length)}</span> of{' '}
                  <span className="font-medium">{totalTickets}</span> results
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <button
                    onClick={() => handleFilterChange('offset', Math.max(0, (filters.offset || 0) - (filters.limit || 10)))}
                    disabled={(filters.offset || 0) === 0}
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handleFilterChange('offset', (filters.offset || 0) + (filters.limit || 10))}
                    disabled={(filters.offset || 0) + tickets.length >= totalTickets}
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
} 