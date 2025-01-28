import { Header } from '@/components/Header';

export default function TicketsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      <Header />
      {/* Page content */}
      <main>{children}</main>
    </div>
  )
} 