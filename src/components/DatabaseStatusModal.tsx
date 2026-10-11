import React, { useState, useEffect } from 'react';
import { Database, CheckCircle2, AlertCircle, RefreshCw, Server, ArrowRight, ShieldCheck, Copy, Check } from 'lucide-react';

interface DatabaseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DbStatusData {
  activeEngine: string;
  isMongoConnected: boolean;
  mongoDatabase: string;
  mongoUriConfigured: boolean;
  configuredUriMasked: string;
  connectionError: string | null;
  stats: {
    users: number;
    rates: number;
    shipments: number;
    emails: number;
  } | null;
}

export const DatabaseStatusModal: React.FC<DatabaseStatusModalProps> = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState<DbStatusData | null>(null);
  const [loading, setLoading] = useState(false);
  const [customUri, setCustomUri] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ text: string; isError?: boolean } | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/database/status');
      const data = await res.json();
      if (data.success) {
        setStatus(data);
      }
    } catch (err: any) {
      console.error('Failed to fetch DB status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
      setActionMessage(null);
    }
  }, [isOpen]);

  const handleConnect = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setConnecting(true);
    setActionMessage(null);
    try {
      const res = await fetch('/api/database/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uri: customUri.trim() || undefined })
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage({ text: 'Connected to MongoDB Atlas successfully! All data synchronized.' });
        setStatus(data.status);
        setCustomUri('');
      } else {
        setActionMessage({ text: data.message || 'Connection failed. Check URI and network/IP access.', isError: true });
        if (data.status) setStatus(data.status);
      }
    } catch (err: any) {
      setActionMessage({ text: err.message || 'Network request failed', isError: true });
    } finally {
      setConnecting(false);
    }
  };

  const handleMigrate = async () => {
    setLoading(true);
    setActionMessage(null);
    try {
      const res = await fetch('/api/database/migrate', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setActionMessage({ text: data.message });
        await fetchStatus();
      } else {
        setActionMessage({ text: data.message, isError: true });
      }
    } catch (err: any) {
      setActionMessage({ text: err.message, isError: true });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyEnv = () => {
    const text = `MONGODB_URI="${customUri.trim() || 'mongodb+srv://<username>:<password>@cluster0.mongodb.net/bluspark_logistics?retryWrites=true&w=majority'}"\nMONGODB_DB_NAME="bluspark_logistics"`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-[#0f172a] border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Database &amp; MongoDB Migration</h2>
              <p className="text-xs text-slate-400">Manage MongoDB driver, collections, and synchronization</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300">
          {/* Status Banner */}
          <div className={`p-4 rounded-lg border flex items-start gap-3.5 ${
            status?.isMongoConnected
              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
              : 'bg-blue-950/30 border-blue-500/40 text-slate-200'
          }`}>
            {status?.isMongoConnected ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <Server className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-white">
                  Engine: {status?.activeEngine || 'Checking...'}
                </span>
                <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full uppercase tracking-wider ${
                  status?.isMongoConnected
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                }`}>
                  {status?.isMongoConnected ? 'Live MongoDB Connected' : 'Ready / Fallback Active'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {status?.isMongoConnected
                  ? `Database: ${status.mongoDatabase} • Target: ${status.configuredUriMasked}`
                  : 'Backend has the MongoDB driver configured and ready. In preview mode, it uses atomic JSON persistence until you connect your MongoDB Atlas or remote cluster.'}
              </p>
            </div>
          </div>

          {/* Action Message if any */}
          {actionMessage && (
            <div className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
              actionMessage.isError
                ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
            }`}>
              {actionMessage.isError ? <AlertCircle className="w-4 h-4 shrink-0" /> : <ShieldCheck className="w-4 h-4 shrink-0" />}
              <span>{actionMessage.text}</span>
            </div>
          )}

          {/* Collection Counts */}
          <div>
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-2.5">
              Collections &amp; Record Counts
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg text-center">
                <div className="text-lg font-bold text-white">{status?.stats?.users ?? '-'}</div>
                <div className="text-[11px] text-slate-400 font-mono">users</div>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg text-center">
                <div className="text-lg font-bold text-white">{status?.stats?.rates ?? '-'}</div>
                <div className="text-[11px] text-slate-400 font-mono">rates</div>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg text-center">
                <div className="text-lg font-bold text-white">{status?.stats?.shipments ?? '-'}</div>
                <div className="text-[11px] text-slate-400 font-mono">shipments</div>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg text-center">
                <div className="text-lg font-bold text-white">{status?.stats?.emails ?? '-'}</div>
                <div className="text-[11px] text-slate-400 font-mono">emails</div>
              </div>
            </div>
          </div>

          {/* Connect Live MongoDB URI */}
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                MongoDB Atlas Connection
              </h3>
              {status?.mongoUriConfigured && (
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Configured in .env
                </span>
              )}
            </div>

            {status?.configuredUriMasked && (
              <div className="text-[11px] bg-slate-950/70 p-2.5 rounded border border-slate-800 flex items-center justify-between gap-2">
                <div className="truncate">
                  <span className="text-slate-400">Target URI: </span>
                  <code className="text-blue-300 font-mono text-[11px]">{status.configuredUriMasked}</code>
                </div>
                <button
                  type="button"
                  onClick={() => handleConnect()}
                  disabled={connecting}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded text-[11px] font-medium transition shrink-0 cursor-pointer flex items-center gap-1"
                >
                  {connecting ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                  <span>{status.isMongoConnected ? 'Re-test' : 'Test / Reconnect'}</span>
                </button>
              </div>
            )}

            {/* Atlas IP Whitelist Guide if SSL error occurs */}
            {status?.connectionError?.includes('Network Access') && (
              <div className="p-3 bg-amber-950/30 border border-amber-500/40 rounded-lg text-[11px] space-y-1.5 text-amber-200">
                <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>Action Needed in MongoDB Atlas (IP Whitelist):</span>
                </div>
                <ol className="list-decimal pl-4 space-y-1 text-slate-300">
                  <li>Open your <strong>MongoDB Atlas</strong> dashboard.</li>
                  <li>In the left sidebar under <em>Security</em>, click <strong>Network Access</strong>.</li>
                  <li>Click <strong>+ Add IP Address</strong>.</li>
                  <li>Click <strong>Allow Access from Anywhere</strong> (sets <code className="text-amber-300 font-mono">0.0.0.0/0</code>) and click <strong>Confirm</strong>.</li>
                  <li>Wait 10-15 seconds for Atlas to apply the change, then click <strong>"Test / Reconnect"</strong> above.</li>
                </ol>
              </div>
            )}

            <form onSubmit={handleConnect} className="space-y-3 pt-1">
              <label className="block text-[11px] text-slate-400">
                Or connect to a different MongoDB URI:
              </label>
              <input
                type="text"
                value={customUri}
                onChange={(e) => setCustomUri(e.target.value)}
                placeholder="mongodb+srv://user:pass@cluster.mongodb.net/bluspark_logistics?retryWrites=true&w=majority"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-md px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
              />
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={connecting || (!customUri.trim() && !status?.mongoUriConfigured)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium rounded-md text-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  {connecting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
                  <span>{connecting ? 'Connecting...' : customUri.trim() ? 'Connect Custom URI' : 'Connect & Migrate'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyEnv}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md text-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy .env snippet'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Quick Info */}
          <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-lg space-y-1.5 text-[11px] text-slate-400">
            <div className="font-semibold text-slate-300">Architecture Features:</div>
            <ul className="list-disc pl-4 space-y-1">
              <li><strong>Official Driver:</strong> Uses native <code className="text-slate-300 font-mono">mongodb</code> client driver with connection pooling.</li>
              <li><strong>Indexes Configured:</strong> Unique index on <code className="text-slate-300 font-mono">email</code> &amp; <code className="text-slate-300 font-mono">shipment_id</code>; compound index on <code className="text-slate-300 font-mono">carrier, origin, destination, container</code>.</li>
              <li><strong>Zero-Downtime Fallback:</strong> If MongoDB is temporarily unreachable, requests are safely served by atomic storage without crashing.</li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={handleMigrate}
            disabled={loading}
            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1.5 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Re-sync Collections</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-md transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
