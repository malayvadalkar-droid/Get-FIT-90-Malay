'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, Dumbbell, Apple, TrendingUp, Share2 } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/today', label: 'Today', icon: Calendar },
  { href: '/workout', label: 'Workout', icon: Dumbbell },
  { href: '/nutrition', label: 'Nutrition', icon: Apple },
  { href: '/progress', label: 'Progress', icon: TrendingUp },
  { href: '/share', label: 'Share', icon: Share2 },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="safe-bottom"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'rgba(10,10,15,0.92)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--border)',
        zIndex: 100,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          padding: '8px 0 4px',
        }}
      >
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '3px',
                padding: '6px 12px',
                borderRadius: '12px',
                textDecoration: 'none',
                minWidth: '60px',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon
                size={22}
                style={{
                  color: active ? 'var(--accent-orange)' : 'var(--text-muted)',
                  transition: 'color 0.15s ease',
                }}
                strokeWidth={active ? 2.5 : 2}
              />
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: active ? 700 : 500,
                  color: active ? 'var(--accent-orange)' : 'var(--text-muted)',
                  letterSpacing: '0.2px',
                  transition: 'color 0.15s ease',
                }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
