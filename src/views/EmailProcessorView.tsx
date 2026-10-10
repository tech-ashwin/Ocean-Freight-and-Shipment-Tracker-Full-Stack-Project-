import React, { useState, useMemo } from 'react';
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  Clock,
} from 'lucide-react';
import { EmailRecord, ActivityUpdate, EmailType } from '../types';

interface EmailProcessorViewProps {
  emails: EmailRecord[];
  activityUpdates: ActivityUpdate[];
  onOpenEmailDetails: (email: EmailRecord) => void;
  onProcessAllEmails: () => void;
  onAddCustomEmail?: (newEmail: EmailRecord) => void;
}

export const EmailProcessorView: React.FC<EmailProcessorViewProps> = ({
  emails,
  activityUpdates,
  onOpenEmailDetails,
  onProcessAllEmails,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | EmailType>('All');
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredEmails = useMemo(() => {
    return emails.filter((em) => {
      const matchQuery = searchQuery.trim()
        ? em.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
          em.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
          em.raw_body.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      const matchType = typeFilter === 'All' ? true : em.type === typeFilter;
      return matchQuery && matchType;
    });
  }, [emails, searchQuery, typeFilter]);

  const handleProcessClick = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onProcessAllEmails();
      setIsProcessing(false);
    }, 400);
  };

  const getTypeBadge = (type: EmailType) => {
    switch (type) {
      case 'Rate Update':
        return (
          <span className="inline-block px-2 py-0.5 text-[10px] font-medium bg-amber-50 text-amber-600 rounded">
            Rate Update
          </span>
        );
      case 'Shipment Update':
        return (
          <span className="inline-block px-2 py-0.5 text-[10px] font-medium bg-emerald-50 text-emerald-600 rounded">
            Shipment Update
          </span>
        );
      case 'Irrelevant':
        return (
          <span className="inline-block px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-600 rounded">
            Irrelevant
          </span>
        );
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'rate':
        return (
          <div className="w-7 h-7 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Layers className="w-3.5 h-3.5" />
          </div>
        );
      case 'shipment':
        return (
          <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
        );
      case 'delayed':
        return (
          <div className="w-7 h-7 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
        );
      default:
        return (
          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <Clock className="w-3.5 h-3.5" />
          </div>
        );
    }
  };

  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 md:pb-8" data-purpose="email-processor-view">
      {/* Top Title and Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 gap-3.5 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Rates &amp; Shipment Updates
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Automatically parse carrier communications and update rate &amp; shipment records.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-[11px] text-slate-400 hidden md:inline">
            Last processed: 06 Oct 2026, 14:32
          </span>

          <button
            type="button"
            onClick={handleProcessClick}
            disabled={isProcessing}
            className="w-full sm:w-auto px-4 py-2.5 sm:py-1.5 text-xs font-semibold text-white bg-[#0267eb] hover:bg-[#0053c0] active:bg-blue-800 rounded-lg sm:rounded-md shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[40px] sm:min-h-0"
          >
            <Sparkles className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
            <span>{isProcessing ? 'Processing...' : 'Process Emails'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid Split: Table on Left + Live Updates Feed on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* BEGIN: SampleEmailsCard */}
        <section
          className="lg:col-span-8 bg-white rounded-xl sm:rounded-lg border border-slate-200/90 shadow-xs flex flex-col w-full overflow-hidden"
          data-purpose="sample-emails-table"
        >
          {/* Card Header & Filter */}
          <div className="px-4 sm:px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 gap-3">
            <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <h3 className="text-xs font-bold text-slate-800 shrink-0">
                Updates ({filteredEmails.length})
              </h3>
              {/* Type Filter segmented pills */}
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded text-[11px] shrink-0">
                <button
                  type="button"
                  onClick={() => setTypeFilter('All')}
                  className={`px-2 py-0.5 rounded transition ${
                    typeFilter === 'All'
                      ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setTypeFilter('Rate Update')}
                  className={`px-2 py-0.5 rounded transition ${
                    typeFilter === 'Rate Update'
                      ? 'bg-white text-amber-700 font-semibold shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Rates
                </button>
                <button
                  type="button"
                  onClick={() => setTypeFilter('Shipment Update')}
                  className={`px-2 py-0.5 rounded transition ${
                    typeFilter === 'Shipment Update'
                      ? 'bg-white text-emerald-700 font-semibold shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Shipments
                </button>
                <button
                  type="button"
                  onClick={() => setTypeFilter('Irrelevant')}
                  className={`px-2 py-0.5 rounded transition ${
                    typeFilter === 'Irrelevant'
                      ? 'bg-white text-slate-700 font-semibold shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Skipped
                </button>
              </div>
            </div>

            <div className="relative w-full sm:w-48">
              <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                <Search className="h-3.5 w-3.5" />
              </span>
              <input
                className="w-full text-xs pl-8 pr-2.5 py-1.5 sm:py-1 bg-white border border-slate-200 rounded text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search emails..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Mobile Cards View (< md) */}
          <div className="block md:hidden divide-y divide-slate-100">
            {filteredEmails.map((email) => (
              <div key={email.id} className="p-4 space-y-2 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 text-xs truncate max-w-[200px]">
                    {email.from}
                  </span>
                  {getTypeBadge(email.type)}
                </div>

                <p className="text-xs text-slate-700 font-medium line-clamp-2">
                  {email.subject}
                </p>

                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <span>{email.date}</span>
                    <span>•</span>
                    {email.processed ? (
                      <span className="text-emerald-600 font-semibold">✓ Processed</span>
                    ) : (
                      <span className="text-slate-400">✕ Skipped</span>
                    )}
                  </div>
                  <button
                    className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition cursor-pointer"
                    type="button"
                    onClick={() => onOpenEmailDetails(email)}
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table Container (md+) */}
          <div className="hidden md:block overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[11px] font-semibold text-slate-600 border-b border-slate-100 bg-white">
                  <th className="py-2.5 px-5">From</th>
                  <th className="py-2.5 px-4">Subject</th>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Type</th>
                  <th className="py-2.5 px-4">Processed</th>
                  <th className="py-2.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredEmails.map((email) => (
                  <tr
                    key={email.id}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="py-3 px-5 text-xs text-slate-700 font-medium">
                      {email.from}
                    </td>
                    <td className="py-3 px-4 font-normal text-slate-800">
                      {email.subject}
                    </td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap text-sm font-medium tabular-nums">
                      {email.date}
                    </td>
                    <td className="py-3 px-4">{getTypeBadge(email.type)}</td>
                    <td className="py-3 px-4 font-medium whitespace-nowrap">
                      {email.processed ? (
                        <span className="text-emerald-600 font-medium">✓ Yes</span>
                      ) : (
                        <span className="text-slate-400 font-medium">✕ Skipped</span>
                      )}
                    </td>
                    <td className="py-3 px-5 text-right">
                      <button
                        className="px-3 py-1 text-[11px] font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 shadow-xs cursor-pointer transition"
                        type="button"
                        onClick={() => onOpenEmailDetails(email)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        {/* END: SampleEmailsCard */}

        {/* BEGIN: LatestUpdatesCard (Activity Feed) */}
        <section
          className="lg:col-span-4 bg-white rounded-lg border border-slate-200/90 shadow-xs flex flex-col p-5"
          data-purpose="latest-updates-feed"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <h3 className="text-xs font-bold text-slate-800">Latest Updates</h3>
            <span className="text-[10px] text-slate-400 font-medium">Auto Parsed</span>
          </div>

          <div className="space-y-3.5 overflow-y-auto max-h-[500px] pr-1">
            {activityUpdates.map((act) => (
              <div
                key={act.id}
                className="flex items-start gap-3 p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition"
              >
                {getActivityIcon(act.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 leading-tight">
                    {act.title}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                    {act.subtitle}
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {act.timeAgo}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
        {/* END: LatestUpdatesCard */}
      </div>
    </main>
  );
};
