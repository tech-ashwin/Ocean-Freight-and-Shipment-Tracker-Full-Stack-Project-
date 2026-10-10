import React from 'react';
import {
  LayoutDashboard,
  Search,
  Package,
  FileCheck2,
  Mail,
  LogOut,
  Layers,
} from 'lucide-react';
import { ActiveNav } from '../types';

interface SidebarProps {
  activeNav: ActiveNav;
  onNavigate: (nav: ActiveNav) => void;
  onLogout: () => void;
  pendingEmailCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeNav,
  onNavigate,
  onLogout,
  pendingEmailCount = 0,
}) => {
  return (
    <aside
      className="w-60 bg-[#0d1b2e] text-slate-300 flex flex-col shrink-0 select-none min-h-screen border-r border-slate-800/80 transition-all"
      data-purpose="main-sidebar"
    >
      {/* Brand Logo Area */}
      <div className="h-14 flex items-center px-5 gap-2.5 border-b border-slate-800/60">
        <div className="w-7 h-7 rounded-lg bg-blue-500/15 flex items-center justify-center text-[#0267eb]">
          <Layers className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-wider text-white">BLUSPARK</span>
          <span className="text-[9px] uppercase tracking-widest text-slate-400 font-medium">Logistics Intelligence</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 text-xs font-medium">
        {/* Dashboard */}
        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-left ${
            activeNav === 'dashboard'
              ? 'bg-[#0062d2] text-white shadow-sm font-semibold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 shrink-0" />
          <span>Dashboard</span>
        </button>

        {/* Rate Search */}
        <button
          type="button"
          onClick={() => onNavigate('rate_search')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-left ${
            activeNav === 'rate_search'
              ? 'bg-[#0062d2] text-white shadow-sm font-semibold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Search className="w-4 h-4 shrink-0" />
          <span>Rate Search</span>
        </button>

        {/* Shipment Tracker */}
        <button
          type="button"
          onClick={() => onNavigate('shipment_tracker')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-left ${
            activeNav === 'shipment_tracker'
              ? 'bg-[#0062d2] text-white shadow-sm font-semibold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Package className="w-4 h-4 shrink-0" />
          <span>Shipment Tracker</span>
        </button>

        {/* Invoice Checker */}
        <button
          type="button"
          onClick={() => onNavigate('invoice_checker')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-left ${
            activeNav === 'invoice_checker'
              ? 'bg-[#0062d2] text-white shadow-sm font-semibold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <FileCheck2 className="w-4 h-4 shrink-0" />
          <span>Invoice Checker</span>
        </button>

        {/* Rates & Shipment Updates (Email Processor) */}
        <button
          type="button"
          onClick={() => onNavigate('email_processor')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md transition-colors text-left ${
            activeNav === 'email_processor'
              ? 'bg-[#0062d2] text-white shadow-sm font-semibold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 shrink-0" />
            <span>Rates &amp; Shipment Updates</span>
          </div>
          {pendingEmailCount > 0 && (
            <span className="text-[10px] bg-blue-400/30 text-white font-bold px-1.5 py-0.5 rounded-full">
              {pendingEmailCount}
            </span>
          )}
        </button>
      </nav>

      {/* Sidebar Bottom Links */}
      <div className="p-3 border-t border-slate-800/60 space-y-1 text-xs font-medium">
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-slate-400 hover:text-rose-300 hover:bg-rose-950/20 transition-colors text-left"
        >
          <LogOut className="w-4 h-4 text-slate-400" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
