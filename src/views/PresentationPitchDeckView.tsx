import React, { useState, useEffect } from 'react';
import {
  Layers,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Printer,
  Sparkles,
  Server,
  Database,
  ShieldCheck,
  Cpu,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Workflow,
  Code2,
  BarChart3,
  Terminal,
  ExternalLink,
  MessageSquareQuote,
  Lightbulb,
  Download,
  FileText,
} from 'lucide-react';
import { ActiveNav } from '../types';

interface PresentationPitchDeckViewProps {
  onNavigate: (nav: ActiveNav) => void;
}

export const PresentationPitchDeckView: React.FC<PresentationPitchDeckViewProps> = ({
  onNavigate,
}) => {
  const [currentSlide, setCurrentSlide] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showSpeakerNotes, setShowSpeakerNotes] = useState<boolean>(false);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        setCurrentSlide((prev) => Math.min(prev + 1, 3));
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlide((prev) => Math.max(prev - 1, 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPptx = () => {
    const link = document.createElement('a');
    link.href = '/api/presentation/download-pptx';
    link.setAttribute('download', 'BLUSPARK_Judges_Presentation.pptx');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  return (
    <div className="flex-1 bg-[#090d16] text-slate-100 overflow-y-auto flex flex-col p-4 sm:p-6 lg:p-8">
      {/* Top Deck Control Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Judges Pitch Deck • 3 Slides
              </span>
              <span className="text-xs text-slate-400">Slide {currentSlide} of 3</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              BLUSPARK Logistics Intelligence Platform
            </h2>
          </div>
        </div>

        {/* Slide Controls & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Slide Switcher Buttons */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-1 flex items-center gap-1">
            <button
              onClick={() => setCurrentSlide(1)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                currentSlide === 1
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              1. Project &amp; Flowchart
            </button>
            <button
              onClick={() => setCurrentSlide(2)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                currentSlide === 2
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              2. Tech Stack
            </button>
            <button
              onClick={() => setCurrentSlide(3)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                currentSlide === 3
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              3. Pros &amp; Cons
            </button>
          </div>

          {/* Toggle Speaker Notes */}
          <button
            onClick={() => setShowSpeakerNotes(!showSpeakerNotes)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition flex items-center gap-1.5 ${
              showSpeakerNotes
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
            title="Toggle verbal script & speaker talking points"
          >
            <MessageSquareQuote className="w-3.5 h-3.5" />
            <span>{showSpeakerNotes ? 'Hide Script' : 'Speaker Script'}</span>
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 transition"
            title="Fullscreen presentation mode"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Download PPTX Presentation Button */}
          <button
            onClick={handleDownloadPptx}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-lg transition flex items-center gap-1.5 shadow-sm border border-emerald-500/40 cursor-pointer"
            title="Download PowerPoint presentation (.pptx) file directly"
          >
            <Download className="w-3.5 h-3.5 text-emerald-100" />
            <span>Download .PPTX</span>
          </button>

          {/* Print / Export Button */}
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 transition flex items-center gap-1.5"
            title="Print or export to PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export PDF</span>
          </button>
        </div>
      </div>

      {/* Main Slide Card Viewport */}
      <div className="flex-1 my-4 flex flex-col justify-start">
        {/* ========================================================= */}
        {/* SLIDE 1: ABOUT THE PROJECT & FLOWCHART / WORKFLOW         */}
        {/* ========================================================= */}
        {currentSlide === 1 && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Slide Header Banner */}
            <div className="bg-gradient-to-r from-blue-950/60 via-slate-900/90 to-indigo-950/60 border border-blue-500/30 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 max-w-4xl space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold">
                  <Workflow className="w-3.5 h-3.5" />
                  <span>SLIDE 1 • PROJECT OVERVIEW &amp; WORKFLOW ARCHITECTURE</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                  BLUSPARK — Intelligent Ocean Freight Rate &amp; Shipment Tracker
                </h1>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  An end-to-end cloud logistics platform solving global supply chain blindspots: automated ocean freight rate discovery, real-time shipment milestone monitoring, AI-powered email intelligence, and 100% automated carrier invoice discrepancy auditing.
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleDownloadPptx}
                    className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-lg transition flex items-center gap-2 shadow-md cursor-pointer border border-emerald-400/40"
                  >
                    <Download className="w-4 h-4 text-emerald-100" />
                    <span>Download PowerPoint (.pptx) Presentation</span>
                  </button>
                  <span className="text-xs text-slate-400">
                    16:9 Widescreen • Ready for Microsoft PowerPoint &amp; Google Slides
                  </span>
                </div>
              </div>
            </div>

            {/* Problem vs Solution Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-rose-950/20 border border-rose-800/40 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-sm uppercase tracking-wider">
                  <XCircle className="w-4 h-4" />
                  <span>The Real-World Problem</span>
                </div>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">•</span>
                    <span><strong>Manual Quoting Chaos:</strong> Logistics managers waste 12+ hours/week manually checking carrier rate sheets (Maersk, MSC, CMA CGM, Hapag-Lloyd).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">•</span>
                    <span><strong>Tracking Blindspots:</strong> ETA delays are buried inside hundreds of daily operational emails.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">•</span>
                    <span><strong>Invoice Overcharges:</strong> Over 15% of carrier freight invoices contain hidden detention, demurrage, or rate mismatches that go unnoticed.</span>
                  </li>
                </ul>
              </div>

              <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>The BLUSPARK Solution</span>
                </div>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span><strong>Instant Multi-Carrier Search:</strong> Unified rate engine across 20ft &amp; 40ft containers with instant transit time &amp; cost sorting.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span><strong>Automated Email Ingestion:</strong> Intelligent regex/NLP parser automatically updates container statuses and rates from carrier notices.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span><strong>Automated 3-Way Invoice Audit:</strong> Compares contracted rate vs billed invoice to flag dollar discrepancies in real time.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* FLOWCHART / WORKFLOW DIAGRAM: HOW THE APP WORKS */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <Workflow className="w-5 h-5 text-blue-400" />
                    <span>How the App Works: Complete Operational Workflow</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Step-by-step journey from operator authentication to automated delay detection and 3-way invoice auditing.
                  </p>
                </div>
                <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 w-fit">
                  User &amp; System Execution Flow
                </span>
              </div>

              {/* 6-Stage Operational Workflow Flowchart */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 pt-1">
                {/* Step 1 */}
                <div className="bg-[#0b1526] border border-blue-800/40 rounded-xl p-3.5 flex flex-col justify-between hover:border-blue-500 transition">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Step 1</span>
                      <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                    </div>
                    <h4 className="text-xs font-bold text-white">1. Login &amp; Auth</h4>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      User submits credentials. Bcrypt hashes &amp; validates. Dual 256-bit JWT access &amp; refresh tokens issued for session.
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-800 text-[9px] font-mono text-blue-300">
                    RFC 7518 • 256-Bit HS256
                  </div>
                </div>

                {/* Step 2 */}
                <div className="bg-[#0b1526] border border-cyan-800/40 rounded-xl p-3.5 flex flex-col justify-between hover:border-cyan-500 transition">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Step 2</span>
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    </div>
                    <h4 className="text-xs font-bold text-white">2. Rate Discovery</h4>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Operator picks trade lane (20ft/40ft). MongoDB queries carrier rates; sorts by lowest cost or fastest days. Excel import via SheetJS.
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-800 text-[9px] font-mono text-cyan-300">
                    Maersk • MSC • SheetJS
                  </div>
                </div>

                {/* Step 3 */}
                <div className="bg-[#0b1526] border border-indigo-800/40 rounded-xl p-3.5 flex flex-col justify-between hover:border-indigo-500 transition">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Step 3</span>
                      <span className="w-2 h-2 rounded-full bg-indigo-400" />
                    </div>
                    <h4 className="text-xs font-bold text-white">3. Book Shipment</h4>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Operator creates booking with Container ID, departure date, expected arrival (ETA), and locked contracted rate in MongoDB.
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-800 text-[9px] font-mono text-indigo-300">
                    Contract Locked • ETA Saved
                  </div>
                </div>

                {/* Step 4 */}
                <div className="bg-[#0b1526] border border-amber-800/40 rounded-xl p-3.5 flex flex-col justify-between hover:border-amber-500 transition">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Step 4</span>
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                    </div>
                    <h4 className="text-xs font-bold text-white">4. Delay Detection</h4>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Automated engine evaluates: Is <code className="text-amber-300">Today &gt; ETA</code>? If past arrival date and undelivered, status automatically flips to <span className="text-rose-300 font-semibold">Delayed</span>.
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-800 text-[9px] font-mono text-amber-300">
                    Rule Engine • Auto-Flag
                  </div>
                </div>

                {/* Step 5 */}
                <div className="bg-[#0b1526] border border-purple-800/40 rounded-xl p-3.5 flex flex-col justify-between hover:border-purple-500 transition">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Step 5</span>
                      <span className="w-2 h-2 rounded-full bg-purple-400" />
                    </div>
                    <h4 className="text-xs font-bold text-white">5. Email Ingestion</h4>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Carrier notice arrives. Regex parser extracts container ID, new arrival date or GRI rate. Auto-updates record in MongoDB and posts activity.
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-800 text-[9px] font-mono text-purple-300">
                    NLP Regex • Zero Manual Data
                  </div>
                </div>

                {/* Step 6 */}
                <div className="bg-[#0b1526] border border-emerald-800/40 rounded-xl p-3.5 flex flex-col justify-between hover:border-emerald-500 transition">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Step 6</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    </div>
                    <h4 className="text-xs font-bold text-white">6. Invoice Audit</h4>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Operator inputs carrier invoice. Auditor runs: <code className="text-emerald-300">Invoice - Contract</code>. If variance &gt; $0, flags overcharge &amp; drafts claim.
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-800 text-[9px] font-mono text-emerald-300">
                    3-Way Match • Profit Saved
                  </div>
                </div>
              </div>

              {/* Decision Branches Visual Bar */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800 text-xs space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-amber-300 text-[11px] uppercase tracking-wide">
                    <span>⚡ Decision Logic 1: Delay Evaluation Rule</span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-300 space-y-1">
                    <div><code>IF (current_date &gt; expected_arrival &amp;&amp; status != 'Delivered')</code></div>
                    <div className="pl-4 text-rose-300 font-semibold">➔ Status = 'Delayed' + High-Priority Alert Broadcast</div>
                    <div className="pl-4 text-emerald-300 font-semibold">➔ ELSE: Status = 'In Transit' (Normal Milestone)</div>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800 text-xs space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-emerald-300 text-[11px] uppercase tracking-wide">
                    <span>⚖️ Decision Logic 2: 3-Way Invoice Auditor Rule</span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-300 space-y-1">
                    <div><code>variance = invoice_amount_usd - contracted_rate_usd</code></div>
                    <div className="pl-4 text-rose-300 font-semibold">➔ IF variance &gt; 0: Flag 'Discrepancy Detected' (Overcharge Claim)</div>
                    <div className="pl-4 text-emerald-300 font-semibold">➔ IF variance == 0: Flag 'Verified Clean Match' (Approve Payment)</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Speaker Notes Box for Slide 1 */}
            {showSpeakerNotes && (
              <div className="bg-amber-950/20 border border-amber-600/40 rounded-xl p-4 space-y-2 animate-in fade-in duration-150">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
                  <MessageSquareQuote className="w-4 h-4" />
                  <span>Presenter Script for Judges (Slide 1)</span>
                </div>
                <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed italic">
                  &ldquo;Respected judges, global supply chain teams move over 80% of global goods via ocean freight, yet 90% of operational logistics is still managed on static Excel sheets and cluttered email inboxes. We built BLUSPARK to solve this. BLUSPARK is an automated intelligence platform that unifies rate discovery across top carriers like Maersk and MSC, tracks live shipment milestones, parses carrier updates automatically, and audits carrier invoices to immediately detect overcharges. In this flowchart, you see our 5-phase event-driven architecture: from raw freight inputs, through our Express parser and MongoDB Atlas persistence layer, straight to real-time invoice auditing and operational dashboards.&rdquo;
                </p>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* SLIDE 2: TECH STACK USED                                  */}
        {/* ========================================================= */}
        {currentSlide === 2 && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Slide Header Banner */}
            <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900/90 to-purple-950/60 border border-indigo-500/30 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 max-w-4xl space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-semibold">
                  <Code2 className="w-3.5 h-3.5" />
                  <span>SLIDE 2 • TECHNICAL STACK &amp; ENGINEERING ARCHITECTURE</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                  Modern, High-Performance Full-Stack Logistics Architecture
                </h1>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  Carefully engineered for sub-50ms query latency, bank-grade authentication, modular scalability, and cloud resilience.
                </p>
              </div>
            </div>

            {/* Tech Stack 6-Pillar Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Pillar 1: Frontend */}
              <div className="bg-slate-900/90 border border-slate-800 hover:border-blue-500/50 rounded-xl p-5 space-y-3 transition group">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <Layers className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                    React 19 + Vite 8
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white">Frontend Application</h3>
                <ul className="text-xs text-slate-300 space-y-1.5">
                  <li><strong>React 19 &amp; TypeScript:</strong> Strict type safety for complex cargo objects.</li>
                  <li><strong>Tailwind CSS v4:</strong> Ultra-fast zero-runtime utility styling.</li>
                  <li><strong>Lucide React:</strong> Consistent, lightweight iconography.</li>
                  <li><strong>Vite Bundler:</strong> Instant HMR and optimized production treeshaking.</li>
                </ul>
              </div>

              {/* Pillar 2: Backend API */}
              <div className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 rounded-xl p-5 space-y-3 transition group">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Server className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    Node.js + Express 5
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white">Backend Server &amp; REST API</h3>
                <ul className="text-xs text-slate-300 space-y-1.5">
                  <li><strong>Node.js (v22) &amp; TSX:</strong> Native ES Module runtime execution.</li>
                  <li><strong>Express.js v5:</strong> Clean routing for rates, shipments, auth, &amp; database.</li>
                  <li><strong>CORS &amp; Middleware:</strong> Request sanitization &amp; standard error propagation.</li>
                  <li><strong>Vite Middleware Dev Server:</strong> Unified full-stack server entry.</li>
                </ul>
              </div>

              {/* Pillar 3: Database */}
              <div className="bg-slate-900/90 border border-slate-800 hover:border-green-500/50 rounded-xl p-5 space-y-3 transition group">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-400">
                    <Database className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-green-500/10 text-green-300 border border-green-500/20">
                    MongoDB Atlas v7
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white">Cloud Database &amp; Storage</h3>
                <ul className="text-xs text-slate-300 space-y-1.5">
                  <li><strong>MongoDB Atlas Cluster:</strong> Cloud NoSQL document store (<code className="text-green-300">bluspark_logistics</code>).</li>
                  <li><strong>Native MongoDB Driver v7:</strong> High-throughput connection pooling.</li>
                  <li><strong>Multi-Collection Model:</strong> <code className="text-slate-300">users</code>, <code className="text-slate-300">shipments</code>, <code className="text-slate-300">rates</code>, <code className="text-slate-300">emails</code>.</li>
                  <li><strong>Resilient Offline Fallback:</strong> Instant local storage synchronization.</li>
                </ul>
              </div>

              {/* Pillar 4: Security */}
              <div className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 rounded-xl p-5 space-y-3 transition group">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    Dual 256-Bit JWT
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white">Enterprise Security &amp; Auth</h3>
                <ul className="text-xs text-slate-300 space-y-1.5">
                  <li><strong>256-Bit HS256 Access Secret:</strong> Cryptographically signed 24-hr token.</li>
                  <li><strong>256-Bit Refresh Secret:</strong> 30-day token rotation with auto-renewal.</li>
                  <li><strong>Bcrypt.js Password Hashing:</strong> Salted password protection (10 rounds).</li>
                  <li><strong>Role-Based Access (RBAC):</strong> Admin and logistics operator roles.</li>
                </ul>
              </div>

              {/* Pillar 5: Parsing & File Processing */}
              <div className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 rounded-xl p-5 space-y-3 transition group">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    XLSX + NLP Parser
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white">Data Extraction Engines</h3>
                <ul className="text-xs text-slate-300 space-y-1.5">
                  <li><strong>SheetJS (xlsx):</strong> Instant parsing of multi-sheet carrier rate spreadsheets.</li>
                  <li><strong>Regex &amp; NLP Heuristics:</strong> Dissects arrival notices, delays, &amp; GRI emails.</li>
                  <li><strong>Automated Classification:</strong> Rate update vs shipment update vs spam.</li>
                  <li><strong>Audit Calculation Engine:</strong> Automatic contracted vs invoice variance checks.</li>
                </ul>
              </div>

              {/* Pillar 6: AI & Cloud Integration */}
              <div className="bg-slate-900/90 border border-slate-800 hover:border-purple-500/50 rounded-xl p-5 space-y-3 transition group">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                    Gemini AI Ready
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white">AI &amp; Containerization</h3>
                <ul className="text-xs text-slate-300 space-y-1.5">
                  <li><strong>Google GenAI SDK (@google/genai):</strong> AI-assisted invoice OCR expansion.</li>
                  <li><strong>Environment Secrets Isolation:</strong> Safe separation of keys in <code className="text-slate-300">.env</code>.</li>
                  <li><strong>Docker &amp; Cloud Run Ready:</strong> Production deployment on standard Linux containers.</li>
                  <li><strong>Automated Migration Scripts:</strong> Embedded seed and collection init scripts.</li>
                </ul>
              </div>
            </div>

            {/* Architecture Synergy Summary Table */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono text-[10px] uppercase">
                    <th className="pb-2">Layer</th>
                    <th className="pb-2">Technology</th>
                    <th className="pb-2">Why We Chose It</th>
                    <th className="pb-2 text-right">Key Metric</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  <tr>
                    <td className="py-2 font-semibold text-blue-400">UI / Client</td>
                    <td className="py-2">React 19 + Tailwind v4</td>
                    <td className="py-2 text-slate-400">Declarative state, instant rerenders, and zero-bloat styling</td>
                    <td className="py-2 text-right font-mono text-emerald-400">&lt; 100ms TTI</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-semibold text-emerald-400">API Server</td>
                    <td className="py-2">Express 5 + Node 22</td>
                    <td className="py-2 text-slate-400">Non-blocking async I/O suited for concurrent tracking updates</td>
                    <td className="py-2 text-right font-mono text-emerald-400">&lt; 35ms Latency</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-semibold text-green-400">Database</td>
                    <td className="py-2">MongoDB Atlas NoSQL</td>
                    <td className="py-2 text-slate-400">Flexible JSON document schema accommodates carrier format variances</td>
                    <td className="py-2 text-right font-mono text-emerald-400">Horizontal Scale</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-semibold text-cyan-400">Auth &amp; Security</td>
                    <td className="py-2">Dual 256-bit JWT + Bcrypt</td>
                    <td className="py-2 text-slate-400">Stateless RFC 7518 token architecture with automated session renewal</td>
                    <td className="py-2 text-right font-mono text-emerald-400">256-Bit HS256</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Speaker Notes Box for Slide 2 */}
            {showSpeakerNotes && (
              <div className="bg-amber-950/20 border border-amber-600/40 rounded-xl p-4 space-y-2 animate-in fade-in duration-150">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
                  <MessageSquareQuote className="w-4 h-4" />
                  <span>Presenter Script for Judges (Slide 2)</span>
                </div>
                <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed italic">
                  &ldquo;For our technical implementation, we selected a modern full-stack stack designed for reliability and speed. On the client, we run React 19 paired with Tailwind CSS v4 and Vite, delivering an ultra-fast, responsive dashboard. Our API is powered by Express v5 on Node 22, exposing clean REST endpoints. For data storage, we leveraged MongoDB Atlas as our primary NoSQL cloud database because container tracking and carrier quotes have varying schemas that benefit directly from flexible JSON documents. For enterprise security, we implemented a dual JWT token architecture with dedicated 256-bit access and refresh secrets, combined with salted bcrypt password encryption. Finally, our data extraction layer integrates SheetJS for Excel rate imports and regex intelligence for automatic email parsing.&rdquo;
                </p>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* SLIDE 3: ADVANTAGES AND DISADVANTAGES                     */}
        {/* ========================================================= */}
        {currentSlide === 3 && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Slide Header Banner */}
            <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900/90 to-cyan-950/60 border border-emerald-500/30 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 max-w-4xl space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-semibold">
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>SLIDE 3 • VALUE ANALYSIS, TRADE-OFFS &amp; STRATEGIC ROADMAP</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                  Advantages, Technical Trade-Offs &amp; Future Scalability
                </h1>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  A realistic, transparent engineering analysis of our core strengths, current operational constraints, and technical roadmap.
                </p>
              </div>
            </div>

            {/* Advantages vs Disadvantages Dual Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* ADVANTAGES COLUMN */}
              <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-emerald-800/30">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm uppercase tracking-wider">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>Key Advantages &amp; Strengths</span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">
                    High ROI
                  </span>
                </div>

                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="p-3 bg-emerald-950/30 rounded-lg border border-emerald-800/30 space-y-1">
                    <h4 className="font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      1. Zero-Leakage Invoice Auditing
                    </h4>
                    <p className="text-slate-300 text-xs">
                      Automatically detects rate discrepancies, hidden demurrage, or wrongful fuel surcharges before payment, saving up to 8–15% on freight spend.
                    </p>
                  </div>

                  <div className="p-3 bg-emerald-950/30 rounded-lg border border-emerald-800/30 space-y-1">
                    <h4 className="font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      2. Automated Email Intelligence
                    </h4>
                    <p className="text-slate-300 text-xs">
                      Eliminates 15+ hours/week of manual logistics spreadsheet data entry by parsing status updates and rate sheets straight from incoming emails.
                    </p>
                  </div>

                  <div className="p-3 bg-emerald-950/30 rounded-lg border border-emerald-800/30 space-y-1">
                    <h4 className="font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      3. Proactive Delay Prevention
                    </h4>
                    <p className="text-slate-300 text-xs">
                      System automatically flags delayed containers when expected arrival dates elapse, allowing logistics teams to reschedule drayage trucks early.
                    </p>
                  </div>

                  <div className="p-3 bg-emerald-950/30 rounded-lg border border-emerald-800/30 space-y-1">
                    <h4 className="font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      4. High Fault Tolerance &amp; Offline Resilience
                    </h4>
                    <p className="text-slate-300 text-xs">
                      Dual persistence architecture allows the app to work seamlessly online with MongoDB Atlas or fall back safely to local storage if cloud is unreachable.
                    </p>
                  </div>

                  <div className="p-3 bg-emerald-950/30 rounded-lg border border-emerald-800/30 space-y-1">
                    <h4 className="font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      5. Enterprise Cryptographic Security
                    </h4>
                    <p className="text-slate-300 text-xs">
                      Dual 256-bit HS256 tokens with automated token refresh and bcrypt hashing protect commercial shipment rate data from unauthorized access.
                    </p>
                  </div>
                </div>
              </div>

              {/* DISADVANTAGES & LIMITATIONS COLUMN */}
              <div className="bg-rose-950/20 border border-rose-800/40 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-rose-800/30">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-sm uppercase tracking-wider">
                    <XCircle className="w-5 h-5 text-rose-400" />
                    <span>Disadvantages &amp; Technical Limits</span>
                  </div>
                  <span className="text-[11px] font-bold text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded">
                    Identified &amp; Solved
                  </span>
                </div>

                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="p-3 bg-rose-950/30 rounded-lg border border-rose-800/30 space-y-1">
                    <h4 className="font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-400" />
                      1. Carrier Email Format Non-Standardization
                    </h4>
                    <p className="text-slate-300 text-xs">
                      Unstructured emails with erratic phrasing or non-standard container formats require periodic regular expression updates.
                    </p>
                  </div>

                  <div className="p-3 bg-rose-950/30 rounded-lg border border-rose-800/30 space-y-1">
                    <h4 className="font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-400" />
                      2. Cloud Atlas Network Whitelist Dependency
                    </h4>
                    <p className="text-slate-300 text-xs">
                      MongoDB Atlas clusters require Network Access IP rules (0.0.0.0/0 or static cloud NAT IPs) to permit connections across cloud boundaries.
                    </p>
                  </div>

                  <div className="p-3 bg-rose-950/30 rounded-lg border border-rose-800/30 space-y-1">
                    <h4 className="font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-400" />
                      3. Unscannable Image-Based Invoices
                    </h4>
                    <p className="text-slate-300 text-xs">
                      Pure image-based scanned paper PDFs require advanced OCR computer vision rather than plain spreadsheet text ingestion.
                    </p>
                  </div>

                  <div className="p-3 bg-rose-950/30 rounded-lg border border-rose-800/30 space-y-1">
                    <h4 className="font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-400" />
                      4. Lack of Direct Carrier EDI 310/214 Integration
                    </h4>
                    <p className="text-slate-300 text-xs">
                      Currently relies on email and rate spreadsheets rather than direct electronic data interchange (EDI) webhooks from terminal operators.
                    </p>
                  </div>
                </div>

                {/* Strategic Roadmap Box */}
                <div className="mt-4 p-3 bg-slate-900 border border-slate-700/80 rounded-lg space-y-1.5">
                  <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    <span>How We Are Solving These (Future Roadmap)</span>
                  </div>
                  <ul className="text-[11px] text-slate-300 space-y-1">
                    <li>• <strong>Gemini Vision API:</strong> Ingest paper freight invoice images using multi-modal AI OCR.</li>
                    <li>• <strong>Carrier EDI Gateways:</strong> Adding direct AS2/EDI 310 &amp; 214 webhook listeners.</li>
                    <li>• <strong>Geo-Replication:</strong> Multi-region Atlas replica sets across US, EU, and Asia ports.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Speaker Notes Box for Slide 3 */}
            {showSpeakerNotes && (
              <div className="bg-amber-950/20 border border-amber-600/40 rounded-xl p-4 space-y-2 animate-in fade-in duration-150">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
                  <MessageSquareQuote className="w-4 h-4" />
                  <span>Presenter Script for Judges (Slide 3)</span>
                </div>
                <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed italic">
                  &ldquo;To conclude, let’s discuss the strategic advantages and honest engineering trade-offs of BLUSPARK. On the advantage side, our biggest value proposition is financial and operational: we eliminate invoice discrepancy leakage, saving companies 8 to 15% on freight bills, while cutting 15+ hours of weekly spreadsheet labor. Our offline fallback ensures the operations floor never stops even if cloud connectivity blips. On the limitation side, like all real-world logistics tools, we face carrier format variances in unstructured emails and the need for OCR on scanned paper invoices. As shown in our roadmap, we address this directly by integrating Gemini Vision AI for automated document OCR and adding direct EDI 310 webhook listeners. Thank you, judges — we welcome your questions!&rdquo;
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Slide Footer Navigation Bar */}
      <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="font-semibold text-slate-300">Shortcut:</span>
          <span>Press</span>
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-300">
            ← Left
          </kbd>
          <span>and</span>
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-300">
            Right →
          </kbd>
          <span>arrows to change slides</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentSlide((prev) => Math.max(prev - 1, 1))}
            disabled={currentSlide === 1}
            className={`px-4 py-2 text-xs font-semibold rounded-lg border transition flex items-center gap-1.5 ${
              currentSlide === 1
                ? 'opacity-40 cursor-not-allowed border-slate-800 text-slate-600'
                : 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Slide</span>
          </button>

          <span className="text-xs font-mono font-bold text-blue-400 px-2">
            {currentSlide} / 3
          </span>

          <button
            onClick={() => setCurrentSlide((prev) => Math.min(prev + 1, 3))}
            disabled={currentSlide === 3}
            className={`px-4 py-2 text-xs font-semibold rounded-lg border transition flex items-center gap-1.5 ${
              currentSlide === 3
                ? 'opacity-40 cursor-not-allowed border-slate-800 text-slate-600'
                : 'bg-blue-600 border-blue-500 text-white hover:bg-blue-500'
            }`}
          >
            <span>Next Slide</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onNavigate('dashboard')}
            className="ml-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white transition flex items-center gap-1"
          >
            <span>Exit to App</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
