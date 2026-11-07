import React, { useEffect, useRef, useState } from 'react';
import {
  Activity, AlertCircle, AlertTriangle, ArrowDownToLine, ArrowLeft, Home,
  ArrowRight, ArrowUpRight, Check, CheckCheck, CheckCircle2,
  ChevronDown, ChevronRight, ClipboardList, Clock3, Code2, Copy,
  FileCode2, Filter, Fingerprint, History, Info, LockKeyhole, Menu,
  Play, RotateCcw, ScanSearch, Shield, ShieldAlert, ShieldCheck,
  ShieldOff, Sparkles, Upload, UserRound, X, Zap,
} from 'lucide-react';
import { DEFAULT_SAMPLE, SAMPLES } from './data/samples.js';
import Landing from './Landing.jsx';
import { ACTION_LABELS, calculateScore, canRecordDecision, scanCode, SEVERITIES, STATUS_LABELS } from './lib/scanner.js';

// Reuse previous local demo data when the user upgrades from Credosis.
const STORAGE_KEY = 'vulnera-security-demo-v1';
const LEGACY_KEY = 'credosis-security-demo-v1';
const INITIAL_FINDINGS = scanCode(DEFAULT_SAMPLE.code);
function freshState() {
  return {
    code: DEFAULT_SAMPLE.code,
    scannedCode: DEFAULT_SAMPLE.code,
    fileName: DEFAULT_SAMPLE.fileName,
    language: DEFAULT_SAMPLE.language,
    sampleId: DEFAULT_SAMPLE.id,
    findings: INITIAL_FINDINGS,
    scanMeta: { id: 'DEMO-001', at: new Date().toISOString() },
    log: [],
  };
}
function loadState() {
  if (typeof window === 'undefined') return freshState();
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY) || window.localStorage.getItem(LEGACY_KEY);
    const saved = stored ? JSON.parse(stored) : null;
    if (saved && typeof saved.code === 'string' && typeof saved.scannedCode === 'string' && Array.isArray(saved.findings) && Array.isArray(saved.log)) {
      return { ...freshState(), ...saved };
    }
  } catch { /* private-browsing storage might be unavailable */ }
  return freshState();
}
const INITIAL = loadState();
const cx = (...classes) => classes.filter(Boolean).join(' ');

const SEVERITY_STYLES = {
  Critical: { badge: 'severity-critical', dot: 'bg-[#B93D4D]' },
  High: { badge: 'severity-high', dot: 'bg-[#C86A42]' },
  Medium: { badge: 'severity-medium', dot: 'bg-[#B18B3C]' },
  Low: { badge: 'severity-low', dot: 'bg-[#188367]' },
};

function SeverityBadge({ severity }) {
  const style = SEVERITY_STYLES[severity] || SEVERITY_STYLES.Low;
  return <span className={cx('severity-badge', style.badge)}><span className={cx('h-1.5 w-1.5 rounded-full', style.dot)} />{severity}</span>;
}
function StatusBadge({ status }) {
  return status === 'open'
    ? <span className="flex items-center gap-1.5 text-[11px] font-medium text-[#7184A1]"><span className="h-1.5 w-1.5 rounded-full bg-[#1E65DF]" />Open</span>
    : <span className="flex items-center gap-1.5 text-[11px] font-medium text-[#168067]"><CheckCircle2 size={13} />{STATUS_LABELS[status] || 'Reviewed'}</span>;
}
function NavItem({ active, icon: Icon, children, onClick, count }) {
  return <button type="button" className={cx('sidebar-link group', active && 'is-active')} onClick={onClick}>
    <Icon size={17} strokeWidth={active ? 2.1 : 1.75} />
    <span className="flex-1 text-left">{children}</span>
    {count !== undefined && count > 0 && <span className="nav-count">{count}</span>}
  </button>;
}
function Brand({ compact = false }) {
  return <div className="flex items-center gap-3">
    <div className="brand-mark"><ShieldCheck size={22} strokeWidth={2.1}/></div>
    {!compact && <div className="leading-none"><div className="brand-wordmark">vulnera<span className="text-[#1B62DE]">.</span></div><div className="mt-1.5 text-[9px] font-semibold uppercase tracking-[.19em] text-[#91A5C0]">Security workspace</div></div>}
  </div>;
}
function Sidebar({ page, setPage, role, setRole, logCount, mobileOpen, setMobileOpen }) {
  const navigate = (name) => { setPage(name); setMobileOpen(false); };
  return <>
    {mobileOpen && <button type="button" className="fixed inset-0 z-40 bg-[#132747]/40 lg:hidden" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
    <aside className={cx('sidebar fixed inset-y-0 left-0 z-50 flex w-[258px] flex-col transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0', mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full')}>
      <div className="flex h-[91px] shrink-0 items-center justify-between border-b border-[#F0F5FE] px-7">
        <Brand />
        <button type="button" className="p-2 text-[#556A8A] lg:hidden" aria-label="Close navigation" onClick={() => setMobileOpen(false)}><X size={18} /></button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-8">
        <nav className="mb-8"><NavItem icon={Home} active={false} onClick={() => navigate('home')}>Back to homepage</NavItem></nav>
        <div className="sidebar-eyebrow">WORKSPACE</div>
        <nav className="mt-3 space-y-1">
          <NavItem icon={Code2} active={page === 'workspace'} onClick={() => navigate('workspace')}>Security review</NavItem>
          <NavItem icon={History} count={logCount} active={page === 'log'} onClick={() => navigate('log')}>Decision history</NavItem>
        </nav>
      </div>
      <div className="border-t border-[#F0F5FE] px-5 pb-6 pt-5">
        <label htmlFor="review-role" className="mb-2 block px-2 text-[10px] font-semibold uppercase tracking-[.14em] text-[#91A5C0]">Demo reviewer role</label>
        <div className="relative flex items-center rounded-xl border border-[#E7EFFC] bg-white px-3 py-2.5">
          <span className="mr-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-[#F0F5FE] text-[#354B70]"><UserRound size={16}/></span>
          <select id="review-role" aria-label="Simulated reviewer role" className="w-full appearance-none bg-transparent pr-5 text-[12px] font-semibold text-[#1D3358] outline-none" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="reviewer">Reviewer</option>
            <option value="senior">Senior reviewer</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 text-[#7184A1]" size={14}/>
        </div>
        <p className="mt-2 px-2 text-[10px] leading-relaxed text-[#91A5C0]">Simulated role · Not authentication</p>
      </div>
    </aside>
  </>;
}
function Topbar({ page, setMobileOpen }) {
  return <header className="topbar flex h-[76px] items-center justify-between gap-4 px-5 sm:px-8 xl:px-10">
    <div className="flex min-w-0 items-center gap-2.5 text-[12px]">
      <button type="button" className="mr-1 rounded-lg p-2 hover:bg-[#F0F5FE] lg:hidden" aria-label="Open navigation" onClick={() => setMobileOpen(true)}><Menu size={20}/></button>
      <span className="font-medium text-[#7184A1]">Workspace</span><ChevronRight size={13} className="text-[#B9CCE6]"/>
      <span className="truncate font-semibold text-[#1D3358]">{page === 'log' ? 'Decision history' : 'Security review'}</span>
    </div>
    <div className="flex shrink-0 items-center gap-3 sm:gap-5">
      <div className="hidden items-center gap-2 rounded-full border border-[#D7EBE1] bg-[#F0FAF6] px-3 py-1.5 text-[10.5px] font-semibold text-[#188367] sm:flex"><span className="live-dot"/>Local engine online</div>
      <div className="h-6 w-px bg-[#E7EFFC]"/>
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E4EEFD] text-[11px] font-bold text-[#354B70]" title="Demo reviewer">VR</div>
    </div>
  </header>;
}
function Metric({ icon: Icon, label, number, note, tone = 'neutral' }) {
  return <div className="metric-card group">
    <div className="mb-4 flex items-center justify-between"><span className="text-[11.5px] font-medium text-[#556A8A]">{label}</span><Icon size={17} strokeWidth={1.7} className={cx(tone === 'rust' ? 'text-[#1B62DE]' : tone === 'green' ? 'text-[#20836C]' : 'text-[#7184A1]')} /></div>
    <div className="flex items-baseline gap-1"><span className="font-serif text-[36px] leading-none tracking-tight text-[#132747]">{number}</span>{label === 'Security posture' && <span className="text-[12px] text-[#91A5C0]">/ 100</span>}</div>
    <p className="mt-2 text-[10.5px] text-[#91A5C0]">{note}</p>
  </div>;
}
function WorkspaceHeader({ scanMeta }) {
  return <div className="mb-7 flex flex-wrap items-end justify-between gap-5">
    <div>
      <div className="eyebrow mb-3"><span className="h-[5px] w-[5px] rounded-full bg-[#1D62DC]"/>REVIEW WORKSPACE</div>
      <h1 className="font-serif text-[35px] leading-[1.13] tracking-[-.045em] text-[#132747] sm:text-[45px]">Security review</h1>
      <p className="mt-3 max-w-xl text-[13px] leading-relaxed text-[#7184A1]">Your code, findings, and decisions in one place.</p>
    </div>
    <div className="flex items-center gap-2 rounded-full border border-[#E7EFFC] bg-[#FFFFFF] px-3 py-2 text-[10.5px] font-medium text-[#7184A1]"><Clock3 size={13} />Last scan <span className="font-semibold text-[#354B70]">{new Date(scanMeta.at).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span></div>
  </div>;
}
const KEYWORDS = /^(const|let|var|import|from|export|return|async|await|function|class|new|if|else|def|True|False|None|try|catch|throw|raise|in|as|pass)$/;
function tokenizedLine(line) {
  const chunks = line.split(/("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b(?:const|let|var|import|from|export|return|async|await|function|class|new|if|else|def|True|False|None|try|catch|throw|raise|in|as|pass)\b|\b\d+(?:\.\d+)?\b|\/\/.*$|#.*$)/g);
  return chunks.map((chunk, i) => {
    if (!chunk) return null;
    let klass = '';
    if (/^(["'`])/.test(chunk)) klass = 'syntax-string';
    else if (KEYWORDS.test(chunk)) klass = 'syntax-keyword';
    else if (/^\d/.test(chunk)) klass = 'syntax-number';
    else if (/^(\/\/|#)/.test(chunk)) klass = 'syntax-comment';
    return klass ? <span key={i} className={klass}>{chunk}</span> : <React.Fragment key={i}>{chunk}</React.Fragment>;
  });
}
function CodePanel({ code, scannedCode, onCodeChange, fileName, language, sampleId, onLoadSample, onUpload, onScan, scanning, dirty, findings, selected, codeMode, setCodeMode, onCopyCode, fileInputRef, codeViewerRef }) {
  const lines = scannedCode.split(/\r?\n/);
  const editableLines = code.split(/\r?\n/);
  const gutterRef = useRef(null);
  const flagged = new Set(findings.map((item) => item.line));
  return <section className="panel overflow-hidden">
    <div className="flex flex-wrap items-center justify-between gap-3 px-5 pb-4 pt-5 sm:px-6">
      <div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-[#F8FBFF] text-[#556A8A]"><Code2 size={18}/></span><div><h2 className="panel-title">Source code</h2><p className="panel-subtitle">A closer look, line by line</p></div></div>
      <div className="segmented">
        <button type="button" className={cx(codeMode === 'editor' && 'selected')} onClick={() => setCodeMode('editor')}>Editor</button>
        <button type="button" className={cx(codeMode === 'reviewed' && 'selected')} onClick={() => setCodeMode('reviewed')}>Reviewed</button>
      </div>
    </div>
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#F8FBFF] px-5 py-3 sm:px-6">
      <div className="flex min-w-0 items-center gap-2.5"><FileCode2 size={15} className="shrink-0 text-[#7184A1]"/><span className="truncate font-mono text-[10.5px] text-[#354B70]">{fileName}</span><span className="rounded-md bg-[#F8FBFF] px-2 py-1 text-[9px] font-semibold text-[#7184A1]">{language}</span></div>
      <div className="flex items-center gap-2"><button type="button" title="Copy code" aria-label="Copy code" onClick={onCopyCode} className="icon-button"><Copy size={14}/></button><select aria-label="Load a sample" className="mini-select max-w-[165px]" value={sampleId} onChange={(e) => onLoadSample(e.target.value)}><option value="custom">Custom / uploaded</option>{SAMPLES.map((sample) => <option key={sample.id} value={sample.id}>{sample.name}</option>)}</select></div>
    </div>
    <div className="relative bg-[#17243E]">
      <div className="flex h-[29px] items-center justify-between border-b border-white/10 px-5"><div className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[#5C9DF2]"/><span className="h-1.5 w-1.5 rounded-full bg-[#8EAEEC]"/><span className="h-1.5 w-1.5 rounded-full bg-[#74B7A1]"/></div><span className="font-mono text-[9px] text-[#91A5C0]">{codeMode === 'reviewed' ? 'read only · annotations on' : 'editable · unsaved until scan'}</span></div>
      {codeMode === 'reviewed' ? <div ref={codeViewerRef} className="code-scroll scroll-slim h-[400px] overflow-auto py-3 font-mono text-[#EDF4FF]" role="region" aria-label="Source code with security highlights">
        {lines.map((line, index) => <div key={index} data-code-line={index + 1} className={cx('code-line', selected?.line === index + 1 && 'active', flagged.has(index + 1) && 'problem')}><span className="code-line-number">{index + 1}</span><span className="inline-block min-w-0">{tokenizedLine(line)}{line.length === 0 ? ' ' : null}</span>{flagged.has(index + 1) && <span className="flag-indicator">issue</span>}</div>)}
      </div> : <div className="flex h-[400px] overflow-hidden py-3 font-mono"><div ref={gutterRef} aria-hidden="true" className="scroll-slim w-[53px] shrink-0 select-none overflow-hidden border-r border-white/10 pr-3 text-right text-[11.5px] leading-[25px] text-[#556A8A]">{editableLines.map((_, index) => <div key={index}>{index + 1}</div>)}</div><textarea spellCheck="false" aria-label="Editable source code" className="code-textarea scroll-slim min-w-0 flex-1 bg-transparent px-4" value={code} onChange={(e) => onCodeChange(e.target.value)} onScroll={(e) => { if (gutterRef.current) gutterRef.current.scrollTop = e.target.scrollTop; }}/></div>}
      {scanning && <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#17243E]/95 text-[#F5F8FF]"><ScanSearch size={29} className="mb-4 animate-pulse text-[#1E65DF]"/><div className="text-[13px] font-semibold">Looking for security patterns…</div><div className="mt-4 h-1 w-40 overflow-hidden rounded-full bg-[#354B70]"><div className="scan-shimmer h-full w-full"/></div><span className="mt-3 text-[10px] text-[#91A5C0]">Local rule-based scan</span></div>}
    </div>
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F0F5FE] px-5 py-3 sm:px-6">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10.5px] text-[#7184A1]"><span>{codeMode === 'editor' ? editableLines.length : lines.length} lines</span><span>{codeMode === 'editor' ? code.length : scannedCode.length} characters</span></div>
      <div className={cx('flex items-center gap-1.5 text-[10.5px] font-medium', dirty ? 'text-[#1D60D9]' : 'text-[#20866B]')}><span className={cx('h-1.5 w-1.5 rounded-full', dirty ? 'bg-[#1B62DE]' : 'bg-[#279D7C]')}/>{dirty ? 'Changes not scanned' : 'Scan up to date'}</div>
    </div>
    <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:px-6 sm:py-4">
      <div className="flex items-center gap-2.5"><input type="file" ref={fileInputRef} accept=".js,.jsx,.ts,.tsx,.mjs,.cjs,.py,.json,.txt,.html,.css,.sql,.go,.java,.php,.rb,.vue,.svelte" className="hidden" onChange={onUpload}/><button type="button" className="secondary-button" onClick={() => fileInputRef.current?.click()}><Upload size={14}/>Upload file</button><span className="hidden text-[10px] text-[#91A5C0] sm:inline">Up to 512 KB</span></div>
      <button type="button" className="primary-button" disabled={scanning || !code.trim()} onClick={onScan}><Play size={12} fill="currentColor"/>{scanning ? 'Scanning…' : 'Run security scan'}<ArrowRight size={15}/></button>
    </div>
  </section>;
}
function FindingItem({ finding, selected, onSelect }) {
  return <button type="button" aria-pressed={selected} onClick={() => onSelect(finding.id)} className={cx('finding-item group w-full text-left', selected && 'is-selected', finding.status !== 'open' && 'is-reviewed')}>
    <div className="flex items-center justify-between gap-2"><div className="flex items-center gap-2"><SeverityBadge severity={finding.severity}/><span className="font-mono text-[10px] text-[#91A5C0]">{finding.cwe}</span></div><ChevronRight size={15} className={cx('text-[#91A5C0] transition-transform group-hover:translate-x-0.5', selected && 'text-[#1B62DE]')}/></div>
    <div className="mt-3 flex items-center justify-between gap-2"><h3 className="text-[12.5px] font-semibold leading-snug text-[#1D3358]">{finding.title}</h3>{finding.status !== 'open' && <CheckCircle2 size={15} className="shrink-0 text-[#18806C]"/>}</div>
    <div className="mt-2.5 flex items-center justify-between"><span className="font-mono text-[10.5px] text-[#7184A1]">Line {finding.line}</span><span className="text-[10px] font-medium text-[#91A5C0]">{finding.confidence}% confidence</span></div>
  </button>;
}
function FindingsPanel({ findings, selectedId, onSelect, filter, setFilter, severityFilter, setSeverityFilter }) {
  const shown = findings.filter((f) => (filter === 'all' || (filter === 'open' ? f.status === 'open' : f.status !== 'open')) && (severityFilter === 'all' || f.severity === severityFilter));
  const openCount = findings.filter((f) => f.status === 'open').length;
  return <section className="panel overflow-hidden">
    <div className="flex items-center justify-between gap-3 px-5 pb-4 pt-5 sm:px-6"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-[#E8F1FF] text-[#1B62DE]"><ShieldAlert size={18}/></span><div><h2 className="panel-title">Findings</h2><p className="panel-subtitle">{findings.length} potential issue{findings.length === 1 ? '' : 's'} detected</p></div></div><span className="rounded-full bg-[#F8FBFF] px-2.5 py-1.5 text-[10px] font-semibold text-[#556A8A]">{openCount} open</span></div>
    <div className="flex flex-wrap items-center justify-between gap-2 border-y border-[#F8FBFF] px-4 py-3 sm:px-5"><div className="segmented">{[['all','All'],['open','Open'],['reviewed','Reviewed']].map(([value,label]) => <button type="button" key={value} onClick={() => setFilter(value)} className={cx(filter === value && 'selected')}>{label}</button>)}</div><div className="relative"><Filter size={12} className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[#7184A1]"/><select aria-label="Filter findings by severity" className="mini-select max-w-[152px] pl-7" value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}><option value="all">All severities</option>{SEVERITIES.map((item) => <option key={item} value={item}>{item}</option>)}</select></div></div>
    <div className="scroll-slim h-[393px] space-y-2.5 overflow-y-auto p-3.5 sm:p-4">
      {shown.length ? shown.map((item) => <FindingItem key={item.id} finding={item} selected={selectedId === item.id} onSelect={onSelect}/>) : <div className="flex h-full flex-col items-center justify-center px-5 text-center"><span className="mb-3 rounded-full bg-[#EAF8F0] p-3 text-[#178468]"><CheckCheck size={23}/></span><p className="text-[13px] font-semibold text-[#1D3358]">Nothing here yet</p><p className="mt-1.5 max-w-xs text-[11px] leading-relaxed text-[#7184A1]">Try another filter or scan a different sample.</p></div>}
    </div>
  </section>;
}
const ACTIONS = [
  { id: 'fixed', label: 'Mark fixed', icon: CheckCircle2 },
  { id: 'false_positive', label: 'False positive', icon: ShieldOff },
  { id: 'accepted_risk', label: 'Accept risk', icon: Fingerprint },
];
function DecisionPanel({ selected, role, action, setAction, reason, setReason, formError, onSubmit }) {
  const restricted = selected?.severity === 'Critical' && ['false_positive','accepted_risk'].includes(action) && role !== 'senior';
  return <section className="panel overflow-hidden">
    <div className="flex items-center justify-between gap-2 border-b border-[#F8FBFF] px-5 py-4 sm:px-6"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-[#E8F2FD] text-[#556A8A]"><ClipboardList size={17}/></span><div><h2 className="panel-title">Make a decision</h2><p className="panel-subtitle">Human review, always</p></div></div><span className="flex items-center gap-1.5 rounded-full bg-[#F8FBFF] px-2.5 py-1.5 text-[9.5px] font-semibold text-[#556A8A]"><LockKeyhole size={11}/>Human only</span></div>
    {selected ? <form onSubmit={(event) => { event.preventDefault(); onSubmit(); }} className="p-5 sm:p-6">
      <div className="rounded-xl border border-[#F0F5FE] bg-[#FFFFFF] p-4"><div className="mb-2 flex items-center justify-between gap-2"><span className="text-[10px] font-semibold uppercase tracking-[.1em] text-[#7184A1]">Selected issue</span><StatusBadge status={selected.status}/></div><h3 className="text-[13px] font-semibold leading-snug text-[#1D3358]">{selected.title}</h3><p className="mt-2 text-[11.5px] leading-[1.7] text-[#556A8A]">{selected.description}</p><div className="mt-3 flex gap-2.5 rounded-lg border border-[#F0F5FE] bg-white px-3 py-3"><Zap size={15} className="mt-0.5 shrink-0 text-[#1B62DE]"/><p className="text-[11px] leading-[1.65] text-[#556A8A]"><strong className="font-semibold text-[#354B70]">Suggested fix. </strong>{selected.recommendation}</p></div></div>
      <label className="mb-2.5 mt-5 block text-[11.5px] font-semibold text-[#354B70]">Choose an outcome</label>
      <div className="grid grid-cols-3 gap-2">{ACTIONS.map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => setAction(id)} className={cx('decision-choice', action === id && 'is-active')}><Icon size={17} strokeWidth={1.8}/><span>{label}</span></button>)}</div>
      {restricted && <div className="mt-3 flex items-start gap-2 rounded-lg border border-[#F5D5D9] bg-[#FFF5F6] px-3 py-3 text-[10.5px] leading-relaxed text-[#1B62DE]"><LockKeyhole size={14} className="mt-0.5 shrink-0"/><span>Critical findings need a senior reviewer to dismiss or accept. Switch the simulated role in the sidebar.</span></div>}
      <div className="mb-2 mt-5 flex items-center justify-between"><label htmlFor="decision-reason" className="text-[11.5px] font-semibold text-[#354B70]">Reason for your decision <span className="text-[#B9474D]">*</span></label><span className="text-[10px] text-[#91A5C0]">Required</span></div>
      <textarea id="decision-reason" rows={2} maxLength={1200} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Write a short, clear rationale..." className="reason-input"/>
      {formError && <p className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-[#BC4753]"><AlertCircle size={13}/>{formError}</p>}
      <button disabled={restricted} type="submit" className="primary-button mt-3 w-full justify-center"><Check size={15}/>Record decision<ArrowRight size={15}/></button>
    </form> : <div className="px-6 py-12 text-center"><Shield size={27} className="mx-auto text-[#B9CCE6]"/><p className="mt-3 text-[13px] font-semibold text-[#556A8A]">No issue selected</p><p className="mt-1.5 text-[11px] leading-relaxed text-[#7184A1]">Choose a finding to see its details and decide what happens next.</p></div>}
  </section>;
}
function ActivityPanel({ log, onOpenLog }) {
  return <section className="panel mt-5 px-5 py-5 sm:px-6"><div className="mb-3 flex items-center justify-between gap-3"><div className="flex items-center gap-2.5"><History size={16} className="text-[#1B62DE]"/><h2 className="text-[12px] font-semibold text-[#354B70]">Recent activity</h2></div><button type="button" className="text-link" onClick={onOpenLog}>View history <ArrowUpRight size={13}/></button></div>
    {log.length ? <div className="divide-y divide-[#F8FBFF]">{log.slice(0,3).map((entry) => <div key={entry.id} className="flex flex-wrap items-center gap-2 py-3 text-[11px]"><CheckCircle2 size={14} className="text-[#1F8A69]"/><span className="max-w-[250px] truncate font-medium text-[#354B70]">{entry.title}</span><span className="text-[#91A5C0]">·</span><span className="text-[#7184A1]">{ACTION_LABELS[entry.action]}</span><span className="ml-auto text-[10px] text-[#91A5C0]">{new Date(entry.at).toLocaleTimeString([], { hour:'2-digit',minute:'2-digit' })}</span></div>)}</div> : <div className="flex items-start gap-3 rounded-lg bg-[#FFFFFF] px-3 py-4"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F0F5FE] text-[#1B62DE]"><Clock3 size={16}/></span><p className="text-[11.5px] leading-[1.7] text-[#7184A1]">Your review activity will appear here after you record your first decision.</p></div>}
  </section>;
}
function Workspace(props) {
  const total = props.findings.length;
  const open = props.findings.filter((f) => f.status === 'open').length;
  const reviewed = total - open;
  const priority = props.findings.filter((f) => f.status === 'open' && ['Critical','High'].includes(f.severity)).length;
  const score = calculateScore(props.findings);
  return <div className="fade-up">
    <WorkspaceHeader scanMeta={props.scanMeta}/>
    <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
      <Metric icon={ShieldCheck} label="Security posture" number={score} note="Illustrative score"/>
      <Metric icon={ScanSearch} label="Total findings" number={String(total).padStart(2,'0')} note="Patterns identified"/>
      <Metric icon={AlertTriangle} label="Needs attention" number={String(priority).padStart(2,'0')} note="Open critical + high" tone="rust"/>
      <Metric icon={CheckCircle2} label="Reviewed" number={String(reviewed).padStart(2,'0')} note={`${open} awaiting a decision`} tone="green"/>
    </div>
    <div className="mb-6 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#DFEAFE] bg-[#F0F6FF] px-4 py-3 text-[11px] text-[#5C708F]"><span className="flex items-center gap-2"><Info size={15} className="text-[#1B62DE]"/>Local pattern checks can miss vulnerabilities; findings need human review.</span><span className="font-semibold text-[#1B62DE]">{props.dirty ? 'Code changed · Rescan required' : 'Rule-based · No AI'}</span></div>
    <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1.18fr)_minmax(365px,.82fr)]">
      <div className="min-w-0"><CodePanel {...props}/><ActivityPanel log={props.log} onOpenLog={props.onOpenLog}/></div>
      <div className="min-w-0 space-y-5"><FindingsPanel {...props}/><DecisionPanel {...props}/></div>
    </div>
    <Footer/>
  </div>;
}
function Footer() {
  return <footer className="mt-9 flex flex-wrap items-center justify-between gap-3 border-t border-[#F0F5FE] pt-5 text-[10px] text-[#91A5C0]"><span>Vulnera © 2026 · Frontend demonstration</span><span>Private to your browser · Human decisions · Local audit trail</span></footer>;
}
function PageHeader({ eyebrow, title, description, children }) {
  return <div className="mb-7 flex flex-wrap items-end justify-between gap-5"><div><div className="eyebrow mb-3">{eyebrow}</div><h1 className="font-serif text-[38px] leading-tight tracking-[-.035em] text-[#132747] sm:text-[46px]">{title}</h1><p className="mt-2 text-[12px] leading-relaxed text-[#7184A1]">{description}</p></div>{children}</div>;
}
function AuditLog({ log, onExport, onBack, onReset }) {
  return <div className="fade-up"><PageHeader eyebrow="GOVERNANCE / TRACEABILITY" title="Decision history." description="A clear record of what you reviewed, when, and why."><div className="flex flex-wrap gap-2"><button type="button" className="secondary-button" onClick={onBack}><ArrowLeft size={14}/>Workspace</button><button type="button" disabled={!log.length} className="primary-button" onClick={onExport}><ArrowDownToLine size={14}/>Export CSV</button></div></PageHeader>
    <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3"><Metric icon={ClipboardList} label="Recorded decisions" number={log.length} note="Stored in your browser"/><Metric icon={AlertTriangle} label="Critical reviews" number={log.filter((x) => x.severity === 'Critical').length} note="With simulated sign-off" tone="rust"/><Metric icon={Fingerprint} label="Senior decisions" number={log.filter((x) => x.role === 'senior').length} note="Simulated role only" tone="green"/></div>
    <section className="panel overflow-hidden"><div className="flex items-center justify-between border-b border-[#F0F5FE] px-6 py-5"><h2 className="panel-title">Review history</h2><span className="text-[10.5px] text-[#7184A1]">Newest first</span></div>
      {log.length ? <div className="divide-y divide-[#F0F5FE]">{log.map((entry) => <div key={entry.id} className="grid gap-3 px-6 py-5 sm:grid-cols-[146px_1fr_auto]"><div className="text-[10.5px] leading-relaxed text-[#7184A1]">{new Date(entry.at).toLocaleString([], { dateStyle: 'medium', timeStyle:'short' })}<div className="mt-1 font-mono text-[9.5px] text-[#91A5C0]">{entry.scanId}</div></div><div className="min-w-0"><div className="flex flex-wrap items-center gap-2.5"><span className="text-[13px] font-semibold text-[#1D3358]">{entry.title}</span><SeverityBadge severity={entry.severity}/></div><div className="mt-2 flex flex-wrap items-center gap-2 text-[10.5px] text-[#7184A1]"><span className="font-semibold text-[#1B62DE]">{ACTION_LABELS[entry.action]}</span><span>·</span><span>Line {entry.line}</span><span>·</span><span>{entry.role === 'senior' ? 'Senior reviewer' : 'Reviewer'} (demo)</span></div><p className="mt-3 rounded-lg bg-[#FFFFFF] px-3.5 py-3 text-[11.5px] leading-[1.65] text-[#556A8A]">“{entry.reason}”</p></div><span className="flex h-fit items-center gap-1.5 justify-self-start rounded-full bg-[#EAF8F0] px-2.5 py-1.5 text-[10px] font-semibold text-[#188367]"><CheckCircle2 size={12}/>Recorded</span></div>)}</div> : <div className="flex flex-col items-center px-5 py-20 text-center"><span className="rounded-2xl bg-[#F8FBFF] p-5 text-[#1B62DE]"><ClipboardList size={26}/></span><h3 className="mt-5 font-serif text-[23px] text-[#1D3358]">A fresh start.</h3><p className="mt-2 max-w-xs text-[12px] leading-relaxed text-[#7184A1]">Your decisions will appear here with reasons, timestamps, and simulated roles.</p><button type="button" className="text-link mt-5" onClick={onBack}>Review findings <ArrowRight size={14}/></button></div>}
    </section>
    {log.length > 0 && <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><p className="text-[10.5px] text-[#7184A1]">This local log is not tamper-proof or shared with a server.</p><button type="button" onClick={onReset} className="text-link text-[#7184A1]"><RotateCcw size={13}/>Clear demo decisions</button></div>}
    <Footer/>
  </div>;
}
function App() {
  const pageForPath = () => {
    const path = window.location.pathname.replace(/\/+$/, '') || '/';
    if (path === '/workspace/history') return 'log';
    if (path === '/workspace/guide') return 'workspace'; // Legacy guide links open the actual scanner.
    if (path === '/workspace') return 'workspace';
    return 'home';
  };
  const [page, setCurrentPage] = useState(pageForPath);
  function setPage(next) {
    const route = next === 'home' ? '/' : next === 'log' ? '/workspace/history' : '/workspace';
    if (window.location.pathname !== route) window.history.pushState({}, '', route);
    setCurrentPage(next);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior:'auto' });
  }
  const [mobileOpen, setMobileOpen] = useState(false);
  const [role, setRole] = useState('reviewer');
  const [code, setCode] = useState(INITIAL.code);
  const [scannedCode, setScannedCode] = useState(INITIAL.scannedCode);
  const [fileName, setFileName] = useState(INITIAL.fileName);
  const [language, setLanguage] = useState(INITIAL.language);
  const [sampleId, setSampleId] = useState(INITIAL.sampleId);
  const [findings, setFindings] = useState(INITIAL.findings);
  const [scanMeta, setScanMeta] = useState(INITIAL.scanMeta);
  const [log, setLog] = useState(INITIAL.log);
  const [selectedId, setSelectedId] = useState(INITIAL.findings[0]?.id || null);
  const [codeMode, setCodeMode] = useState('reviewed');
  const [filter, setFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [action, setAction] = useState('fixed');
  const [reason, setReason] = useState('');
  const [formError, setFormError] = useState('');
  const [scanning, setScanning] = useState(false);
  const [toast, setToast] = useState('');
  const fileInputRef = useRef(null);
  const codeViewerRef = useRef(null);
  const dirty = code !== scannedCode;
  const selected = findings.find((f) => f.id === selectedId) || null;

  useEffect(() => {
    function handlePopState() { setCurrentPage(pageForPath()); setMobileOpen(false); }
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ code, scannedCode, fileName, language, sampleId, findings, scanMeta, log })); } catch { /* optional */ }
  }, [code, scannedCode, fileName, language, sampleId, findings, scanMeta, log]);
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(''), 3500);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    if (codeMode !== 'reviewed' || !selected?.line || !codeViewerRef.current) return;
    const viewport = codeViewerRef.current;
    const line = viewport.querySelector(`[data-code-line="${selected.line}"]`);
    if (line) viewport.scrollTo({ top: Math.max(0, line.offsetTop - viewport.offsetTop - viewport.clientHeight / 2 + line.clientHeight / 2), behavior:'smooth' });
  }, [selectedId, codeMode, scanMeta.id]);
  function notify(message) { setToast(message); }
  function onSelect(id) { setSelectedId(id); setCodeMode('reviewed'); setAction('fixed'); setReason(''); setFormError(''); }
  function onCodeChange(value) { setCode(value); if (sampleId !== 'custom') setSampleId('custom'); }
  function onLoadSample(id) {
    const sample = SAMPLES.find((item) => item.id === id);
    if (!sample) return;
    setCode(sample.code); setFileName(sample.fileName); setLanguage(sample.language); setSampleId(sample.id); setCodeMode('editor'); setFormError('');
    notify(`${sample.name} loaded. Run a scan to refresh findings.`);
  }
  async function onUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 512 * 1024) { notify('File exceeds 512 KB. Please choose a smaller file.'); event.target.value = ''; return; }
    try {
      const contents = await file.text();
      if (!contents.trim()) { notify('The file is empty.'); event.target.value = ''; return; }
      const ext = file.name.split('.').pop()?.toLowerCase() || 'txt';
      const lang = ({ py:'Python', ts:'TypeScript', tsx:'TypeScript', js:'JavaScript', jsx:'JavaScript', json:'JSON', css:'CSS', html:'HTML', sql:'SQL', java:'Java', go:'Go', rb:'Ruby', php:'PHP', vue:'Vue', svelte:'Svelte' })[ext] || 'Text';
      setCode(contents); setFileName(file.name); setLanguage(lang); setSampleId('custom'); setCodeMode('editor');
      notify(`${file.name} loaded. Run a scan to analyze it.`);
    } catch { notify('Could not read that file. Try a text-based source file.'); }
    event.target.value = '';
  }
  function onScan() {
    if (!code.trim()) { notify('Paste or upload some code before scanning.'); return; }
    if (scanning) return;
    setScanning(true);
    setTimeout(() => {
      const next = scanCode(code);
      setFindings(next); setScannedCode(code); setSelectedId(next[0]?.id || null);
      setScanMeta({ id:`SCAN-${String(Date.now()).slice(-6)}`, at:new Date().toISOString() });
      setFilter('all'); setSeverityFilter('all'); setCodeMode('reviewed'); setAction('fixed'); setReason(''); setFormError(''); setScanning(false);
      notify(next.length ? `Scan complete — ${next.length} potential finding${next.length === 1 ? '' : 's'}.` : 'Scan complete — no patterns matched. This does not guarantee security.');
    }, 620);
  }
  async function onCopyCode() {
    try { await navigator.clipboard.writeText(codeMode === 'reviewed' ? scannedCode : code); notify('Code copied to clipboard.'); }
    catch { notify('Copy was unavailable. Select code in the editor instead.'); }
  }
  function onSubmit() {
    if (!selected) { setFormError('Select a finding first.'); return; }
    if (!reason.trim()) { setFormError('Please add a reason for this decision.'); return; }
    if (!canRecordDecision(selected, action, role)) { setFormError('Critical issue dismissal requires simulated senior approval.'); return; }
    const entry = { id:`DEC-${Date.now()}-${Math.random().toString(36).slice(2,6)}`, scanId:scanMeta.id, findingId:selected.id, title:selected.title, line:selected.line, severity:selected.severity, action, reason:reason.trim(), role, at:new Date().toISOString() };
    setLog((items) => [entry, ...items]);
    setFindings((items) => items.map((item) => item.id === selected.id ? { ...item, status:action } : item));
    setReason(''); setFormError(''); notify(`${ACTION_LABELS[action]} — saved in the local history.`);
  }
  function onExport() {
    if (!log.length) return;
    const header = ['Time','Scan ID','Finding','Line','Severity','Action','Reviewer role (simulated)','Reason'];
    const rows = log.map((entry) => [entry.at,entry.scanId,entry.title,entry.line,entry.severity,entry.action,entry.role,entry.reason]);
    const quote = (value) => `"${String(value ?? '').replaceAll('"','""')}"`;
    const csv = [header,...rows].map((row) => row.map(quote).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type:'text/csv;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = 'vulnera-decision-history.csv'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    notify('Decision history exported as CSV.');
  }
  function onReset(onlyLog = false) {
    if (onlyLog) {
      if (!window.confirm('Clear all locally stored demo decisions?')) return;
      setLog([]); setFindings((items) => items.map((item) => ({ ...item, status:'open' }))); notify('Demo decisions cleared.'); return;
    }
    if (!window.confirm('Reset the entire Vulnera demo?')) return;
    const next = freshState();
    setCode(next.code); setScannedCode(next.scannedCode); setFileName(next.fileName); setLanguage(next.language); setSampleId(next.sampleId);
    setFindings(next.findings); setScanMeta(next.scanMeta); setLog([]); setSelectedId(next.findings[0]?.id || null); setRole('reviewer'); setCodeMode('reviewed'); setPage('workspace'); setFilter('all'); setSeverityFilter('all'); setReason(''); setAction('fixed'); setFormError(''); notify('Vulnera reset to the starting demo.');
  }
  const workspaceProps = { code, scannedCode, onCodeChange, fileName, language, sampleId, onLoadSample, onUpload, onScan, scanning, dirty, findings, selected, selectedId, onSelect, codeMode, setCodeMode, onCopyCode, fileInputRef, codeViewerRef, filter, setFilter, severityFilter, setSeverityFilter, role, action, setAction:(value) => { setAction(value); setFormError(''); }, reason, setReason:(value) => { setReason(value); setFormError(''); }, formError, onSubmit, scanMeta, log, onOpenLog:() => setPage('log') };
  if (page === 'home') return <Landing onOpenWorkspace={() => setPage('workspace')}/>;
  return <div className="min-h-screen bg-[#F7FAFF] lg:flex">
    <Sidebar page={page} setPage={setPage} role={role} setRole={setRole} logCount={log.length} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen}/>
    <div className="min-w-0 flex-1"><Topbar page={page} setMobileOpen={setMobileOpen}/><main className="mx-auto w-full max-w-[1550px] px-4 pb-8 pt-8 sm:px-8 sm:pt-10 xl:px-10">
      {page === 'workspace' && <Workspace {...workspaceProps}/>}
      {page === 'log' && <AuditLog log={log} onExport={onExport} onBack={() => setPage('workspace')} onReset={() => onReset(true)}/>}
    </main></div>
    {toast && <div role="status" className="toast fixed bottom-5 right-5 z-[70] flex max-w-[min(420px,calc(100vw-40px))] items-start gap-2.5 rounded-xl border border-[#F0F5FE] bg-white px-4 py-3 text-[12px] font-medium text-[#354B70] shadow-[0_10px_35px_#4C3C291C]"><Check size={15} className="mt-0.5 shrink-0 text-[#188367]"/><span className="flex-1 leading-relaxed">{toast}</span><button type="button" className="text-[#91A5C0]" onClick={() => setToast('')} aria-label="Dismiss notification"><X size={15}/></button></div>}
  </div>;
}
export default App;
