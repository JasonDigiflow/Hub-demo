'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { SIDEBAR_ITEMS } from '@/lib/constants';
import { logout } from '@/lib/auth';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleItemClick = (item) => {
    if (item.action === 'logout') {
      logout();
      router.push('/');
    }
  };

  return (
    <aside className={`
      fixed left-0 top-0 h-full z-40
      bg-gradient-to-b from-[#1a1b3e] to-[#0a0b1e]
      border-r border-white/10
      transition-all duration-300 ease-in-out
      ${isCollapsed ? 'w-20' : 'w-64'}
    `}>
      <div className="flex flex-col h-full">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h1 className={`
              font-bold text-xl gradient-text
              transition-all duration-300
              ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}
            `}>
              DigiFlow Hub
            </h1>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-white/70 hover:text-white transition-colors"
            >
              {isCollapsed ? '→' : '←'}
            </button>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {SIDEBAR_ITEMS.map((item) => {
              const isActive = pathname === item.path;
              const ItemTag = item.path ? Link : 'button';
              
              return (
                <li key={item.label}>
                  <ItemTag
                    href={item.path}
                    onClick={() => !item.path && handleItemClick(item)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl
                      transition-all duration-300
                      ${isActive 
                        ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30' 
                        : 'hover:bg-white/5'
                      }
                      ${!item.path ? 'w-full text-left' : ''}
                    `}
                  >
                    <span className="text-2xl flex-shrink-0">{item.icon}</span>
                    <span className={`
                      transition-all duration-300
                      ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}
                    `}>
                      {item.label}
                    </span>
                  </ItemTag>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className={`
          p-4 border-t border-white/10
          ${isCollapsed ? 'hidden' : 'block'}
        `}>
          <div className="glass-card p-3">
            <p className="text-xs text-white/50">Version 3.0.0</p>
            <p className="text-xs text-white/50">© 2024 DigiFlow</p>
          </div>
        </div>
      </div>
    </aside>
  );
}