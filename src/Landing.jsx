import React, { useState } from 'react';
import {
  ArrowRight, CheckCircle2, ChevronRight,
  ClipboardCheck, Code2, FileCode2, Fingerprint, LockKeyhole,
  Menu, ScanSearch, ShieldAlert, ShieldCheck, Sparkles, X,
} from 'lucide-react';

const STEPS = [
  { number: '01', Icon: Code2, title: 'Bring your code', body: 'Paste a snippet or upload a source file. Start with your own code or try one of the included examples.', meta: 'Paste  /  Upload  /  Try a sample' },
  { number: '02', Icon: ScanSearch, title: 'Spot potential risks', body: 'Vulnera checks for known security patterns and highlights the matching lines alongside clear explanations.', meta: 'Scan  /  Inspect  /  Understand' },
  { number: '03', Icon: ClipboardCheck, title: 'Make the call', body: 'Mark a finding fixed, identify a false alarm, or accept a risk. Add a reason and keep the decision in your local history.', meta: 'Decide  /  Document  /  Track' },
];

function Logo({ onClick }) {
  return <button type="button" onClick={onClick} className="landing-logo" aria-label="Vulnera home">
    <span className="landing-logo-icon"><ShieldCheck size={23} strokeWidth={2.15}/></span>
    <span>vulnera<span className="landing-logo-period">.</span></span>
  </button>;
}

function ExampleEditor() {
  return <div className="hero-visual" aria-label="Illustration of a code review finding">
    <div className="hero-aura hero-aura-one" />
    <div className="hero-aura hero-aura-two" />
    <div className="demo-editor">
      <div className="demo-editor-top">
        <div className="demo-tab"><Code2 size={15}/> <span>example.js</span> <X size={12} className="demo-tab-x" /></div>
        <span className="demo-editor-status"><span className="demo-status-dot"/>Example preview</span>
      </div>
      <div className="demo-editor-body">
        <div className="demo-line"><span className="demo-line-num">11</span><span><span className="d-keyword">app</span>.<span className="d-func">get</span>(<span className="d-string">"/users"</span>, (<span className="d-keyword">req</span>, res) =&gt; {'{'}</span></div>
        <div className="demo-line"><span className="demo-line-num">12</span><span>  <span className="d-keyword">const</span> id = req.query.id;</span></div>
        <div className="demo-line demo-line-risk"><span className="demo-line-num">13</span><span>  <span className="d-keyword">const</span> query = <span className="d-string">"SELECT * FROM users"</span></span></div>
        <div className="demo-line demo-line-risk"><span className="demo-line-num">14</span><span>    + <span className="d-string">" WHERE id = "</span> + id;</span></div>
        <div className="demo-line"><span className="demo-line-num">15</span><span>  db.<span className="d-func">query</span>(query, (err, rows) =&gt; {'{'}</span></div>
        <div className="demo-line"><span className="demo-line-num">16</span><span>    res.<span className="d-func">json</span>(rows);</span></div>
        <div className="demo-line"><span className="demo-line-num">17</span><span>  {'}'});</span></div>
        <div className="demo-line"><span className="demo-line-num">18</span><span>{'}'});</span></div>
      </div>
      <div className="demo-editor-bottom"><span><FileCode2 size={13}/> JavaScript</span><span><span className="demo-lint-dot"/> Pattern detected</span></div>
    </div>
    <div className="demo-alert">
      <div className="demo-alert-top"><span className="demo-alert-symbol"><ShieldAlert size={18}/></span><strong>Potential SQL injection</strong><span className="demo-alert-severity">Critical</span></div>
      <p>User-controlled input may be added directly to a SQL query.</p>
      <div className="demo-alert-footer">Illustrative finding <ShieldCheck size={13}/></div>
    </div>
    <div className="visual-sparkle visual-sparkle-1"><Sparkles size={16}/></div>
  </div>;
}

export default function Landing({ onOpenWorkspace }) {
  const [mobileMenu, setMobileMenu] = useState(false);
  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const closeMenu = () => setMobileMenu(false);

  return <div className="landing-page">
    <header className="landing-header">
      <div className="landing-shell landing-header-row">
        <Logo onClick={scrollTop}/>
        <nav aria-label="Main navigation" className="landing-desktop-links">
          <button type="button" className="landing-nav-link is-current" onClick={scrollTop}>Home</button>
          <a className="landing-nav-link" href="#how-it-works">How it works</a>
        </nav>
        <button type="button" className="landing-mobile-toggle" aria-label={mobileMenu ? 'Close menu' : 'Open menu'} aria-expanded={mobileMenu} onClick={() => setMobileMenu(!mobileMenu)}>{mobileMenu ? <X size={23}/> : <Menu size={23}/>}</button>
      </div>
      {mobileMenu && <nav aria-label="Mobile navigation" className="landing-mobile-menu">
        <button type="button" onClick={() => {closeMenu(); scrollTop();}}>Home</button>
        <a href="#how-it-works" onClick={closeMenu}>How it works</a>
      </nav>}
    </header>

    <main>
      <section className="landing-hero landing-shell" id="home">
        <div className="landing-hero-copy">
          <div className="landing-eyebrow"><span className="eyebrow-dash" /> BUILT FOR THE AI CODING ERA</div>
          <h1>AI writes code.<br/><em>You review the risk.</em></h1>
          <p className="landing-lede">Find potential security weaknesses, understand vulnerabilities, and make confident review decisions in one thoughtful workspace.</p>
          <div className="landing-hero-buttons">
            <button type="button" className="landing-button-primary landing-main-cta" onClick={onOpenWorkspace}>
              Open workspace <ArrowRight size={19}/>
            </button>
          </div>
          <div className="landing-trust"><span className="landing-trust-icon"><LockKeyhole size={14}/></span><span>Your code stays in your browser. No API key needed.</span></div>
        </div>
        <ExampleEditor />
      </section>

      <section className="landing-proof-wrap" aria-label="Key capabilities">
        <div className="landing-shell landing-proof">
          <div><span className="proof-icon"><ScanSearch size={17}/></span><span><strong>9 local security checks</strong><small>Instant pattern-based analysis</small></span></div>
          <div><span className="proof-icon"><Fingerprint size={17}/></span><span><strong>Human-led decisions</strong><small>You make the final call</small></span></div>
          <div><span className="proof-icon"><CheckCircle2 size={17}/></span><span><strong>No account or API</strong><small>Start reviewing right away</small></span></div>
        </div>
      </section>

      <section className="landing-steps-section" id="how-it-works">
        <div className="landing-shell">
          <div className="landing-section-heading"><div className="landing-eyebrow"><span className="eyebrow-dash"/> HOW IT WORKS</div><h2>From code to clarity.<br/><em>Three simple steps.</em></h2><p>No complicated setup, no black box. A focused space for finding potential issues and recording the reasoning behind every decision.</p></div>
          <div className="landing-steps-grid">
            {STEPS.map(({ number, Icon, title, body, meta }, index) => <div className="landing-step-card" key={number}>
              <div className="step-top"><span className="step-index">{number}</span><span className="step-icon"><Icon size={23} strokeWidth={1.8}/></span></div>
              <h3>{title}</h3><p>{body}</p>
              <div className="step-meta">{meta}</div>
              {index < 2 && <span className="step-connector"><ChevronRight size={19}/></span>}
            </div>)}
          </div>
        </div>
      </section>

    </main>
    <footer className="landing-footer"><div className="landing-shell landing-footer-content"><div className="landing-footer-brand"><ShieldCheck size={18}/> vulnera<span>.</span></div><span>© {new Date().getFullYear()} Tanha Anil.</span><span>Rule-based analysis is not a full security audit.</span></div></footer>
  </div>;
}
