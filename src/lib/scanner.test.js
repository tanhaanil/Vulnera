import test from 'node:test';
import assert from 'node:assert/strict';
import { scanCode, canRecordDecision, calculateScore } from './scanner.js';
import { SAMPLES } from '../data/samples.js';

test('demo source contains several realistic findings', () => {
  const findings = scanCode(SAMPLES[0].code);
  assert.ok(findings.length >= 5);
  assert.ok(findings.some((f) => f.ruleId === 'sql-injection' && f.severity === 'Critical'));
  assert.ok(findings.some((f) => f.ruleId === 'hardcoded-secret'));
  assert.ok(findings.every((f) => f.line > 0));
});

test('clean snippet has no local rule matches', () => {
  assert.equal(scanCode(SAMPLES.find((s) => s.id === 'clean').code).length, 0);
});

test('empty input produces no findings', () => {
  assert.deepEqual(scanCode(' \n '), []);
});

test('critical risk dismissal needs simulated senior role', () => {
  const issue = { severity: 'Critical' };
  assert.equal(canRecordDecision(issue, 'accepted_risk', 'reviewer'), false);
  assert.equal(canRecordDecision(issue, 'false_positive', 'reviewer'), false);
  assert.equal(canRecordDecision(issue, 'fixed', 'reviewer'), true);
  assert.equal(canRecordDecision(issue, 'accepted_risk', 'senior'), true);
});

test('security posture score increases when issues are marked reviewed', () => {
  const findings = scanCode(SAMPLES[0].code);
  const before = calculateScore(findings);
  const after = calculateScore(findings.map((f) => ({ ...f, status: 'fixed' })));
  assert.ok(after > before);
  assert.equal(after, 100);
});
