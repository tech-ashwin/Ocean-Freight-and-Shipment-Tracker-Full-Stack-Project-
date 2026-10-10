import React, { useState, useMemo } from 'react';
import { Upload, RefreshCw, ChevronDown } from 'lucide-react';
import { CarrierRate, ContainerType } from '../types';
import { ORIGIN_PORTS, DESTINATION_PORTS } from '../data/initialData';
import { parseCarrierRatesCSV } from '../utils/csvHelper';

interface RateSearchViewProps {
  rates: CarrierRate[];
  onImportRates: (newRates: CarrierRate[]) => void;
  onResetRates: () => void;
}

export const RateSearchView: React.FC<RateSearchViewProps> = ({
  rates,
  onImportRates,
  onResetRates,
}) => {
  const [originPort, setOriginPort] = useState('Mumbai');
  const [destinationPort, setDestinationPort] = useState('Rotterdam');
  const [containerType, setContainerType] = useState<ContainerType>('40ft');
  const [submittedQuery, setSubmittedQuery] = useState({
    origin: 'Mumbai',
    dest: 'Rotterdam',
    type: '40ft' as ContainerType,
  });

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSubmittedQuery({
      origin: originPort,
      dest: destinationPort,
      type: containerType,
    });
  };

  const matchingRates = useMemo(() => {
    const list = rates.filter(
      (r) =>
        r.origin_port.toLowerCase() === submittedQuery.origin.toLowerCase() &&
        r.destination_port.toLowerCase() === submittedQuery.dest.toLowerCase() &&
        r.container_type === submittedQuery.type
    );
    // Sort ascending by price
    return [...list].sort((a, b) => a.rate_usd - b.rate_usd);
  }, [rates, submittedQuery]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const parsed = parseCarrierRatesCSV(text);
        if (parsed.length > 0) {
          onImportRates(parsed);
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 overflow-y-auto" data-purpose="rate-search-view">
      <div className="max-w-6xl mx-auto space-y-5 sm:space-y-6">
        {/* Title & Actions Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              Rate Search
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Find the best ocean freight shipping rate for your cargo.
            </p>
          </div>

          {/* CSV Import/Export Tools */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 sm:py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg sm:rounded hover:bg-slate-50 shadow-xs cursor-pointer min-h-[40px] sm:min-h-0">
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Import Rates CSV</span>
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>

            <button
              type="button"
              onClick={onResetRates}
              title="Reset default carrier rates"
              className="inline-flex items-center justify-center p-2.5 sm:p-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-lg sm:rounded hover:bg-slate-50 cursor-pointer min-h-[40px] sm:min-h-0"
            >
              <RefreshCw className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
            </button>
          </div>
        </div>

        {/* BEGIN: FilterSearchForm */}
        <section
          className="bg-white p-4 sm:p-5 rounded-xl sm:rounded-lg border border-slate-200 shadow-xs"
          data-purpose="search-form-card"
        >
          <form
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 items-end"
            onSubmit={handleSearch}
          >
            {/* Origin Port Dropdown */}
            <div>
              <label
                className="block text-xs font-semibold text-gray-700 mb-1.5"
                htmlFor="origin-port"
              >
                Origin Port
              </label>
              <div className="relative">
                <select
                  className="w-full text-xs font-medium text-gray-800 bg-white border border-slate-300 rounded px-3 py-2 appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 pr-8"
                  id="origin-port"
                  name="origin-port"
                  value={originPort}
                  onChange={(e) => setOriginPort(e.target.value)}
                >
                  {ORIGIN_PORTS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Destination Port Dropdown */}
            <div>
              <label
                className="block text-xs font-semibold text-gray-700 mb-1.5"
                htmlFor="destination-port"
              >
                Destination Port
              </label>
              <div className="relative">
                <select
                  className="w-full text-xs font-medium text-gray-800 bg-white border border-slate-300 rounded px-3 py-2 appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 pr-8"
                  id="destination-port"
                  name="destination-port"
                  value={destinationPort}
                  onChange={(e) => setDestinationPort(e.target.value)}
                >
                  {DESTINATION_PORTS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Container Type Dropdown */}
            <div>
              <label
                className="block text-xs font-semibold text-gray-700 mb-1.5"
                htmlFor="container-type"
              >
                Container Type
              </label>
              <div className="relative">
                <select
                  className="w-full text-xs font-medium text-gray-800 bg-white border border-slate-300 rounded px-3 py-2 appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 pr-8"
                  id="container-type"
                  name="container-type"
                  value={containerType}
                  onChange={(e) => setContainerType(e.target.value as ContainerType)}
                >
                  <option value="40ft">40ft</option>
                  <option value="20ft">20ft</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Submit Search Button */}
            <div>
              <button
                className="w-full bg-[#0062eb] hover:bg-blue-600 active:bg-blue-700 text-white font-medium text-xs py-2 px-5 rounded tracking-wide transition-colors h-[34px] flex items-center justify-center cursor-pointer shadow-xs"
                type="submit"
              >
                Search
              </button>
            </div>
          </form>
        </section>
        {/* END: FilterSearchForm */}

        {/* BEGIN: AvailableRatesSection */}
        <section
          className="space-y-3"
          data-purpose="available-rates-container"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">
              Available Rates for {submittedQuery.origin} → {submittedQuery.dest} ({submittedQuery.type})
            </h3>
            <span className="text-xs text-slate-500">
              {matchingRates.length} matching carrier{matchingRates.length === 1 ? '' : 's'} sorted by price
            </span>
          </div>

          <div className="bg-white rounded-xl sm:rounded-lg border border-slate-200 shadow-xs overflow-hidden">
            {/* Mobile Cards View (< md) */}
            <div className="block md:hidden divide-y divide-slate-100">
              {matchingRates.length === 0 ? (
                <div className="py-10 px-4 text-center text-slate-500 text-xs">
                  <p className="font-semibold text-slate-700 mb-1">
                    No direct carrier tariffs found for {submittedQuery.origin} → {submittedQuery.dest} ({submittedQuery.type}).
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    Try searching &quot;Mumbai&quot; to &quot;Rotterdam&quot; or import new carrier tariffs above.
                  </p>
                </div>
              ) : (
                matchingRates.map((rate, index) => {
                  const isCheapest = index === 0;
                  return (
                    <div
                      key={rate.id}
                      className={`p-4 space-y-2.5 transition-colors ${
                        isCheapest ? 'bg-emerald-50/40' : 'hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{rate.carrier}</span>
                          {rate.source === 'email' && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 font-medium">
                              Email parsed
                            </span>
                          )}
                        </div>
                        {isCheapest && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00aa5b] text-white">
                            Cheapest
                          </span>
                        )}
                      </div>

                      <div className="flex items-baseline justify-between">
                        <div className="text-xs text-slate-500 space-x-3">
                          <span>⏱ {rate.transit_days} days transit</span>
                          <span>📦 {rate.container_type}</span>
                        </div>
                        <div className="text-right">
                          <span className={`text-lg font-bold tabular-nums ${isCheapest ? 'text-emerald-700' : 'text-slate-900'}`}>
                            ${rate.rate_usd.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-400 block -mt-1">USD total</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Desktop Table View (md+) */}
            <div className="hidden md:block overflow-x-auto">
              <table
                className="w-full text-left text-xs border-collapse"
                data-purpose="rates-table"
              >
                {/* Table Header */}
                <thead>
                  <tr className="text-gray-600 border-b border-slate-100 font-semibold text-[11px] bg-slate-50/50">
                    <th className="py-3 px-6" scope="col">
                      Carrier
                    </th>
                    <th className="py-3 px-6" scope="col">
                      Price (USD)
                    </th>
                    <th className="py-3 px-6" scope="col">
                      Transit Time
                    </th>
                    <th className="py-3 px-6" scope="col">
                      Container
                    </th>
                    <th className="py-3 px-6 text-right" scope="col">
                      <span className="sr-only">Badge</span>
                    </th>
                  </tr>
                </thead>

                {/* Table Rows */}
                <tbody className="divide-y divide-slate-100 text-gray-700">
                  {matchingRates.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-500">
                        <p className="font-medium text-slate-700 mb-1">
                          No direct carrier tariffs found for {submittedQuery.origin} → {submittedQuery.dest} ({submittedQuery.type}).
                        </p>
                        <p className="text-xs text-slate-400">
                          Try searching &quot;Mumbai&quot; to &quot;Rotterdam&quot; or import new carrier tariffs via the CSV button above.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    matchingRates.map((rate, index) => {
                      const isCheapest = index === 0;
                      return (
                        <tr
                          key={rate.id}
                          className={
                            isCheapest
                              ? 'bg-[#eafbf1] hover:bg-[#e1f8eb] transition-colors border-y border-emerald-100'
                              : 'hover:bg-slate-50/60 transition-colors'
                          }
                        >
                          <td
                            className={`py-3.5 px-6 ${
                              isCheapest
                                ? 'font-semibold text-gray-900'
                                : 'font-medium text-gray-900'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span>{rate.carrier}</span>
                              {rate.source === 'email' && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200">
                                  Email parsed
                                </span>
                              )}
                            </div>
                          </td>
                          <td
                            className={`py-3.5 px-6 tabular-nums ${
                              isCheapest
                                ? 'font-bold text-gray-900'
                                : 'font-medium text-gray-900'
                            }`}
                          >
                            ${rate.rate_usd.toLocaleString()}
                          </td>
                          <td
                            className={`py-3.5 px-6 ${
                              isCheapest ? 'text-gray-700' : 'text-gray-600'
                            }`}
                          >
                            {rate.transit_days} days
                          </td>
                          <td
                            className={`py-3.5 px-6 ${
                              isCheapest ? 'text-gray-700' : 'text-gray-600'
                            }`}
                          >
                            {rate.container_type}
                          </td>
                          <td className="py-3.5 px-6 text-right">
                            {isCheapest && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#00aa5b] text-white shadow-xs">
                                Cheapest
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
        {/* END: AvailableRatesSection */}
      </div>
    </main>
  );
};
