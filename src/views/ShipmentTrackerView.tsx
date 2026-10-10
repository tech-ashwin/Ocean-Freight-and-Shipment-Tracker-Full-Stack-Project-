import React, { useState, useMemo } from 'react';
import { Download, Plus, CheckCircle, FileCheck, RefreshCw, FileSpreadsheet } from 'lucide-react';
import { Shipment, ShipmentStatus } from '../types';
import { formatDateDisplay, exportShipmentsToExcel } from '../utils/csvHelper';
import { downloadExcelFromBackend } from '../utils/api';
import { CURRENT_DATE_STRING } from '../data/initialData';

interface ShipmentTrackerViewProps {
  shipments: Shipment[];
  onOpenAddModal: () => void;
  onUpdateStatus: (id: string, newStatus: ShipmentStatus, deliveredDate?: string) => void;
  onCheckInvoice: (shipmentId: string) => void;
  onResetShipments: () => void;
}

export const ShipmentTrackerView: React.FC<ShipmentTrackerViewProps> = ({
  shipments,
  onOpenAddModal,
  onUpdateStatus,
  onCheckInvoice,
  onResetShipments,
}) => {
  const [searchId, setSearchId] = useState('');
  const [carrierFilter, setCarrierFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const filteredShipments = useMemo(() => {
    return shipments.filter((s) => {
      const matchId = searchId.trim()
        ? s.shipment_id.toLowerCase().includes(searchId.trim().toLowerCase())
        : true;
      const matchCarrier =
        carrierFilter === 'All' ? true : s.carrier === carrierFilter;
      const matchStatus =
        statusFilter === 'All' ? true : s.status === statusFilter;
      return matchId && matchCarrier && matchStatus;
    });
  }, [shipments, searchId, carrierFilter, statusFilter]);

  const getStatusBadge = (status: ShipmentStatus) => {
    switch (status) {
      case 'In Transit':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#fef3c7] text-[#b45309]">
            In Transit
          </span>
        );
      case 'Delivered':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#dcfce7] text-[#15803d]">
            Delivered
          </span>
        );
      case 'Delayed':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#fee2e2] text-[#b91c1c]">
            Delayed
          </span>
        );
    }
  };

  const handleMarkDelivered = (shipment: Shipment) => {
    onUpdateStatus(shipment.id, 'Delivered', CURRENT_DATE_STRING);
    showToast(`Shipment ${shipment.shipment_id} marked as Delivered!`);
  };

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 overflow-y-auto relative" data-purpose="shipment-tracker-view">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-8 sm:top-6 z-60 animate-in fade-in slide-in-from-top-4 duration-200 flex items-center gap-3 px-4 py-3 bg-white rounded-lg border border-emerald-200 shadow-lg text-emerald-800 text-xs font-medium">
          <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle className="w-4 h-4" />
          </div>
          <span className="flex-1">{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-5 sm:space-y-6">
        {/* Header & Action Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Shipment Tracker
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Track and manage your ocean shipments in real-time.
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onResetShipments}
                title="Reset default sample shipments"
                className="p-2.5 sm:p-2 text-slate-500 hover:text-slate-700 bg-white border border-slate-200 rounded-lg sm:rounded hover:bg-slate-50 shadow-xs cursor-pointer min-h-[40px] sm:min-h-0 flex items-center justify-center"
              >
                <RefreshCw className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
              </button>

              <button
                id="open-add-shipment-modal"
                type="button"
                onClick={onOpenAddModal}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center px-4 py-2.5 sm:py-2 bg-[#1a68e5] hover:bg-blue-600 active:bg-blue-700 text-white text-xs font-semibold rounded-lg sm:rounded-md shadow-xs transition-colors cursor-pointer min-h-[40px] sm:min-h-0"
              >
                <Plus className="w-4 h-4 sm:w-3.5 sm:h-3.5 mr-1.5" />
                <span>+ Add Shipment</span>
              </button>
            </div>

            <button
              type="button"
              onClick={async () => {
                const ok = await downloadExcelFromBackend();
                if (!ok) {
                  exportShipmentsToExcel(shipments);
                }
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3.5 py-2.5 sm:py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg sm:rounded transition shadow-xs cursor-pointer min-h-[40px] sm:min-h-0"
              title="Download fleet shipments in Microsoft Excel (.xlsx) format"
            >
              <FileSpreadsheet className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-emerald-600" />
              <span>Download Shipment List</span>
            </button>
          </div>
        </div>

        {/* BEGIN: Filter Form Bar */}
        <section className="bg-white p-4 sm:p-5 rounded-xl sm:rounded-lg border border-slate-200/80 shadow-xs">
          <form
            className="grid grid-cols-1 md:grid-cols-12 gap-3.5 sm:gap-4 items-end"
            onSubmit={(e) => e.preventDefault()}
          >
            {/* Shipment ID Field */}
            <div className="md:col-span-4">
              <label
                className="block text-xs font-semibold text-slate-700 mb-1.5"
                htmlFor="shipment-id"
              >
                Shipment ID
              </label>
              <div className="relative">
                <input
                  className="w-full text-xs rounded border border-slate-300 placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 py-2 px-3 shadow-none text-slate-700 bg-white"
                  id="shipment-id"
                  placeholder="Search by ID..."
                  type="text"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                />
              </div>
            </div>

            {/* Carrier Field */}
            <div className="md:col-span-3">
              <label
                className="block text-xs font-semibold text-slate-700 mb-1.5"
                htmlFor="carrier"
              >
                Carrier
              </label>
              <select
                className="w-full text-xs rounded border border-slate-300 text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 py-2 px-3 shadow-none bg-white"
                id="carrier"
                value={carrierFilter}
                onChange={(e) => setCarrierFilter(e.target.value)}
              >
                <option value="All">All Carriers</option>
                <option value="OceanLink Lines">OceanLink Lines</option>
                <option value="BlueWave Shipping">BlueWave Shipping</option>
                <option value="GlobalMariner">GlobalMariner</option>
                <option value="PacificStar Line">PacificStar Line</option>
                <option value="AtlasSea Carriers">AtlasSea Carriers</option>
                <option value="MSC">MSC</option>
                <option value="Maersk">Maersk</option>
                <option value="CMA CGM">CMA CGM</option>
              </select>
            </div>

            {/* Status Field */}
            <div className="md:col-span-3">
              <label
                className="block text-xs font-semibold text-slate-700 mb-1.5"
                htmlFor="status"
              >
                Status
              </label>
              <select
                className="w-full text-xs rounded border border-slate-300 text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 py-2 px-3 shadow-none bg-white"
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="In Transit">In Transit</option>
                <option value="Delivered">Delivered</option>
                <option value="Delayed">Delayed</option>
              </select>
            </div>

            {/* Clear / Reset button */}
            <div className="md:col-span-2 flex gap-2">
              <button
                className="w-full py-2 px-4 bg-[#1a68e5] hover:bg-blue-600 text-white text-xs font-medium rounded transition text-center shadow-xs cursor-pointer"
                type="button"
                onClick={() => {}}
              >
                Search
              </button>
              {(searchId || carrierFilter !== 'All' || statusFilter !== 'All') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchId('');
                    setCarrierFilter('All');
                    setStatusFilter('All');
                  }}
                  className="py-2 px-2.5 text-xs text-slate-500 hover:text-slate-800 border border-slate-200 rounded"
                  title="Clear filters"
                >
                  Clear
                </button>
              )}
            </div>
          </form>
        </section>
        {/* END: Filter Form Bar */}

        {/* BEGIN: Shipments List (Mobile Cards + Desktop Table) */}
        <section className="bg-white rounded-xl sm:rounded-lg border border-slate-200/80 shadow-xs overflow-hidden">
          {/* Mobile Cards View (< md) */}
          <div className="block md:hidden divide-y divide-slate-100">
            {filteredShipments.length === 0 ? (
              <div className="py-10 px-4 text-center text-slate-500 text-xs">
                No shipments matching your search criteria.
              </div>
            ) : (
              filteredShipments.map((shp) => (
                <div key={shp.id} className="p-4 space-y-3 hover:bg-slate-50/50 transition-colors">
                  {/* Card Header: ID + Status */}
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{shp.shipment_id}</span>
                    {getStatusBadge(shp.status)}
                  </div>

                  {/* Route & Carrier */}
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between text-slate-700 font-medium">
                      <span>{shp.carrier}</span>
                      <span className="text-[11px] text-slate-400">({shp.container_type})</span>
                    </div>
                    <div className="text-slate-600 flex items-center gap-1.5">
                      <span className="font-medium text-slate-800">{shp.origin_port}</span>
                      <span className="text-slate-400">→</span>
                      <span className="font-medium text-slate-800">{shp.destination_port}</span>
                    </div>
                  </div>

                  {/* Dates & Rates Grid */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50/80 rounded-lg text-[11px] border border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Expected Arrival</span>
                      <span className="text-slate-700 font-medium tabular-nums">{formatDateDisplay(shp.expected_arrival)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Delivered Date</span>
                      <span className="text-slate-700 font-medium tabular-nums">{shp.delivered_date ? formatDateDisplay(shp.delivered_date) : '-'}</span>
                    </div>
                    <div className="col-span-2 pt-1 border-t border-slate-200/50 flex items-center justify-between">
                      <span className="text-slate-500 text-[10px]">Contracted Rate:</span>
                      <span className="font-bold text-slate-800">${shp.contracted_rate_usd.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Mobile Action Buttons (Touch targets >= 44px) */}
                  <div className="flex items-center gap-2 pt-1">
                    {shp.status !== 'Delivered' && (
                      <button
                        type="button"
                        onClick={() => handleMarkDelivered(shp)}
                        className="flex-1 min-h-[40px] px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 border border-emerald-200 rounded-lg transition text-center flex items-center justify-center cursor-pointer"
                      >
                        Deliver
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onCheckInvoice(shp.shipment_id)}
                      className="flex-1 min-h-[40px] px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 border border-blue-200 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>Audit Invoice</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table View (md+) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-white">
                  <th className="py-3.5 px-6 font-semibold text-slate-800" scope="col">
                    Shipment ID
                  </th>
                  <th className="py-3.5 px-6 font-semibold text-slate-800" scope="col">
                    Carrier
                  </th>
                  <th className="py-3.5 px-6 font-semibold text-slate-800" scope="col">
                    Origin → Destination
                  </th>
                  <th className="py-3.5 px-6 font-semibold text-slate-800" scope="col">
                    Status
                  </th>
                  <th className="py-3.5 px-6 font-semibold text-slate-800" scope="col">
                    Expected Arrival
                  </th>
                  <th className="py-3.5 px-6 font-semibold text-slate-800" scope="col">
                    Delivered Date
                  </th>
                  <th className="py-3.5 px-6 font-semibold text-slate-800 text-right" scope="col">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {filteredShipments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      No shipments matching your search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredShipments.map((shp) => (
                    <tr key={shp.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-6 font-bold text-slate-900">
                        {shp.shipment_id}
                      </td>
                      <td className="py-3.5 px-6">{shp.carrier}</td>
                      <td className="py-3.5 px-6">
                        {shp.origin_port} → {shp.destination_port}
                      </td>
                      <td className="py-3.5 px-6">{getStatusBadge(shp.status)}</td>
                      <td className="py-3.5 px-6 text-slate-700 tabular-nums">
                        {formatDateDisplay(shp.expected_arrival)}
                      </td>
                      <td className="py-3.5 px-6 text-slate-700 tabular-nums">
                        {shp.delivered_date ? formatDateDisplay(shp.delivered_date) : '-'}
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {shp.status !== 'Delivered' && (
                            <button
                              type="button"
                              onClick={() => handleMarkDelivered(shp)}
                              className="px-2 py-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded transition cursor-pointer"
                              title="Mark as Delivered"
                            >
                              Deliver
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onCheckInvoice(shp.shipment_id)}
                            className="px-2 py-1 text-[11px] font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded transition flex items-center gap-1 cursor-pointer"
                            title="Verify Invoice"
                          >
                            <FileCheck className="w-3 h-3" />
                            <span>Audit</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
        {/* END: Shipments List */}
      </div>
    </main>
  );
};
