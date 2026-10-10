import React from 'react';
import { User, Shield, ShieldCheck } from 'lucide-react';
import { UserAccount } from '../types';

interface TopBarProps {
  user: UserAccount;
  onToggleRole: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ user, onToggleRole }) => {
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
        {/* Role Switcher Pill */}
        <button
          type="button"
          onClick={onToggleRole}
          title="Click to toggle between Admin and User role"
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors ${
            user.role === 'Admin'
              ? 'bg-blue-900/40 border-blue-600/50 text-blue-300 hover:bg-blue-900/60'
              : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
          }`}
        >
          {user.role === 'Admin' ? (
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          ) : (
            <Shield className="w-3.5 h-3.5 text-slate-400" />
          )}
          <span>Role: {user.role}</span>
        </button>

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
