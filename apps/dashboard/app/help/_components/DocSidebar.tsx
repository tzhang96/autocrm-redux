'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const categories = [
  {
    title: 'Getting Started',
    href: '/help/getting-started',
  },
  {
    title: 'Specifications',
    href: '/help/specs',
  },
  {
    title: 'Troubleshooting',
    href: '/help/troubleshooting',
  },
  {
    title: 'Returns & Warranty',
    href: '/help/returns',
  },
  {
    title: 'Pricing',
    href: '/help/pricing',
  },
  {
    title: 'Roadmap',
    href: '/help/roadmap',
  },
];

export function DocSidebar() {
  const pathname = usePathname();

  return (
    <nav className="w-64 p-4 border-r">
      <div className="font-medium mb-4">Documentation</div>
      <div className="space-y-1">
        {categories.map((category) => (
          <Link
            key={category.href}
            href={category.href}
            className={cn(
              'block px-2 py-1 rounded-md text-sm',
              pathname.startsWith(category.href)
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            )}
          >
            {category.title}
          </Link>
        ))}
      </div>
    </nav>
  );
} 