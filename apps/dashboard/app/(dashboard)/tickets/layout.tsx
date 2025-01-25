import { handleLogout } from '@/app/auth/actions'

export default function TicketsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      {/* Header with logout */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-xl font-semibold text-gray-900">AutoCRM Dashboard</h1>
            <form action="">
              <button
                type="submit"
                formAction={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Page content */}
      <main>{children}</main>
    </div>
  )
} 