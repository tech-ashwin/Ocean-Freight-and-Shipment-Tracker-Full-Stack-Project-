import React from 'react';
import {
  LayoutDashboard,
  Search,
  Package,
  FileCheck2,
  Mail,
  LogOut,
  Layers,
  Presentation,
} from 'lucide-react';
import { ActiveNav } from '../types';

interface SidebarProps {
  activeNav: ActiveNav;
  onNavigate: (nav: ActiveNav) => void;
  onLogout: () => void;
  pendingEmailCount?: number;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeNav,
  onNavigate,
  onLogout,
  pendingEmailCount = 0,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const handleItemClick = (nav: ActiveNav) => {
    onNavigate(nav);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 md:hidden animate-in fade-in duration-200"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container: Permanent on md+, Drawer on mobile */}
      <aside
        className={`bg-[#0d1b2e] text-slate-300 flex flex-col shrink-0 select-none z-50 border-r border-slate-800/80 transition-all duration-300 ease-in-out ${
          // Mobile drawer classes:
          isMobileOpen
            ? 'fixed inset-y-0 left-0 w-72 shadow-2xl flex md:relative md:w-60 md:shadow-none'
            : 'hidden md:flex md:w-60 md:min-h-screen'
        }`}
        data-purpose="main-sidebar"
      >
        {/* Brand Logo Area */}
        <div className="h-14 flex items-center justify-between px-5 border-b border-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-500/15 flex items-center justify-center text-[#0267eb]">
              <Layers className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-wider text-white">BLUSPARK</span>
              <span className="text-[9px] uppercase tracking-widest text-slate-400 font-medium">Logistics Intelligence</span>
            </div>
          </div>

          {/* Close button on mobile drawer */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="md:hidden text-slate-400 hover:text-white p-1.5 rounded-md hover:bg-slate-800 transition"
            aria-label="Close navigation menu"
          >
            <span className="text-lg font-bold leading-none">✕</span>
          </button>
        </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 text-xs font-medium">
        {/* Dashboard */}
        <button
          type="button"
          onClick={() => handleItemClick('dashboard')}
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
          onClick={() => handleItemClick('rate_search')}
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
          onClick={() => handleItemClick('shipment_tracker')}
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
          onClick={() => handleItemClick('invoice_checker')}
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
          onClick={() => handleItemClick('email_processor')}
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

        {/* Pitch Deck / Judges 3-Slide PPT */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => handleItemClick('presentation')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md transition-all text-left ${
              activeNav === 'presentation'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-md'
                : 'text-blue-300 bg-blue-950/40 border border-blue-800/40 hover:bg-blue-900/50 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Presentation className="w-4 h-4 shrink-0 text-blue-400" />
              <span>Judges Pitch Deck</span>
            </div>
            <span className="text-[9px] uppercase tracking-wider bg-blue-500/20 text-blue-200 border border-blue-400/30 font-bold px-1.5 py-0.5 rounded">
              3 Slides
            </span>
          </button>
        </div>
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
  </>
  );
};
