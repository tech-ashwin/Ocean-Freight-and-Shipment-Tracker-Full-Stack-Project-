import React from 'react';
import {
  Package,
  Ship,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { Shipment, ActiveNav, UserAccount } from '../types';
import { formatDateDisplay } from '../utils/csvHelper';

interface DashboardViewProps {
  user: UserAccount;
  shipments: Shipment[];
  onNavigate: (nav: ActiveNav) => void;
  onOpenAddShipment: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  shipments,
  onNavigate,
  onOpenAddShipment,
}) => {
  const recentShipments = shipments.slice(0, 5);
  const totalShipments = recentShipments.length;
  const inTransitCount = recentShipments.filter((s) => s.status === 'In Transit').length;
  const deliveredCount = recentShipments.filter((s) => s.status === 'Delivered').length;
  const delayedCount = recentShipments.filter((s) => s.status === 'Delayed').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'In Transit':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/70">
            In Transit
          </span>
        );
      case 'Delivered':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
            Delivered
          </span>
        );
      case 'Delayed':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/70">
            Delayed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 overflow-y-auto" data-purpose="dashboard-view">
      <div className="max-w-7xl mx-auto space-y-5 sm:space-y-6">
        {/* Welcome Banner Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <section data-purpose="greeting">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Welcome, {user.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Here&apos;s an overview of your ocean freight operations.
            </p>
          </section>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenAddShipment}
              className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-[#0062d2] hover:bg-blue-600 active:bg-blue-700 text-white text-xs font-semibold rounded-lg sm:rounded-md shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer min-h-[40px] sm:min-h-0"
            >
              <span>+ Add Shipment</span>
            </button>
          </div>
        </div>

        {/* KPI Metrics Grid (2x2 on mobile, 4 columns on desktop) */}
        <section
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5"
          data-purpose="kpi-metrics"
        >
          {/* KPI 1: Total Shipments */}
          <div className="bg-white rounded-xl p-3.5 sm:p-5 border border-slate-200/80 shadow-xs flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
              <Package className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] sm:text-xs font-semibold text-slate-500 tracking-wider truncate">
                Total Shipments
              </p>
              <p className="text-xl sm:text-2xl font-bold text-slate-800 mt-0.5 tabular-nums">
                {totalShipments}
              </p>
            </div>
          </div>

          {/* KPI 2: In Transit */}
          <div className="bg-white rounded-xl p-3.5 sm:p-5 border border-slate-200/80 shadow-xs flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
              <Ship className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] sm:text-xs font-semibold text-slate-500 tracking-wider truncate">
                In Transit
              </p>
              <p className="text-xl sm:text-2xl font-bold text-slate-800 mt-0.5 tabular-nums">
                {inTransitCount}
              </p>
            </div>
          </div>

          {/* KPI 3: Delivered */}
          <div className="bg-white rounded-xl p-3.5 sm:p-5 border border-slate-200/80 shadow-xs flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] sm:text-xs font-semibold text-slate-500 tracking-wider truncate">
                Delivered
              </p>
              <p className="text-xl sm:text-2xl font-bold text-slate-800 mt-0.5 tabular-nums">
                {deliveredCount}
              </p>
            </div>
          </div>

          {/* KPI 4: Delayed */}
          <div className="bg-white rounded-xl p-3.5 sm:p-5 border border-slate-200/80 shadow-xs flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 shrink-0">
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] sm:text-xs font-semibold text-slate-500 tracking-wider truncate">
                Delayed
              </p>
              <p className="text-xl sm:text-2xl font-bold text-slate-800 mt-0.5 tabular-nums">
                {delayedCount}
              </p>
            </div>
          </div>
        </section>

        {/* BEGIN: RecentShipmentsSection */}
        <section
          className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden"
          data-purpose="recent-shipments"
        >
          {/* Card Header */}
          <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">Recent Shipments</h3>
            <button
              type="button"
              onClick={() => onNavigate('shipment_tracker')}
              className="text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Card List View (< md) */}
          <div className="block md:hidden divide-y divide-slate-100">
            {recentShipments.map((shp) => (
              <div
                key={shp.id}
                onClick={() => onNavigate('shipment_tracker')}
                className="p-4 hover:bg-slate-50/70 transition-colors cursor-pointer active:bg-slate-100/80"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-900 text-sm">{shp.shipment_id}</span>
                  {getStatusBadge(shp.status)}
                </div>
                <div className="text-xs text-slate-600 flex items-center justify-between">
                  <span className="font-medium text-slate-700">{shp.carrier}</span>
                  <span className="text-slate-500 tabular-nums">
                    Arrival: {formatDateDisplay(shp.expected_arrival)}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                  <span>{shp.origin_port}</span>
                  <span className="text-slate-400">→</span>
                  <span>{shp.destination_port}</span>
                  <span className="text-slate-400 text-[10px]">({shp.container_type})</span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Shipments Table (md+) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="text-[12px] font-semibold text-slate-500 border-b border-slate-100 bg-white">
                  <th className="py-3.5 px-6" scope="col">
                    Shipment ID
                  </th>
                  <th className="py-3.5 px-6" scope="col">
                    Carrier
                  </th>
                  <th className="py-3.5 px-6" scope="col">
                    Origin → Destination
                  </th>
                  <th className="py-3.5 px-6" scope="col">
                    Status
                  </th>
                  <th className="py-3.5 px-6" scope="col">
                    Expected Arrival
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {recentShipments.map((shp) => (
                  <tr key={shp.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-900">
                      {shp.shipment_id}
                    </td>
                    <td className="py-4 px-6 text-slate-600">{shp.carrier}</td>
                    <td className="py-4 px-6 text-slate-600">
                      {shp.origin_port} → {shp.destination_port}
                    </td>
                    <td className="py-4 px-6">{getStatusBadge(shp.status)}</td>
                    <td className="py-4 px-6 text-slate-600 tabular-nums">
                      {formatDateDisplay(shp.expected_arrival)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        {/* END: RecentShipmentsSection */}
      </div>
    </main>
  );
};
