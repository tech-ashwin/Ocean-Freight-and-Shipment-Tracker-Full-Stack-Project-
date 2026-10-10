import React from 'react';
import {
  LayoutDashboard,
  Search,
  Package,
  FileCheck2,
  Mail,
} from 'lucide-react';
import { ActiveNav } from '../types';

interface MobileBottomNavProps {
  activeNav: ActiveNav;
  onNavigate: (nav: ActiveNav) => void;
  pendingEmailCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeNav,
  onNavigate,
  pendingEmailCount = 0,
}) => {
  const navItems: {
    id: ActiveNav;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'rate_search', label: 'Rates', icon: Search },
    { id: 'shipment_tracker', label: 'Tracker', icon: Package },
    { id: 'invoice_checker', label: 'Audit', icon: FileCheck2 },
    {
      id: 'email_processor',
      label: 'Updates',
      icon: Mail,
      badge: pendingEmailCount > 0 ? pendingEmailCount : undefined,
    },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0d1b2e] border-t border-slate-800/80 px-2 py-1 shadow-2xl flex items-center justify-around select-none backdrop-blur-md"
      data-purpose="mobile-bottom-navigation"
      aria-label="Mobile Bottom Navigation"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeNav === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onNavigate(item.id)}
            className={`relative flex flex-col items-center justify-center py-1.5 px-3 min-w-[56px] min-h-[48px] rounded-lg transition-colors cursor-pointer ${
              isActive
                ? 'text-[#38bdf8] font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Icon
                className={`w-5 h-5 transition-transform ${
                  isActive ? 'scale-110' : ''
                }`}
              />
              {item.badge !== undefined && (
                <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 bg-blue-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center ring-2 ring-[#0d1b2e]">
                  {item.badge}
                </span>
              )}
            </div>
            <span
              className={`text-[10px] mt-1 tracking-tight ${
                isActive ? 'font-semibold text-white' : 'font-normal'
              }`}
            >
              {item.label}
            </span>
            {isActive && (
              <span className="absolute bottom-0.5 w-5 h-0.5 bg-[#38bdf8] rounded-full" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
