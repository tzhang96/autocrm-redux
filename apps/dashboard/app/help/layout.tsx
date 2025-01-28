import { DocSidebar } from './_components/DocSidebar';
import { DocSearch } from './_components/DocSearch';
import { Header } from '@/components/Header';

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <DocSidebar />
        <div className="flex-1 overflow-auto">
          <div className="p-4 border-b">
            <DocSearch />
          </div>
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
} 