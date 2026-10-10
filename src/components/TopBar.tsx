import React from 'react';
import { User } from 'lucide-react';
import { UserAccount } from '../types';

interface TopBarProps {
  user: UserAccount;
}

export const TopBar: React.FC<TopBarProps> = ({ user }) => {
  return (
    <header
      className="h-14 bg-[#0d1b2e] border-b border-slate-800/60 px-6 flex items-center justify-between shrink-0 shadow-xs select-none"
      data-purpose="top-navigation"
    >
      <h1 className="text-sm font-semibold text-slate-200 tracking-tight">
        Ocean Freight and Shipment Tracker
      </h1>

      {/* User Profile Indicator */}
      <div className="flex items-center gap-3">
        {/* User Avatar & Name */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-slate-600 flex items-center justify-center text-white shrink-0">
            <User className="w-4 h-4 text-slate-200" />
          </div>
          <span className="text-xs text-slate-200 font-medium">{user.name}</span>
        </div>
      </div>
    </header>
  );
};
