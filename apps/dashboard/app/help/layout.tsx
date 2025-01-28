import { DocSidebar } from './_components/DocSidebar';
import { DocSearch } from './_components/DocSearch';

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <DocSidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-4 border-b">
          <DocSearch />
        </div>
        <main>{children}</main>
      </div>
    </div>
  );
} 