import React from 'react';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import { EmailRecord } from '../types';

interface EmailDetailsModalProps {
  email: EmailRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EmailDetailsModal: React.FC<EmailDetailsModalProps> = ({
  email,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !email) return null;

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'Rate Update':
        return 'bg-amber-50 text-amber-600 border border-amber-200/60';
      case 'Shipment Update':
        return 'bg-emerald-50 text-emerald-600 border border-emerald-200/60';
      default:
        return 'bg-slate-100 text-slate-600 border border-slate-200';
    }
  };

  return (
    <div
      id="email-details-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between">
          <div className="space-y-0.5">
            <h3 id="modal-title" className="text-base font-bold text-slate-900 tracking-tight">
              Email Details
            </h3>
            <p id="modal-subtitle" className="text-xs text-slate-500">
              Parsed freight communication details and payload
            </p>
          </div>
          <button
            id="close-modal-x"
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1 hover:bg-slate-100 transition inline-flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-xs">
          {/* Metadata Card */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-100">
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                Sender
              </span>
              <span id="modal-from" className="font-medium text-slate-800 break-all">
                {email.from}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                Date
              </span>
              <span id="modal-date" className="font-medium text-slate-800">
                {email.date}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                Subject
              </span>
              <span id="modal-subject" className="font-medium text-slate-800">
                {email.subject}
              </span>
            </div>
            <div className="col-span-2 flex items-center gap-2 pt-1.5 border-t border-slate-200/60">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Status:
              </span>
              <span
                id="modal-badge"
                className={`inline-block px-2 py-0.5 text-[10px] font-medium rounded ${getBadgeStyle(
                  email.type
                )}`}
              >
                {email.type}
              </span>
              <span
                id="modal-processed"
                className={`font-medium text-[11px] ml-auto flex items-center gap-1 ${
                  email.processed ? 'text-emerald-600' : 'text-slate-400'
                }`}
              >
                {email.processed ? '✓ Yes' : '✕ Skipped'}
              </span>
            </div>
          </div>

          {/* Applied Action or Skip Reason Note */}
          {email.applied_action && (
            <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-lg flex items-center gap-2 text-emerald-800 text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
              <span>
                <strong>Action Executed:</strong> {email.applied_action}
              </span>
            </div>
          )}

          {email.skip_reason && (
            <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-lg flex items-center gap-2 text-amber-800 text-[11px]">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
              <span>
                <strong>Skip Reason:</strong> {email.skip_reason}
              </span>
            </div>
          )}

          {/* Raw Message Body */}
          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
              Parsed Message Content
            </label>
            <div
              id="modal-body"
              className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-700 font-mono text-[11px] leading-relaxed max-h-44 overflow-y-auto whitespace-pre-wrap select-text"
            >
              {email.raw_body}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            id="close-modal-btn"
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 shadow-xs transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
