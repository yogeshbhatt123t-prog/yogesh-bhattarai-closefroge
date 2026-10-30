import React, { useState, useEffect } from 'react';
import {
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  DollarSign,
  TrendingUp,
  Shield,
  FileSpreadsheet,
  FileCode,
  Sparkles,
  Download,
  Copy,
  Check,
  RefreshCw,
  Terminal,
  Database,
  FileText,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers,
  Lock,
  ExternalLink,
  Info,
  X
} from 'lucide-react';

// --- TYPES ---
export type CloseJobStatus =
  | 'idle'
  | 'planning'
  | 'gathering'
  | 'reconciling'
  | 'analyzing_variance'
  | 'drafting_package'
  | 'self_critiquing'
  | 'completed';

export type UserRole = 'controller' | 'external_auditor' | 'board_observer';

export interface JobStep {
  id: string;
  step_number: number;
  name: string;
  state: CloseJobStatus;
  status: 'pending' | 'running' | 'completed' | 'warn';
  duration_ms: number;
  tool_name: string;
  tool_args: string;
  tool_result: string;
  reasoning: string;
  confidence: number;
}

export interface VarianceItem {
  id: string;
  account_code: string;
  account_name: string;
  category: 'Revenue' | 'COGS' | 'R&D' | 'S&M' | 'G&A';
  actual_amount: number;
  budget_amount: number;
  variance_amount: number;
  variance_pct: number;
  materiality: 'high' | 'medium' | 'low';
  ai_analysis: string;
}

export interface ExceptionItem {
  id: string;
  title: string;
  source: 'Stripe' | 'Silicon Valley Bank' | 'Brex' | 'NetSuite';
  amount: number;
  confidence: number;
  detected_anomaly: string;
  suggested_action: string;
  resolved: boolean;
  resolution_note?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: 'agent' | 'user' | 'system';
  action: string;
  details: string;
  hash: string;
}

// --- SEED DATA ---
const initialVariances: VarianceItem[] = [
  {
    id: 'var_01',
    account_code: '5010',
    account_name: 'Cloud Hosting & GPUs (AWS / CoreWeave)',
    category: 'COGS',
    actual_amount: 342500,
    budget_amount: 285000,
    variance_amount: 57500,
    variance_pct: 20.18,
    materiality: 'high',
    ai_analysis: '20.2% unfavorable variance driven by enterprise customer AI inference spikes. Fully offset by +$84k usage revenue billing in Q3.',
  },
  {
    id: 'var_02',
    account_code: '4010',
    account_name: 'SaaS Subscription Revenue (ASC 606)',
    category: 'Revenue',
    actual_amount: 5920000,
    budget_amount: 5670000,
    variance_amount: 250000,
    variance_pct: 4.41,
    materiality: 'high',
    ai_analysis: '+$250k (+4.4%) favorable to plan. Driven by accelerated mid-market expansion (NDR expanded from 114% to 118.2%) and 3 new multi-year renewals.',
  },
  {
    id: 'var_03',
    account_code: '6010',
    account_name: 'Sales Commissions & Quota Accelerators',
    category: 'S&M',
    actual_amount: 495000,
    budget_amount: 410000,
    variance_amount: 85000,
    variance_pct: 20.73,
    materiality: 'medium',
    ai_analysis: '+$85k commission overrun due to 142% quota attainment in EMEA enterprise tier. Under ASC 340-40, qualifying commissions are capitalized and amortized over 4.2yr CAC life.',
  },
  {
    id: 'var_04',
    account_code: '7020',
    account_name: 'Legal & Compliance (SOC2 / ISO Audit)',
    category: 'G&A',
    actual_amount: 112000,
    budget_amount: 135000,
    variance_amount: -23000,
    variance_pct: -17.04,
    materiality: 'low',
    ai_analysis: '-17.0% favorable variance resulting from automated continuous audit compliance tooling replacing manual external advisory billable hours.',
  },
];

const initialExceptions: ExceptionItem[] = [
  {
    id: 'exc_01',
    title: 'Unmatched AWS Reserved Instance True-Up',
    source: 'Silicon Valley Bank',
    amount: 18450.00,
    confidence: 0.94,
    detected_anomaly: 'Bank debit of $18,450.00 from Amazon Web Services on Sept 28 without a finalized NetSuite purchase order.',
    suggested_action: 'Classify under COGS: Hosting Infrastructure (Dept 100, Account 5010) as annual savings plan upfront deposit amortizable over 12 months.',
    resolved: false,
  },
  {
    id: 'exc_02',
    title: 'Stripe Enterprise Wire Transfer Reconciliation Delay',
    source: 'Stripe',
    amount: 142800.00,
    confidence: 0.98,
    detected_anomaly: 'Custom annual contract payment for "Acme Global Enterprise" received via Stripe manual wire payout with $142,800 net of $1,200 wire clearing fee.',
    suggested_action: 'Credit Deferred Revenue (2100) $144,000, Debit Stripe Processing Fees (5030) $1,200, Debit Operating Cash (1010) $142,800.',
    resolved: true,
    resolution_note: 'Auto-reconciled via Stripe Invoice Metadata #INV-2026-8819.',
  },
];

const initialAuditLogs: AuditLogEntry[] = [
  {
    id: 'log_01',
    timestamp: '2026-10-30T00:15:10Z',
    actor: 'system',
    action: 'TENANT_RLS_VERIFIED',
    details: 'Tenant isolation verified for org_cloudscale_01. Current session bound to PostgreSQL role "app_finance_worker".',
    hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  },
  {
    id: 'log_02',
    timestamp: '2026-10-30T00:15:12Z',
    actor: 'agent',
    action: 'VECTOR_STORE_LOOKUP',
    details: 'Queried pgvector knowledge_base with embedding vector(1536) for "ASC 606 SaaS ratable revenue & commission capitalization". Top 2 policies retrieved (cos_sim > 0.91).',
    hash: '5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5',
  },
  {
    id: 'log_03',
    timestamp: '2026-10-30T00:15:18Z',
    actor: 'agent',
    action: 'RECONCILIATION_RUN',
    details: 'Reconciled 4,892 Stripe payment events against SVB depository records. 4,891 matched (99.98%). 1 discrepancy flagged for controller sign-off ($18,450 AWS charge).',
    hash: 'd4735e3a265e16eee03f59718b9b5d03019c07d8b6c51f90da3a666eec13ab35',
  },
  {
    id: 'log_04',
    timestamp: '2026-10-30T00:15:25Z',
    actor: 'agent',
    action: 'INVARIANT_AUDIT_PASSED',
    details: 'Invariants checked: Debits = Credits ($31,840,290.00). Suspense balance = $0.00. Cash flow reconciliation tie-out confirmed.',
    hash: '4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce',
  },
];

const executionStepsTemplate: JobStep[] = [
  {
    id: 'step_01',
    step_number: 1,
    name: 'Formulate Close Plan & Tool DAG',
    state: 'planning',
    status: 'completed',
    duration_ms: 140,
    tool_name: 'compile_execution_dag',
    tool_args: '{"period": "Q3 2026", "invariants": ["debits_equal_credits", "zero_suspense"]}',
    tool_result: '{"dag_nodes": 6, "safety_invariants_loaded": 14, "est_runtime_sec": 3.8}',
    reasoning: 'Decomposed high-level close goal into 6 deterministic execution phases. Pre-loaded 14 GAAP mathematical invariant tests into execution sandbox.',
    confidence: 0.99,
  },
  {
    id: 'step_02',
    step_number: 2,
    name: 'Vector Retrieval of Accounting Policies & Ingestion',
    state: 'gathering',
    status: 'completed',
    duration_ms: 220,
    tool_name: 'pgvector_semantic_search',
    tool_args: '{"query": "ASC 606 revenue recognition & software capitalization threshold"}',
    tool_result: '{"matched_policies": 2, "cosine_similarity": 0.92, "source_records_parsed": 5128}',
    reasoning: 'Retrieved company-specific ASC 606 ratable recognition policy from pgvector. Ingested and deduplicated 5,128 multi-source ledger entries.',
    confidence: 0.98,
  },
  {
    id: 'step_03',
    step_number: 3,
    name: 'Multi-Source Algorithmic Reconciliation',
    state: 'reconciling',
    status: 'completed',
    duration_ms: 360,
    tool_name: 'reconcile_bank_vs_ledger',
    tool_args: '{"bank_source": "SVB Operating", "gl_source": "NetSuite GL", "tolerance_usd": 0.01}',
    tool_result: '{"matched_items": 5126, "match_rate": "99.96%", "unmatched_delta": 0.00, "exceptions_isolated": 1}',
    reasoning: 'Automated 5,126 journal matching rules. Detected 1 minor timing anomaly on AWS Reserved Instance debit ($18,450.00) and routed to exception inbox.',
    confidence: 0.97,
  },
  {
    id: 'step_04',
    step_number: 4,
    name: 'Variance Root-Cause Attribution & Burn Runway',
    state: 'analyzing_variance',
    status: 'completed',
    duration_ms: 290,
    tool_name: 'calculate_budget_variances',
    tool_args: '{"threshold_pct": 10, "min_amount_usd": 20000}',
    tool_result: '{"flagged_variances": 4, "runway_months": 28.5, "burn_multiple": 0.62}',
    reasoning: 'Decomposed 4 material variances. GPU compute spike (+20.2%) is correlated with enterprise consumption billings (+24.1%). Runway stands at 28.5 months.',
    confidence: 0.98,
  },
  {
    id: 'step_05',
    step_number: 5,
    name: 'Draft GAAP Statements & Board Executive Memo',
    state: 'drafting_package',
    status: 'completed',
    duration_ms: 410,
    tool_name: 'synthesize_board_memo',
    tool_args: '{"period": "Q3 2026", "model": "gemini-3.8-flash"}',
    tool_result: '{"memo_length": 2480, "readability": "board_certified", "asc606_waterfall": "verified"}',
    reasoning: 'Constructed full GAAP three-statement package, ASC 606 revenue waterfall, and institutional board memo with zero fluff.',
    confidence: 0.99,
  },
  {
    id: 'step_06',
    step_number: 6,
    name: 'Autonomous Self-Critique & Invariant Verification',
    state: 'self_critiquing',
    status: 'completed',
    duration_ms: 180,
    tool_name: 'audit_accounting_invariants',
    tool_args: '{"check_footing": true, "check_suspense": true, "check_asc606": true}',
    tool_result: '{"debits_equal_credits": true, "suspense_balance": 0.00, "all_14_invariants_passed": true}',
    reasoning: 'Self-critique passed all 14 programmatic sanity checks: Total Debits equal Total Credits ($31,840,290.00), zero suspense balance, 100% ASC 606 adherence.',
    confidence: 0.99,
  },
];

export default function App() {
  // Navigation & Role
  const [activeTab, setActiveTab] = useState<'memo' | 'pnl' | 'variance' | 'exceptions' | 'audit'>('memo');
  const [currentRole, setCurrentRole] = useState<UserRole>('controller');
  
  // Modals
  const [showArchModal, setShowArchModal] = useState<boolean>(false);
  const [showPitchModal, setShowPitchModal] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);

  // Close Goal Input
  const [goal, setGoal] = useState<string>(
    'Execute full Q3 2026 financial close across Stripe, NetSuite GL, and SVB operating accounts. Calculate ASC 606 ratable revenue waterfall, flag budget variances >10%, verify zero suspense balance, and synthesize a one-page board summary memo.'
  );
  const [period, setPeriod] = useState<string>('Q3 2026');
  
  // Execution State
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentStatus, setCurrentStatus] = useState<CloseJobStatus>('completed');
  const [progressPct, setProgressPct] = useState<number>(100);
  const [steps, setSteps] = useState<JobStep[]>(executionStepsTemplate);
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null);

  // Financial Data State
  const [exceptions, setExceptions] = useState<ExceptionItem[]>(initialExceptions);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(initialAuditLogs);
  const [outcomeScore, setOutcomeScore] = useState<number>(98.4);
  const [screenTimeSaved, setScreenTimeSaved] = useState<number>(74.5);
  const [copiedMemo, setCopiedMemo] = useState<boolean>(false);

  // Preset Handlers
  const handleSelectPreset = (pText: string, pPeriod: string) => {
    setGoal(pText);
    setPeriod(pPeriod);
  };

  // Run Autonomous Close Simulation
  const handleRunClose = () => {
    setIsRunning(true);
    setProgressPct(5);
    setCurrentStatus('planning');
    
    // Reset steps to pending
    setSteps(prev => prev.map((s, idx) => ({
      ...s,
      status: idx === 0 ? 'running' : 'pending'
    })));

    const phases: Array<{ status: CloseJobStatus; progress: number; stepIndex: number; delay: number }> = [
      { status: 'planning', progress: 15, stepIndex: 0, delay: 600 },
      { status: 'gathering', progress: 35, stepIndex: 1, delay: 1200 },
      { status: 'reconciling', progress: 55, stepIndex: 2, delay: 2000 },
      { status: 'analyzing_variance', progress: 75, stepIndex: 3, delay: 2800 },
      { status: 'drafting_package', progress: 90, stepIndex: 4, delay: 3600 },
      { status: 'self_critiquing', progress: 98, stepIndex: 5, delay: 4300 },
      { status: 'completed', progress: 100, stepIndex: 6, delay: 5000 },
    ];

    phases.forEach(({ status, progress, stepIndex, delay }) => {
      setTimeout(() => {
        setCurrentStatus(status);
        setProgressPct(progress);

        setSteps(prev => prev.map((s, idx) => {
          if (idx < stepIndex) return { ...s, status: 'completed' };
          if (idx === stepIndex && status !== 'completed') return { ...s, status: 'running' };
          if (status === 'completed') return { ...s, status: 'completed' };
          return s;
        }));

        if (status === 'completed') {
          setIsRunning(false);
          setOutcomeScore(98.8);
          setScreenTimeSaved(76.2);
          
          // Append new audit entry
          const newLog: AuditLogEntry = {
            id: `log_${Date.now()}`,
            timestamp: new Date().toISOString(),
            actor: 'system',
            action: 'OUTCOME_CLOSE_DELIVERED',
            details: `Autonomous close for ${period} certified. 14/14 GAAP invariants verified. Outcome fee of $1,250 billed.`,
            hash: '07123e1f482356c415f684407a3b8723e10b2cbbc0b8fcd6282c49d37c9c1abc'
          };
          setAuditLogs(prev => [newLog, ...prev]);
        }
      }, delay);
    });
  };

  // Resolve Exception
  const handleResolveException = (id: string) => {
    setExceptions(prev => prev.map(exc => {
      if (exc.id === id) {
        return {
          ...exc,
          resolved: true,
          resolution_note: 'Approved by Controller: Allocated to COGS Hosting Infrastructure amortized over 12 months.'
        };
      }
      return exc;
    }));

    setOutcomeScore(prev => Math.min(100, prev + 1.2));

    const auditEntry: AuditLogEntry = {
      id: `log_exc_${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: 'user',
      action: 'EXCEPTION_RESOLVED',
      details: `Exception ${id} approved by Controller. Debits balanced to Account 5010.`,
      hash: '7c86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a11'
    };
    setAuditLogs(prev => [auditEntry, ...prev]);
  };

  const handleCopyMemo = () => {
    navigator.clipboard.writeText(boardMemoText);
    setCopiedMemo(true);
    setTimeout(() => setCopiedMemo(false), 2000);
  };

  const boardMemoText = `## FrogeClose Executive Financial Memo: ${period} Performance
**To:** Board of Directors, CloudScale Technologies, Inc.  
**From:** Autonomous Financial Close Agent (Reviewed by Controller)  
**Date:** October 30, 2026  
**Status:** GAAP Close Certified (Outcome Score: ${outcomeScore.toFixed(1)}/100)

### 1. Executive Summary & Core Milestones
CloudScale delivered exceptional capital-efficient growth in ${period}. GAAP Net Revenue reached **$6.20M** (+11.9% QoQ, +4.2% favorable to budget), representing an annualized run-rate (ARR) of **$24.8M**. 
Operating Income turned positive to **+$426k** (EBITDA margin 8.0%), demonstrating inflection toward durable cash profitability. Cash and short-term equivalents stand at **$14.25M**, representing **28.5 months of runway** at current net burn trajectories (Burn Multiple: 0.62x).

### 2. Unit Economics & Retention (ASC 606 Compliant)
- **Net Dollar Retention (NDR):** Expanded to **118.2%** (up from 114.5% in Q2), fueled by tier migrations to enterprise AI pipelines.
- **Gross Margin:** Maintained at **81.4%**, despite a 20.2% increase in cloud infrastructure computing expenses caused by real-time customer inference spikes.
- **Customer Acquisition Payback:** 11.4 months on a fully burdened CAC basis.

### 3. Key Variance Commentary
- **Revenue (+4.2% to budget):** Accelerated enterprise closing cycle; 3 new contracts >$100k ACV closed in the final 10 days of September.
- **Cloud Hosting & GPUs (+20.2% to budget):** Unfavorable variance of $57.5k in AWS/CoreWeave clusters. Root cause: Enterprise customer AI inference overage, offset by $84k in billable consumption revenue.
- **Sales Commissions (+20.7% to budget):** $85k commission overrun reflecting 142% quota attainment in EMEA enterprise reps. In accordance with ASC 340-40, qualifying incremental acquisition costs have been capitalized and will amortize over customer lifetime.

### 4. Audit & Balance Sheet Tie-Out
All debit/credit invariants verified ($31.84M in total balance sheet footing). Suspense account balance is zero. All Stripe collections reconciled against SVB depository statements with 99.96% automated tie-out rate.`;

  return (
    <div className="min-h-screen bg-[#090b0e] text-slate-100 flex flex-col font-sans">
      {/* 1. TOP BAR (Strict 3-zone contract: Brand - Nav - Action) */}
      <header className="border-b border-neutral-800 bg-[#0c0f16] px-6 py-3.5 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Cpu className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                FrogeClose
                <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-1.5 py-0.5 rounded">Outcome Engine</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">FrogeClose.com · Autonomous Financial Close</div>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
            <button
              onClick={() => setActiveTab('memo')}
              className={`transition-colors whitespace-nowrap pb-0.5 ${
                activeTab === 'memo' ? 'text-emerald-400 border-b-2 border-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Executive Close
            </button>
            <button
              onClick={() => setActiveTab('pnl')}
              className={`transition-colors whitespace-nowrap pb-0.5 ${
                activeTab === 'pnl' ? 'text-emerald-400 border-b-2 border-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              GAAP Statements & ASC 606
            </button>
            <button
              onClick={() => setActiveTab('variance')}
              className={`transition-colors whitespace-nowrap pb-0.5 ${
                activeTab === 'variance' ? 'text-emerald-400 border-b-2 border-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Variance Attribution
            </button>
            <button
              onClick={() => setShowArchModal(true)}
              className="text-slate-400 hover:text-slate-200 transition-colors whitespace-nowrap flex items-center gap-1"
            >
              <Database className="w-3.5 h-3.5 text-slate-400" />
              System Architecture
            </button>
            <button
              onClick={() => setShowPitchModal(true)}
              className="text-slate-400 hover:text-slate-200 transition-colors whitespace-nowrap flex items-center gap-1"
            >
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              YC / a16z Memo
            </button>
          </nav>

          {/* Zone 3: Multi-Role Switcher & Action */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5 bg-[#141923] border border-neutral-800 rounded-md p-1 text-xs">
              <span className="text-[11px] text-slate-400 pl-1.5 hidden sm:inline">Role:</span>
              <select
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value as UserRole)}
                className="bg-transparent text-slate-200 text-xs font-medium focus:outline-none cursor-pointer pr-1"
              >
                <option value="controller" className="bg-[#141923] text-slate-200">
                  Controller (Admin)
                </option>
                <option value="external_auditor" className="bg-[#141923] text-slate-200">
                  External Auditor (PwC)
                </option>
                <option value="board_observer" className="bg-[#141923] text-slate-200">
                  Board Observer (VC)
                </option>
              </select>
            </div>

            <div className="hidden lg:flex items-center gap-1.5 text-emerald-400 text-[11px] font-mono bg-emerald-950/40 border border-emerald-900/40 px-2.5 py-1.5 rounded-md">
              <Shield className="w-3.5 h-3.5" />
              <span>RLS Protected</span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE VIEWPORT */}
      <main className="max-w-7xl mx-auto px-6 py-6 w-full flex-1">
        {/* Banner: YC Vision & Screen Time Shift */}
        <div className="mb-6 p-4 rounded-lg bg-[#0f1420] border border-neutral-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>Killing the Screen Time KPI</span>
              <span className="text-slate-500">·</span>
              <span className="text-emerald-400 font-mono text-[11px]">Outcome-Based Agent</span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Software success used to mean keeping accountants in front of screens for 80 hours a month. FrogeClose automates the entire month-end close and board deck preparation. You describe the outcome; humans only review isolated exceptions.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowPitchModal(true)}
              className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-[#161c28] hover:text-white border border-neutral-700/80 rounded transition-colors whitespace-nowrap"
            >
              Read YC Thesis
            </button>
            <button
              onClick={() => setShowExportModal(true)}
              className="px-3 py-1.5 text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded transition-colors whitespace-nowrap flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Package</span>
            </button>
          </div>
        </div>

        {/* TOP KPI METRICS STRIP */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <div className="bg-[#0f131c] border border-neutral-800/80 rounded-lg p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Outcome Score</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-white tabular-nums">
                {isRunning ? '—' : outcomeScore.toFixed(1)}
              </span>
              <span className="text-xs text-slate-400 font-mono">/ 100</span>
            </div>
            <div className="text-[11px] text-emerald-400/90 mt-1 flex items-center gap-1 font-mono">
              <span>14/14 GAAP Invariants</span>
            </div>
          </div>

          <div className="bg-[#0f131c] border border-neutral-800/80 rounded-lg p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Screen Time Saved</span>
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-white tabular-nums">
                {isRunning ? '...' : `${screenTimeSaved}h`}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-mono">
              <span>Zero manual entry</span>
            </div>
          </div>

          <div className="bg-[#0f131c] border border-neutral-800/80 rounded-lg p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Outcome Fee</span>
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
                $1,250
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-mono line-through">
              Legacy: $14,800
            </div>
          </div>

          <div className="bg-[#0f131c] border border-neutral-800/80 rounded-lg p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Verified ARR (Q3)</span>
              <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-white tabular-nums">
                $24.8M
              </span>
              <span className="text-xs text-emerald-400 font-mono">+11.9%</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-mono">
              <span>NDR: 118.2%</span>
            </div>
          </div>

          <div className="bg-[#0f131c] border border-neutral-800/80 rounded-lg p-3.5 flex flex-col justify-between col-span-2 md:col-span-1">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Cash Runway</span>
              <Shield className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-white tabular-nums">
                28.5 mo
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-mono">
              $14.25M at SVB
            </div>
          </div>
        </div>

        {/* GOAL INPUT & CONNECTED SOURCES ZONE */}
        <div className="bg-[#0f131c] border border-neutral-800 rounded-lg p-5 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-200">Outcome Specification</span>
              <span className="text-slate-500 text-xs">·</span>
              <span className="text-xs text-slate-400">Describe the desired financial outcome once</span>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-[11px] text-slate-400 font-mono">Period:</label>
              <input
                type="text"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                disabled={isRunning}
                className="bg-[#141923] border border-neutral-800 text-slate-200 text-xs font-mono px-2.5 py-1 rounded focus:outline-none focus:border-emerald-500 w-24 text-center"
              />
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            <span className="text-[11px] text-slate-400 mr-1">Presets:</span>
            <button
              onClick={() => handleSelectPreset(
                'Execute full Q3 2026 financial close across Stripe, NetSuite GL, and SVB operating accounts. Calculate ASC 606 ratable revenue waterfall, flag budget variances >10%, verify zero suspense balance, and synthesize a one-page board summary memo.',
                'Q3 2026'
              )}
              disabled={isRunning}
              className="text-xs px-2.5 py-1 rounded bg-emerald-950/70 border border-emerald-700/60 text-emerald-300 font-medium hover:bg-emerald-900/60 transition-colors"
            >
              Q3 2026 Full Close + Board Deck
            </button>
            <button
              onClick={() => handleSelectPreset(
                'Perform flash month-end close for September 2026. Audit AWS and CoreWeave GPU inference billings against customer consumption tiers, ensure gross margin exceeds 80%, and reconcile Brex executive corporate cards.',
                'Sept 2026'
              )}
              disabled={isRunning}
              className="text-xs px-2.5 py-1 rounded bg-[#141923] border border-neutral-800 text-slate-400 hover:text-slate-200 transition-colors"
            >
              Flash Month-End & GPU Cost Variance
            </button>
            <button
              onClick={() => handleSelectPreset(
                'Reconcile all bank depository accounts against NetSuite General Ledger through Q3. Verify 100% debit/credit mathematical footing, zero unallocated receipts, and generate PwC external audit tie-out binder.',
                'FY 2026 YTD'
              )}
              disabled={isRunning}
              className="text-xs px-2.5 py-1 rounded bg-[#141923] border border-neutral-800 text-slate-400 hover:text-slate-200 transition-colors"
            >
              Pre-Audit Year-to-Date Tie-Out
            </button>
          </div>

          {/* Goal Textarea */}
          <div className="relative mb-4">
            <textarea
              rows={3}
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              disabled={isRunning}
              className="w-full bg-[#121622] border border-neutral-800 rounded-md p-3 text-xs md:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/70 font-sans leading-relaxed resize-none"
            />
          </div>

          {/* Connected Sources */}
          <div className="pt-2 border-t border-neutral-800/80 mb-4">
            <div className="text-[11px] text-slate-400 mb-2 flex items-center justify-between">
              <span>Connected Sources & Ingestion Queue (4 Sources Ready)</span>
              <span className="text-emerald-400 font-mono text-[10px]">Encrypted & Sandboxed</span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-[#141923] border border-neutral-800/80 rounded p-2 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="truncate">
                  <div className="font-medium text-slate-200 truncate">Stripe_Payouts_Q3.csv</div>
                  <div className="text-[10px] text-slate-500 font-mono">1.42 MB · 4,892 items</div>
                </div>
              </div>

              <div className="bg-[#141923] border border-neutral-800/80 rounded p-2 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-cyan-400 shrink-0" />
                <div className="truncate">
                  <div className="font-medium text-slate-200 truncate">NetSuite_GL_Q3.csv</div>
                  <div className="text-[10px] text-slate-500 font-mono">3.10 MB · 5,128 records</div>
                </div>
              </div>

              <div className="bg-[#141923] border border-neutral-800/80 rounded p-2 flex items-center gap-2">
                <FileCode className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="truncate">
                  <div className="font-medium text-slate-200 truncate">SVB_Operating.pdf</div>
                  <div className="text-[10px] text-slate-500 font-mono">890 KB · Bank OCR</div>
                </div>
              </div>

              <div className="bg-[#141923] border border-neutral-800/80 rounded p-2 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-purple-400 shrink-0" />
                <div className="truncate">
                  <div className="font-medium text-slate-200 truncate">Brex_CorpExpenses.csv</div>
                  <div className="text-[10px] text-slate-500 font-mono">450 KB · 612 receipts</div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-neutral-800/80">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Pay-per-outcome: <strong>$1,250</strong> charged only upon certified close</span>
            </div>

            <button
              onClick={handleRunClose}
              disabled={isRunning}
              className={`w-full sm:w-auto px-6 py-2.5 rounded-md text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                isRunning
                  ? 'bg-neutral-800 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold shadow-lg shadow-emerald-500/10'
              }`}
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Executing Autonomous Close...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Run Autonomous Close</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* AGENT STATE MACHINE PROGRESS STEPPER */}
        <div className="bg-[#0f131c] border border-neutral-800 rounded-lg p-5 mb-6">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div>
              <div className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                <span>Agentic Orchestration Loop</span>
                <span className="text-slate-500">·</span>
                <span className="text-xs text-slate-400 font-normal">State Machine Execution</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                Status: <span className="text-emerald-400 uppercase font-semibold">{currentStatus.replace('_', ' ')}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-mono font-bold text-slate-200 tabular-nums">{progressPct}%</span>
              <div className="w-28 sm:w-40 bg-neutral-800 h-1.5 rounded-full mt-1 overflow-hidden">
                <div
                  className="bg-emerald-400 h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2 mt-4">
            {steps.map((step) => {
              const isCompleted = step.status === 'completed';
              const isRunningStep = step.status === 'running';
              const isExpanded = expandedStepId === step.id;

              return (
                <div
                  key={step.id}
                  className={`border rounded-md transition-colors ${
                    isCompleted
                      ? 'border-neutral-800 bg-[#121622]/60'
                      : isRunningStep
                      ? 'border-emerald-600/80 bg-emerald-950/20'
                      : 'border-neutral-800/40 bg-[#0d1017]/40'
                  }`}
                >
                  <div
                    onClick={() => setExpandedStepId(isExpanded ? null : step.id)}
                    className="px-3.5 py-2.5 flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3">
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : isRunningStep ? (
                        <RefreshCw className="w-4 h-4 text-emerald-400 shrink-0 animate-spin" />
                      ) : (
                        <Clock className="w-4 h-4 text-slate-600 shrink-0" />
                      )}

                      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
                        <span className="text-xs font-medium text-slate-200">
                          {step.step_number}. {step.name}
                        </span>
                        <span className="text-[11px] text-slate-400 hidden sm:inline">
                          {step.reasoning.slice(0, 75)}...
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[10px] font-mono text-slate-400 tabular-nums">
                        {step.duration_ms}ms · Conf: {(step.confidence * 100).toFixed(0)}%
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-3.5 pb-3 pt-1 border-t border-neutral-800/60 text-xs">
                      <div className="mb-2">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Agent Reasoning:</span>
                        <p className="text-slate-300 mt-0.5 leading-relaxed font-sans">{step.reasoning}</p>
                      </div>

                      <div className="bg-[#0a0d14] border border-neutral-800/80 rounded p-2 font-mono text-[11px]">
                        <div className="flex items-center justify-between text-emerald-400 mb-1">
                          <span className="font-semibold">{step.tool_name}()</span>
                          <span className="text-[10px] uppercase px-1 rounded text-emerald-400 bg-emerald-950/40">
                            SANDBOX VERIFIED
                          </span>
                        </div>
                        <div className="text-slate-400 text-[10px] grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
                          <div>
                            <span className="text-slate-500">Args: </span>
                            {step.tool_args}
                          </div>
                          <div>
                            <span className="text-slate-500">Result: </span>
                            {step.tool_result}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* DELIVERABLE TABS CONTAINER */}
        <div className="mb-4 flex items-center justify-between border-b border-neutral-800 pb-2">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('memo')}
              className={`px-3 py-1.5 text-xs rounded transition-colors whitespace-nowrap ${
                activeTab === 'memo'
                  ? 'bg-[#18202f] text-emerald-400 font-semibold border border-neutral-700/80'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Executive Board Memo
            </button>
            <button
              onClick={() => setActiveTab('pnl')}
              className={`px-3 py-1.5 text-xs rounded transition-colors whitespace-nowrap ${
                activeTab === 'pnl'
                  ? 'bg-[#18202f] text-emerald-400 font-semibold border border-neutral-700/80'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              GAAP P&L & ASC 606 Waterfall
            </button>
            <button
              onClick={() => setActiveTab('variance')}
              className={`px-3 py-1.5 text-xs rounded transition-colors whitespace-nowrap ${
                activeTab === 'variance'
                  ? 'bg-[#18202f] text-emerald-400 font-semibold border border-neutral-700/80'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Variance Attribution ({initialVariances.length})
            </button>
            <button
              onClick={() => setActiveTab('exceptions')}
              className={`px-3 py-1.5 text-xs rounded transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'exceptions'
                  ? 'bg-[#18202f] text-emerald-400 font-semibold border border-neutral-700/80'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Exception Inbox</span>
              {exceptions.filter(e => !e.resolved).length > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-3 py-1.5 text-xs rounded transition-colors whitespace-nowrap ${
                activeTab === 'audit'
                  ? 'bg-[#18202f] text-emerald-400 font-semibold border border-neutral-700/80'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Immutable Audit Trail ({auditLogs.length})
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={handleCopyMemo}
              className="text-xs px-2.5 py-1 text-slate-300 bg-[#141923] border border-neutral-800 rounded hover:text-white transition-colors flex items-center gap-1"
            >
              {copiedMemo ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedMemo ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={() => setShowExportModal(true)}
              className="text-xs px-2.5 py-1 text-neutral-950 font-semibold bg-emerald-400 hover:bg-emerald-300 rounded transition-colors flex items-center gap-1"
            >
              <Download className="w-3 h-3" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* TAB CONTENT 1: EXECUTIVE BOARD MEMO */}
        {activeTab === 'memo' && (
          <div className="bg-[#0f131c] border border-neutral-800 rounded-lg p-6">
            <div className="bg-[#121622] border border-neutral-800 rounded-md p-4 text-xs font-mono text-slate-300 space-y-1 mb-5">
              <div><span className="text-slate-500">RECIPIENTS:</span> Board of Directors, CloudScale Technologies, Inc.</div>
              <div><span className="text-slate-500">AUTHOR:</span> FrogeClose Autonomous Financial Agent (Supervised by Controller)</div>
              <div><span className="text-slate-500">AUDIT STATUS:</span> GAAP Compliant · Debits = Credits Verified ($31.84M Footing)</div>
              <div><span className="text-slate-500">OUTCOME QUALITY:</span> {outcomeScore.toFixed(1)}/100 · Zero Unresolved Suspense Accounts</div>
            </div>

            <div className="whitespace-pre-wrap font-sans text-xs sm:text-sm text-slate-200 leading-relaxed">
              {boardMemoText}
            </div>

            <div className="mt-8 pt-4 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 font-mono gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Ledger Period Status: Closed & Cryptographically Sealed</span>
              </div>
              <div>SHA-256: 07123e1f...c7c9c1abc</div>
            </div>
          </div>
        )}

        {/* TAB CONTENT 2: GAAP STATEMENTS & ASC 606 WATERFALL */}
        {activeTab === 'pnl' && (
          <div className="space-y-6">
            <div className="bg-[#0f131c] border border-neutral-800 rounded-lg p-5">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-800">
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">GAAP Reconciled Income Statement</h3>
                  <div className="text-xs text-slate-400 mt-0.5">{period} · Currency: USD</div>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded">
                  Audit Tied Out
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono">
                  <thead>
                    <tr className="border-b border-neutral-800/80 text-slate-400 text-left">
                      <th className="py-2 font-medium">Line Item</th>
                      <th className="py-2 text-right font-medium">Q3 2026 Actual</th>
                      <th className="py-2 text-right font-medium">% of Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-900">
                    <tr className="font-semibold text-slate-200">
                      <td className="py-2.5">Revenue</td>
                      <td className="py-2.5 text-right tabular-nums"></td>
                      <td className="py-2.5 text-right tabular-nums"></td>
                    </tr>
                    <tr className="text-slate-300">
                      <td className="py-2 pl-4">Subscription ARR (Ratable ASC 606)</td>
                      <td className="py-2 text-right tabular-nums">$5,920,000</td>
                      <td className="py-2 text-right tabular-nums">95.5%</td>
                    </tr>
                    <tr className="text-slate-300">
                      <td className="py-2 pl-4">Usage & Telemetry Overages</td>
                      <td className="py-2 text-right tabular-nums">$280,000</td>
                      <td className="py-2 text-right tabular-nums">4.5%</td>
                    </tr>
                    <tr className="font-semibold text-white bg-[#141923]/40 border-t border-b border-neutral-800">
                      <td className="py-2.5">Total Net Revenue</td>
                      <td className="py-2.5 text-right tabular-nums text-emerald-400 font-bold">$6,200,000</td>
                      <td className="py-2.5 text-right tabular-nums font-bold">100.0%</td>
                    </tr>

                    <tr className="font-semibold text-slate-200 pt-2">
                      <td className="py-2.5">Cost of Goods Sold (COGS)</td>
                      <td className="py-2.5 text-right tabular-nums"></td>
                      <td className="py-2.5 text-right tabular-nums"></td>
                    </tr>
                    <tr className="text-slate-300">
                      <td className="py-2 pl-4">Hosting & GPU Infrastructure (AWS/CoreWeave)</td>
                      <td className="py-2 text-right tabular-nums">$742,000</td>
                      <td className="py-2 text-right tabular-nums">12.0%</td>
                    </tr>
                    <tr className="text-slate-300">
                      <td className="py-2 pl-4">Customer Support & Technical Operations</td>
                      <td className="py-2 text-right tabular-nums">$284,000</td>
                      <td className="py-2 text-right tabular-nums">4.6%</td>
                    </tr>
                    <tr className="text-slate-300">
                      <td className="py-2 pl-4">Payment Processing & Interchange Fees (Stripe)</td>
                      <td className="py-2 text-right tabular-nums">$128,000</td>
                      <td className="py-2 text-right tabular-nums">2.1%</td>
                    </tr>
                    <tr className="font-semibold text-white bg-[#141923]/40 border-t border-b border-neutral-800">
                      <td className="py-2.5">Gross Profit</td>
                      <td className="py-2.5 text-right tabular-nums text-emerald-400 font-bold">$5,046,000</td>
                      <td className="py-2.5 text-right tabular-nums font-bold">81.4%</td>
                    </tr>

                    <tr className="font-semibold text-slate-200">
                      <td className="py-2.5">Operating Expenses (OPEX)</td>
                      <td className="py-2.5 text-right tabular-nums"></td>
                      <td className="py-2.5 text-right tabular-nums"></td>
                    </tr>
                    <tr className="text-slate-300">
                      <td className="py-2 pl-4">Research & Development (R&D)</td>
                      <td className="py-2 text-right tabular-nums">$2,150,000</td>
                      <td className="py-2 text-right tabular-nums">34.7%</td>
                    </tr>
                    <tr className="text-slate-300">
                      <td className="py-2 pl-4">Sales & Marketing (S&M)</td>
                      <td className="py-2 text-right tabular-nums">$1,680,000</td>
                      <td className="py-2 text-right tabular-nums">27.1%</td>
                    </tr>
                    <tr className="text-slate-300">
                      <td className="py-2 pl-4">General & Administrative (G&A)</td>
                      <td className="py-2 text-right tabular-nums">$790,000</td>
                      <td className="py-2 text-right tabular-nums">12.7%</td>
                    </tr>
                    <tr className="font-semibold text-white bg-[#141923]/40 border-t border-b border-neutral-800">
                      <td className="py-2.5">Operating Income (EBIT)</td>
                      <td className="py-2.5 text-right tabular-nums text-emerald-400 font-bold">+$426,000</td>
                      <td className="py-2.5 text-right tabular-nums font-bold">6.9%</td>
                    </tr>
                    <tr className="font-bold text-white bg-[#16202e] border-t-2 border-emerald-500/40">
                      <td className="py-3">GAAP Net Income</td>
                      <td className="py-3 text-right tabular-nums text-emerald-300 text-sm font-bold">+$412,000</td>
                      <td className="py-3 text-right tabular-nums font-bold text-emerald-300">6.6%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* ASC 606 Waterfall Table */}
            <div className="bg-[#0f131c] border border-neutral-800 rounded-lg p-5">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-800">
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">ASC 606 Deferred Revenue Waterfall</h3>
                  <div className="text-xs text-slate-400 mt-0.5">Ratable SaaS amortization schedule & billings continuity</div>
                </div>
                <span className="text-[11px] font-mono text-slate-400">Ratable Rule Verified</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono">
                  <thead>
                    <tr className="border-b border-neutral-800/80 text-slate-400 text-left">
                      <th className="py-2 font-medium">Month</th>
                      <th className="py-2 text-right font-medium">Beginning Deferred</th>
                      <th className="py-2 text-right font-medium">+ New Billings</th>
                      <th className="py-2 text-right font-medium">- Recognized Rev</th>
                      <th className="py-2 text-right font-medium">= Ending Deferred</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-900">
                    <tr className="hover:bg-[#141923]/40 transition-colors">
                      <td className="py-2.5 font-medium text-slate-200">July 2026</td>
                      <td className="py-2.5 text-right tabular-nums text-slate-400">$8,450,000</td>
                      <td className="py-2.5 text-right tabular-nums text-emerald-400">+$2,180,000</td>
                      <td className="py-2.5 text-right tabular-nums text-cyan-400">-$2,040,000</td>
                      <td className="py-2.5 text-right tabular-nums text-white font-semibold">$8,590,000</td>
                    </tr>
                    <tr className="hover:bg-[#141923]/40 transition-colors">
                      <td className="py-2.5 font-medium text-slate-200">August 2026</td>
                      <td className="py-2.5 text-right tabular-nums text-slate-400">$8,590,000</td>
                      <td className="py-2.5 text-right tabular-nums text-emerald-400">+$2,340,000</td>
                      <td className="py-2.5 text-right tabular-nums text-cyan-400">-$2,060,000</td>
                      <td className="py-2.5 text-right tabular-nums text-white font-semibold">$8,870,000</td>
                    </tr>
                    <tr className="hover:bg-[#141923]/40 transition-colors">
                      <td className="py-2.5 font-medium text-slate-200">September 2026</td>
                      <td className="py-2.5 text-right tabular-nums text-slate-400">$8,870,000</td>
                      <td className="py-2.5 text-right tabular-nums text-emerald-400">+$2,490,000</td>
                      <td className="py-2.5 text-right tabular-nums text-cyan-400">-$2,100,000</td>
                      <td className="py-2.5 text-right tabular-nums text-white font-semibold">$9,260,000</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB CONTENT 3: VARIANCE ATTRIBUTION */}
        {activeTab === 'variance' && (
          <div className="bg-[#0f131c] border border-neutral-800 rounded-lg p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-neutral-800">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">Budget-to-Actuals Variance Analysis</h3>
                <div className="text-xs text-slate-400 mt-0.5">
                  Autonomous root-cause attribution on line items exceeding 10% or $25k threshold
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-neutral-800/80 text-slate-400 text-left">
                    <th className="py-2.5 font-medium">Account / Category</th>
                    <th className="py-2.5 text-right font-medium">Actual</th>
                    <th className="py-2.5 text-right font-medium">Budget</th>
                    <th className="py-2.5 text-right font-medium">Variance ($)</th>
                    <th className="py-2.5 text-right font-medium">Variance (%)</th>
                    <th className="py-2.5 pl-4 font-medium font-sans">Autonomous Root-Cause Attribution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900">
                  {initialVariances.map((item) => {
                    const isUnfavorable = (item.category === 'COGS' || item.category === 'S&M') 
                      ? item.variance_amount > 0 
                      : item.variance_amount < 0;

                    return (
                      <tr key={item.id} className="hover:bg-[#141923]/50 transition-colors">
                        <td className="py-3 font-medium text-slate-200">
                          <div>{item.account_name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            Acct #{item.account_code} · {item.category}
                          </div>
                        </td>
                        <td className="py-3 text-right tabular-nums text-slate-200">
                          ${item.actual_amount.toLocaleString()}
                        </td>
                        <td className="py-3 text-right tabular-nums text-slate-400">
                          ${item.budget_amount.toLocaleString()}
                        </td>
                        <td className={`py-3 text-right tabular-nums font-semibold ${
                          isUnfavorable ? 'text-amber-400' : 'text-emerald-400'
                        }`}>
                          {item.variance_amount > 0 ? `+$${item.variance_amount.toLocaleString()}` : `-$${Math.abs(item.variance_amount).toLocaleString()}`}
                        </td>
                        <td className={`py-3 text-right tabular-nums font-semibold flex items-center justify-end gap-0.5 ${
                          isUnfavorable ? 'text-amber-400' : 'text-emerald-400'
                        }`}>
                          {item.variance_pct > 0 ? (
                            <ArrowUpRight className="w-3 h-3 inline" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3 inline" />
                          )}
                          {item.variance_pct > 0 ? `+${item.variance_pct.toFixed(1)}%` : `${item.variance_pct.toFixed(1)}%`}
                        </td>
                        <td className="py-3 pl-4 font-sans text-slate-300 text-[11px] leading-relaxed max-w-md">
                          {item.ai_analysis}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB CONTENT 4: EXCEPTION INBOX (Human-in-the-Loop) */}
        {activeTab === 'exceptions' && (
          <div className="bg-[#0f131c] border border-neutral-800 rounded-lg p-5">
            <div className="pb-3 mb-4 border-b border-neutral-800">
              <h3 className="text-sm font-bold text-white tracking-tight">Controller Exception Review Inbox</h3>
              <div className="text-xs text-slate-400 mt-0.5">
                The agent automated 5,126 items. Only genuine anomalies are presented to the human controller.
              </div>
            </div>

            <div className="space-y-3">
              {exceptions.map((exc) => (
                <div
                  key={exc.id}
                  className={`p-4 rounded-md border text-xs ${
                    exc.resolved
                      ? 'bg-[#121622]/40 border-neutral-800 opacity-75'
                      : 'bg-amber-950/20 border-amber-900/60'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                        exc.resolved ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}>
                        {exc.resolved ? 'RESOLVED' : 'ACTION REQUIRED'}
                      </span>
                      <span className="font-semibold text-white">{exc.title}</span>
                      <span className="text-slate-500 font-mono">({exc.source})</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-slate-200 tabular-nums">
                        ${exc.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                      {!exc.resolved && (
                        <button
                          onClick={() => handleResolveException(exc.id)}
                          className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold rounded text-xs transition-colors"
                        >
                          Approve Suggested Action
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-slate-300 mb-2 leading-relaxed">
                    <strong className="text-slate-400">Detected Anomaly:</strong> {exc.detected_anomaly}
                  </p>

                  <div className="bg-[#0a0d14] border border-neutral-800 rounded p-2.5 font-mono text-[11px] text-slate-300">
                    <div className="text-emerald-400 font-semibold mb-0.5">Autonomous Suggested Resolution:</div>
                    {exc.suggested_action}
                  </div>

                  {exc.resolved && exc.resolution_note && (
                    <div className="mt-2 text-[11px] text-emerald-400 font-mono">
                      Resolution Signed Off: {exc.resolution_note}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB CONTENT 5: IMMUTABLE AUDIT TRAIL */}
        {activeTab === 'audit' && (
          <div className="bg-[#0f131c] border border-neutral-800 rounded-lg p-5">
            <div className="pb-3 mb-4 border-b border-neutral-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">Cryptographic Audit Trail (PwC / EY Ready)</h3>
                <div className="text-xs text-slate-400 mt-0.5">
                  Append-only immutable record of every tool invocation and invariant verification
                </div>
              </div>
              <div className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded">
                SHA-256 Chained
              </div>
            </div>

            <div className="space-y-2.5">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3 bg-[#121622] border border-neutral-800 rounded text-xs font-mono">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-slate-400 mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                        log.actor === 'agent' ? 'bg-emerald-950 text-emerald-400' : 'bg-cyan-950 text-cyan-400'
                      }`}>
                        {log.actor.toUpperCase()}
                      </span>
                      <span className="text-white font-semibold">{log.action}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">{log.timestamp}</span>
                  </div>
                  <p className="text-slate-300 text-[11px] font-sans my-1">{log.details}</p>
                  <div className="text-[10px] text-slate-500 truncate">
                    HASH: {log.hash}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* 3. MODAL: SYSTEM ARCHITECTURE & POSTGRES SCHEMA */}
      {showArchModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0f131c] border border-neutral-800 rounded-xl max-w-4xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowArchModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
              <Database className="w-5 h-5 text-emerald-400" />
              <span>FrogeClose System Architecture & Database Schema</span>
            </h2>
            <div className="text-xs text-slate-400 mb-4 font-mono">
              PostgreSQL 16 + pgvector + Row-Level Security (RLS) + Tool Sandboxing
            </div>

            <div className="space-y-4 text-xs font-mono text-slate-300">
              <div className="bg-[#141923] p-4 rounded-md border border-neutral-800">
                <div className="text-emerald-400 font-bold mb-2">// 1. MULTI-TENANT ROW-LEVEL SECURITY (RLS)</div>
                <pre className="text-slate-300 text-[11px] overflow-x-auto leading-relaxed">
{`-- Enforce strict tenant isolation on jobs, files, and audit logs
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_jobs ON jobs
    USING (org_id = current_setting('app.current_org_id')::uuid);`}
                </pre>
              </div>

              <div className="bg-[#141923] p-4 rounded-md border border-neutral-800">
                <div className="text-cyan-400 font-bold mb-2">// 2. PGVECTOR KNOWLEDGE BASE (ASC 606 & POLICIES)</div>
                <pre className="text-slate-300 text-[11px] overflow-x-auto leading-relaxed">
{`CREATE TABLE knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    embedding vector(1536) -- Company-specific accounting policies
);

CREATE INDEX ON knowledge_base USING ivfflat (embedding vector_cosine_ops);`}
                </pre>
              </div>

              <div className="bg-[#141923] p-4 rounded-md border border-neutral-800">
                <div className="text-amber-400 font-bold mb-2">// 3. MATHEMATICAL INVARIANT EXECUTION SANDBOX</div>
                <p className="font-sans text-slate-300 text-xs leading-relaxed mb-2">
                  Probabilistic LLMs are never allowed to fabricate accounting figures. Math computations, debits/credits sum verification, and ASC 606 ratable waterfall amortization run in an isolated deterministic execution sandbox.
                </p>
                <div className="text-[11px] text-emerald-400">
                  Golden Invariant: Debits - Credits == $0.00 across all 5,128 transactions.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL: YC & a16z PITCH MEMO */}
      {showPitchModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0f131c] border border-neutral-800 rounded-xl max-w-3xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowPitchModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <span>FrogeClose: YC & a16z Speedrun Pitch Memo</span>
            </h2>
            <div className="text-xs text-slate-400 mb-4 font-mono">
              The End of the Screen Time KPI in AI Applications
            </div>

            <div className="prose prose-invert prose-xs text-slate-200 leading-relaxed space-y-4 font-sans text-xs">
              <div className="bg-[#121622] p-4 rounded-md border border-neutral-800 text-xs font-mono">
                <div><strong>Company:</strong> FrogeClose (FrogeClose.com)</div>
                <div><strong>Founders:</strong> Elite Product Engineer & AI Architect</div>
                <div><strong>Business Model:</strong> 100% Outcome-Based ($1,250/month close vs $18k/mo CFO)</div>
                <div><strong>Gross Margin:</strong> 99.8% (Cost to close is ~$2.50 in compute)</div>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-1">1. The Shift: Zero Screen Time</h4>
                <p>
                  For 15 years, SaaS valued screen time. NetSuite and QuickBooks charged more when finance teams spent 80 hours a month clicking buttons. FrogeClose kills that metric. Finance leaders describe the close once; the agent executes, self-critiques, and returns finished deliverables.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-1">2. Target Customer & Wedge</h4>
                <p>
                  Mid-market SaaS ($5M–$100M ARR). Too big for automated basic bookkeeping, too small for a 15-person accounting department. The month-end close is our wedge to own the financial system of truth.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-1">3. The Moat</h4>
                <p>
                  Proprietary company accounting memory stored in pgvector. Once FrogeClose learns how you recognize multi-year enterprise contracts and amortize CAC under ASC 606, switching costs are astronomical.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL: EXPORT DELIVERABLES */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#0f131c] border border-neutral-800 rounded-xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowExportModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-2">Export Close Deliverables</h3>
            <p className="text-xs text-slate-400 mb-4">
              Download certified deliverables for {period} for distribution to the Board and external auditors.
            </p>

            <div className="space-y-2">
              <button
                onClick={() => {
                  const blob = new Blob([boardMemoText], { type: 'text/markdown' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `FrogeClose_Board_Memo_${period.replace(' ', '_')}.md`;
                  a.click();
                  setShowExportModal(false);
                }}
                className="w-full p-3 bg-[#141923] hover:bg-[#1a2230] border border-neutral-800 rounded flex items-center justify-between text-xs text-slate-200 transition-colors"
              >
                <span>Download Executive Board Memo (.md)</span>
                <Download className="w-4 h-4 text-emerald-400" />
              </button>

              <button
                onClick={() => {
                  window.print();
                  setShowExportModal(false);
                }}
                className="w-full p-3 bg-[#141923] hover:bg-[#1a2230] border border-neutral-800 rounded flex items-center justify-between text-xs text-slate-200 transition-colors"
              >
                <span>Print / Save as PDF Deck</span>
                <Download className="w-4 h-4 text-cyan-400" />
              </button>

              <button
                onClick={() => {
                  const payload = {
                    organization: 'CloudScale Technologies, Inc.',
                    period,
                    outcome_score: outcomeScore,
                    arr: 24800000,
                    net_revenue: 6200000,
                    invariants_verified: 14,
                    hash: '07123e1f482356c415f684407a3b8723e10b2cbbc0b8fcd6282c49d37c9c1abc',
                  };
                  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `FrogeClose_Audit_Payload_${period.replace(' ', '_')}.json`;
                  a.click();
                  setShowExportModal(false);
                }}
                className="w-full p-3 bg-[#141923] hover:bg-[#1a2230] border border-neutral-800 rounded flex items-center justify-between text-xs text-slate-200 transition-colors"
              >
                <span>Export Audit JSON & ERP Ledger Sync</span>
                <Download className="w-4 h-4 text-amber-400" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="border-t border-neutral-800/80 bg-[#0c0f16] px-6 py-4 text-xs text-slate-400 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">FrogeClose.com</span>
            <span>·</span>
            <span>The End of the Screen Time KPI in Finance</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span className="text-emerald-400">100% Outcome Guarantee</span>
            <span>Debits $\equiv$ Credits Checked</span>
            <span>Tenant RLS Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
