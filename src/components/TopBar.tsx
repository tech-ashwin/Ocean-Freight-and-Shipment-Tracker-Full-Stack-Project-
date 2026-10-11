import React from 'react';
import { User, Menu, Database } from 'lucide-react';
import { UserAccount } from '../types';

interface TopBarProps {
  user: UserAccount;
  onToggleMobileMenu?: () => void;
  onOpenDatabaseModal?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ user, onToggleMobileMenu, onOpenDatabaseModal }) => {
  return (
    <header
      className="h-14 bg-[#0d1b2e] border-b border-slate-800/60 px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-xs select-none"
      data-purpose="top-navigation"
    >
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Toggle Button */}
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 -ml-1 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800/60 transition focus:outline-none"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h1 className="text-xs sm:text-sm font-semibold text-slate-200 tracking-tight truncate max-w-[200px] sm:max-w-none">
          Ocean Freight &amp; Shipment Tracker
        </h1>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Database Migration / Status Button */}
        <button
          type="button"
          onClick={onOpenDatabaseModal}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border border-slate-700/80 bg-slate-800/70 hover:bg-slate-700/80 hover:border-slate-600 text-slate-200 transition cursor-pointer"
          title="MongoDB Status & Migration"
        >
          <Database className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="hidden xs:inline text-[11px]">Database</span>
        </button>

        {/* User Profile Indicator */}
        <div className="flex items-center gap-2 pl-1 border-l border-slate-800">
          <div className="w-7 h-7 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-white shrink-0">
            <User className="w-4 h-4 text-slate-200" />
          </div>
          <span className="text-xs text-slate-200 font-medium hidden sm:inline">{user.name}</span>
        </div>
      </div>
    </header>
  );
};
