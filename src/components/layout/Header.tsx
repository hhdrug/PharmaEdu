'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Pill, Menu, X, Calendar, Activity, Layers, Zap } from 'lucide-react';
import { useState } from 'react';
import { MobileNav } from './MobileNav';
import { UserMenu } from './UserMenu';

interface NavLink {
  href: string;
  label: string;
  icon?: React.ElementType;
}

const navLinks: NavLink[] = [
  { href: '/dashboard', label: '대시보드', icon: Activity },
  { href: '/calculator', label: '계산기' },
  { href: '/learn', label: '학습' },
  { href: '/quiz', label: '퀴즈' },
  { href: '/swipe', label: '슥슥', icon: Zap },
  { href: '/flashcards', label: '카드', icon: Layers },
  { href: '/daily', label: '데일리', icon: Calendar },
];

function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 bg-bg-surface border-b border-border-light shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* 로고 */}
            <Link
              href="/"
              className="flex items-center gap-2 text-primary-600 font-bold text-xl hover:text-primary-700 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-md"
              aria-label="팜에듀 홈으로 이동"
            >
              <Pill className="w-6 h-6" aria-hidden="true" />
              <span>팜에듀</span>
            </Link>

            {/* 데스크탑 네비게이션 */}
            <nav
              className="hidden md:flex items-center gap-1"
              aria-label="주요 메뉴"
            >
              {navLinks.map((link) => {
                const isActive =
                  link.href === '/'
                    ? pathname === '/'
                    : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={[
                      'px-4 py-2 text-sm font-medium rounded-lg',
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
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* 사용자 메뉴 (데스크탑) */}
            <div className="hidden md:flex items-center ml-2">
              <UserMenu />
            </div>

            {/* 모바일 햄버거 버튼 */}
            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              className="md:hidden w-11 h-11 inline-flex items-center justify-center rounded-lg text-text-secondary hover:bg-neutral-100 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              aria-label={mobileOpen ? '메뉴 닫기' : '메뉴 열기'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
            >
              {mobileOpen ? (
                <X className="w-6 h-6" aria-hidden="true" />
              ) : (
                <Menu className="w-6 h-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 모바일 드로어 */}
      <MobileNav
        id="mobile-nav"
        isOpen={mobileOpen}
        links={navLinks}
        currentPath={pathname}
        onClose={() => setMobileOpen(false)}
      />
    </>
  );
}

export { Header };
