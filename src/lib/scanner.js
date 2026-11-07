/**
 * Vulnera local-demo rules. These lightweight pattern checks are deliberately
 * not presented as an AI model or a comprehensive security scanner.
 * A production scanner requires parsing, data-flow analysis and human review.
 */
export const RULES = [
  {
    id: 'sql-injection',
    title: 'Potential SQL injection',
    severity: 'Critical',
    confidence: 96,
    cwe: 'CWE-89',
    category: 'Injection',
    description: 'SQL query text may be constructed using user-controlled values. That could allow an attacker to change the intended query.',
    recommendation: 'Use parameterized queries or prepared statements instead of inserting input into SQL text.',
    test: (line) => /\b(?:db|pool|client)\.(?:query|execute)\s*\(/i.test(line) && (/\$\{/.test(line) || /\+\s*(?:req\.|[a-z_$][\w$]*)/i.test(line)),
  },
  {
    id: 'unsafe-eval',
    title: 'Dynamic code execution',
    severity: 'Critical',
    confidence: 98,
    cwe: 'CWE-95',
    category: 'Code execution',
    description: 'eval() interprets a string as executable code. Using untrusted input here can lead to arbitrary code execution.',
    recommendation: 'Avoid eval(). Replace it with an explicit parser or a restricted, purpose-built expression evaluator.',
    test: (line) => /\beval\s*\(/.test(line) && !/\bfunction\s+eval\s*\(/.test(line),
  },
  {
    id: 'hardcoded-secret',
    title: 'Hardcoded credential',
    severity: 'High',
    confidence: 91,
    cwe: 'CWE-798',
    category: 'Secrets',
    description: 'A credential-like value appears directly in the source file. Embedded secrets are easy to expose through repositories and builds.',
    recommendation: 'Move real secrets to a server-side secrets manager or environment variables, then rotate any exposed credentials.',
    test: (line) => /\b(?:[\w]*api[_-]?key|[\w]*secret|[\w]*password|[\w]*access[_-]?token)\s*[:=]\s*["'`][^"'`]{8,}["'`]/i.test(line),
  },
  {
    id: 'weak-randomness',
    title: 'Predictable security token',
    severity: 'High',
    confidence: 90,
    cwe: 'CWE-338',
    category: 'Cryptography',
    description: 'Math.random() is not cryptographically secure and should not generate session or authentication tokens.',
    recommendation: 'Generate sensitive tokens using crypto.randomBytes() or a secure Web Crypto API method.',
    test: (line) => /\bMath\.random\s*\(/.test(line),
  },
  {
    id: 'credential-logging',
    title: 'Sensitive data written to logs',
    severity: 'Medium',
    confidence: 90,
    cwe: 'CWE-532',
    category: 'Logging',
    description: 'A log statement appears to include a password, token, or secret. Logs are often retained and shared more broadly than application data.',
    recommendation: 'Remove sensitive values from logs. Log only non-sensitive metadata and redact user inputs where necessary.',
    test: (line) => /\bconsole\.(?:log|info|debug|warn)\s*\(/.test(line) && /password|token|secret|api.?key/i.test(line),
  },
  {
    id: 'wildcard-cors',
    title: 'Overly permissive CORS',
    severity: 'Medium',
    confidence: 88,
    cwe: 'CWE-942',
    category: 'Configuration',
    description: 'A wildcard CORS policy allows browser requests from any origin. This can be dangerous when combined with sensitive endpoints or credentials.',
    recommendation: 'Allow only required trusted origins, and separately review credential handling.',
    test: (line) => /\bcors\s*\(\s*\{[^\n}]*origin\s*:\s*["']\*["']/.test(line),
  },
  {
    id: 'html-injection',
    title: 'Untrusted HTML assignment',
    severity: 'High',
    confidence: 89,
    cwe: 'CWE-79',
    category: 'Cross-site scripting',
    description: 'Writing generated strings into innerHTML can introduce cross-site scripting when the content includes untrusted values.',
    recommendation: 'Prefer textContent for plain text. If HTML is required, sanitize using a well-maintained HTML sanitizer.',
    test: (line) => /\.innerHTML\s*=/.test(line),
  },
  {
    id: 'python-shell',
    title: 'Shell execution enabled',
    severity: 'High',
    confidence: 92,
    cwe: 'CWE-78',
    category: 'Command injection',
    description: 'Using a shell to execute an input-derived command may enable operating-system command injection.',
    recommendation: 'Pass an argument array with shell=False. Validate command inputs against an allowlist.',
    test: (line) => /\bsubprocess\.(?:run|Popen|call)\s*\(/.test(line) && /\bshell\s*=\s*True\b/.test(line),
  },
  {
    id: 'debug-mode',
    title: 'Debug mode enabled',
    severity: 'Low',
    confidence: 85,
    cwe: 'CWE-489',
    category: 'Configuration',
    description: 'Debug mode appears to be enabled, which can expose stack traces or internal application details in deployed environments.',
    recommendation: 'Disable debugging in production and use environment-specific configuration.',
    test: (line) => /^\s*DEBUG\s*=\s*True\b/.test(line),
  },
];

export const SEVERITIES = ['Critical', 'High', 'Medium', 'Low'];
export const STATUS_LABELS = {
  open: 'Open',
  fixed: 'Marked fixed',
  false_positive: 'False positive',
  accepted_risk: 'Risk accepted',
};
export const ACTION_LABELS = {
  fixed: 'Marked fixed',
  false_positive: 'Dismissed as false positive',
  accepted_risk: 'Accepted risk',
};

export function scanCode(code) {
  if (!code || !code.trim()) return [];
  const lines = code.split(/\r?\n/);
  const results = [];
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    for (const rule of RULES) {
      if (rule.test(line, lines, index)) {
        results.push({
          id: `${rule.id}-L${index + 1}`,
          ruleId: rule.id,
          title: rule.title,
          severity: rule.severity,
          confidence: rule.confidence,
          cwe: rule.cwe,
          category: rule.category,
          description: rule.description,
          recommendation: rule.recommendation,
          line: index + 1,
          evidence: line.trim(),
          status: 'open',
        });
      }
    }
  }
  return results.sort((a, b) => SEVERITIES.indexOf(a.severity) - SEVERITIES.indexOf(b.severity) || a.line - b.line);
}

export function calculateScore(findings) {
  const weights = { Critical: 22, High: 13, Medium: 7, Low: 3 };
  return Math.max(0, 100 - findings.filter((item) => item.status === 'open').reduce((sum, item) => sum + (weights[item.severity] || 0), 0));
}

export function canRecordDecision(finding, action, role) {
  return !(finding?.severity === 'Critical' && ['false_positive', 'accepted_risk'].includes(action) && role !== 'senior');
}
