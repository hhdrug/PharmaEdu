'use client';

import Link from 'next/link';
import { Calculator, BookOpen, HelpCircle, Calendar } from 'lucide-react';
import type { HTMLAttributes } from 'react';

interface NavLink {
  href: string;
  label: string;
}

interface MobileNavProps extends HTMLAttributes<HTMLElement> {
  isOpen: boolean;
  links: NavLink[];
  currentPath: string;
  onClose: () => void;
}

const iconMap: Record<string, React.ElementType> = {
  '/calculator': Calculator,
  '/learn': BookOpen,
  '/quiz': HelpCircle,
  '/daily': Calendar,
};

function MobileNav({ isOpen, links, currentPath, onClose, id }: MobileNavProps) {
  return (
    <>
      {/* 오버레이 */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* 슬라이드 다운 메뉴 */}
      <nav
        id={id}
        aria-label="모바일 메뉴"
        className={[
          'md:hidden fixed top-16 left-0 right-0 z-50',
          'bg-bg-surface border-b border-border-light shadow-md',
          'transition-all duration-300 ease-in-out',
          isOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-2 pointer-events-none',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <ul className="py-2 px-4 space-y-1" role="list">
          {links.map((link) => {
            const Icon = iconMap[link.href];
            const isActive =
              link.href === '/'
                ? currentPath === '/'
                : currentPath.startsWith(link.href);

            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={onClose}
                  className={[
                    'flex items-center gap-3',
                    'px-4 py-3 rounded-lg',
                    'text-sm font-medium',
                    'min-h-[44px]',
                    'transition-colors duration-150',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
                    isActive
                      ? 'text-primary-600 font-semibold bg-primary-50'
                      : 'text-text-secondary hover:text-primary-500 hover:bg-neutral-50',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {Icon && <Icon className="w-5 h-5" aria-hidden="true" />}
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}

export { MobileNav };
