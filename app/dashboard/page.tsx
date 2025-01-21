import React from 'react'
import Link from 'next/link'

export default function DashboardPage() {
  return (
    <>
      {/* Top Bar */}
      <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6">
        <div className="flex items-center">
          <h2 className="text-lg font-medium text-gray-900">All Tickets</h2>
        </div>
        <Link
          href="/tickets/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Create Ticket
        </Link>
      </header>

      {/* Ticket List */}
      <main className="flex-1 overflow-y-auto bg-white p-6">
        {/* Filters */}
        <div className="mb-6 flex items-center space-x-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search tickets..."
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <select className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
            <option>All Status</option>
            <option>Open</option>
            <option>In Progress</option>
            <option>Resolved</option>
          </select>
          <select className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
            <option>All Priority</option>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </div>

        {/* Ticket Table */}
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">ID</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Title</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Priority</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Created</th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {/* Example ticket - we'll make this dynamic later */}
              <tr>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900">#1001</td>
                <td className="px-3 py-4 text-sm text-gray-900">Unable to access account</td>
                <td className="px-3 py-4 text-sm">
                  <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                    Open
                  </span>
                </td>
                <td className="px-3 py-4 text-sm">
                  <span className="inline-flex rounded-full bg-red-100 px-2 text-xs font-semibold leading-5 text-red-800">
                    High
                  </span>
                </td>
                <td className="px-3 py-4 text-sm text-gray-500">2024-03-20</td>
                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
                  <Link href="/tickets/1001" className="text-indigo-600 hover:text-indigo-900">
                    View
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </>
  )
} 