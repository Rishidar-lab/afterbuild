// Written FIRST, before src/lib/diff/parseDiff.ts exists — see
// devpost/IMPLEMENTATION_PLAN.md > Slice 3 and
// devpost/spec.md > Decisions and Open Issues (the one genuine
// correctness risk: exact new-file line numbers across multiple `@@`
// hunks). Citations in later slices depend on this being right.

import { describe, expect, it } from 'vitest';

import { parseDiff } from '../src/lib/diff/parseDiff.js';
import { sampleDiff } from '../src/samples/sample.diff.js';

describe('parseDiff — bundled sample (multi-file, multi-hunk)', () => {
  const parsed = parseDiff(sampleDiff);

  it('finds both changed files with the right paths and languages', () => {
    expect(parsed.files).toHaveLength(2);
    expect(parsed.files[0]?.path).toBe('src/api/authRoutes.ts');
    expect(parsed.files[0]?.language).toBe('typescript');
    expect(parsed.files[1]?.path).toBe('scripts/notify.py');
    expect(parsed.files[1]?.language).toBe('python');
  });

  it('tracks two separate hunks for the TS file (multi-hunk tracking)', () => {
    const authRoutes = parsed.files[0]!;
    expect(authRoutes.hunks).toHaveLength(2);
    expect(authRoutes.hunks[0]?.header).toBe('@@ -1,6 +1,8 @@');
    expect(authRoutes.hunks[1]?.header).toBe('@@ -10,4 +12,17 @@');
  });

  it('assigns correct NEW-FILE line numbers in hunk 1 of authRoutes.ts', () => {
    const [hunk1] = parseDiff(sampleDiff).files[0]!.hunks;
    const byText = (text: string) => hunk1!.lines.find((l) => l.text === text);

    expect(byText("import express from 'express';")).toMatchObject({
      kind: 'ctx',
      newLineNo: 1,
    });
    expect(byText("import jwt from 'jsonwebtoken';")).toMatchObject({
      kind: 'add',
      newLineNo: 2,
    });
    // A blank context line (the original had trailing whitespace stripped
    // to a fully empty line by editor tooling — parseDiff treats an empty
    // raw line inside a hunk's budget as a context line with empty text,
    // same as real git's " " blank-context marker).
    expect(hunk1!.lines[2]).toMatchObject({ kind: 'ctx', text: '', newLineNo: 3 });
    expect(byText('const router = express.Router();')).toMatchObject({
      kind: 'ctx',
      newLineNo: 4,
    });
    expect(byText('const JWT_SECRET = process.env.JWT_SECRET;')).toMatchObject({
      kind: 'add',
      newLineNo: 5,
    });
    expect(hunk1!.lines[5]).toMatchObject({ kind: 'ctx', text: '', newLineNo: 6 });
    expect(byText("router.get('/health', (req, res) => {")).toMatchObject({
      kind: 'ctx',
      newLineNo: 7,
    });
    expect(byText("  res.json({ status: 'ok' });")).toMatchObject({
      kind: 'ctx',
      newLineNo: 8,
    });
  });

  it('assigns correct NEW-FILE line numbers in hunk 2 of authRoutes.ts (continues past the gap correctly)', () => {
    const [, hunk2] = parseDiff(sampleDiff).files[0]!.hunks;
    const byText = (text: string) => hunk2!.lines.find((l) => l.text === text);

    expect(byText('  res.json({ id: req.params.id });')).toMatchObject({
      kind: 'ctx',
      newLineNo: 12,
    });
    expect(byText('});')).toMatchObject({ kind: 'ctx', newLineNo: 13 });
    expect(hunk2!.lines[2]).toMatchObject({ kind: 'ctx', text: '', newLineNo: 14 });
    expect(byText('const TOKEN_RE = /^Bearer\\s+([A-Za-z0-9\\-_.]+)$/;')).toMatchObject({
      kind: 'add',
      newLineNo: 15,
    });
    expect(byText("router.post('/login', async (req, res) => {")).toMatchObject({
      kind: 'add',
      newLineNo: 17,
    });
    expect(byText("  const authHeader = req.headers['authorization'] || '';")).toMatchObject({
      kind: 'add',
      newLineNo: 18,
    });
    expect(
      byText('  const payload = await jwt.verify(match[1], JWT_SECRET);'),
    ).toMatchObject({ kind: 'add', newLineNo: 24 });
    expect(byText('export default router;')).toMatchObject({ kind: 'ctx', newLineNo: 28 });
  });

  it('counts added/removed lines for authRoutes.ts correctly', () => {
    const authRoutes = parsed.files[0]!;
    expect(authRoutes.added).toBe(15);
    expect(authRoutes.removed).toBe(0);
  });

  it('assigns correct NEW-FILE line numbers for the Python file (single hunk)', () => {
    const notify = parseDiff(sampleDiff).files[1]!;
    const [hunk] = notify.hunks;
    const byText = (text: string) => hunk!.lines.find((l) => l.text === text);

    expect(byText('import os')).toMatchObject({ kind: 'add', newLineNo: 1 });
    expect(byText('import sys')).toMatchObject({ kind: 'ctx', newLineNo: 2 });
    expect(byText('def send_alert(message):')).toMatchObject({ kind: 'add', newLineNo: 5 });
    expect(byText('    webhook = os.environ.get("ALERT_WEBHOOK_URL")')).toMatchObject({
      kind: 'add',
      newLineNo: 6,
    });
    expect(byText('    try:')).toMatchObject({ kind: 'add', newLineNo: 9 });
    expect(byText('    except Exception as exc:')).toMatchObject({
      kind: 'add',
      newLineNo: 12,
    });
    expect(byText('    send_alert("notify job finished")')).toMatchObject({
      kind: 'add',
      newLineNo: 19,
    });

    expect(notify.added).toBe(14);
    expect(notify.removed).toBe(0);
  });

  it('detects the added function name in notify.py', () => {
    const notify = parsed.files[1]!;
    expect(notify.functions).toContain('send_alert');
  });
});

describe('parseDiff — hand-written multi-hunk fixture (fully controlled)', () => {
  // A small, self-contained two-hunk diff where every new-file line number
  // is easy to verify by eye: hunk 1 covers new lines 1-4, hunk 2 jumps the
  // gap to new lines 11-13. This is the "genuine uncertainty" case named in
  // spec.md — the parser must reset its line counter from each hunk
  // header's `+start`, not keep incrementing from where the previous hunk
  // left off.
  const fixture = [
    'diff --git a/foo.ts b/foo.ts',
    'index 1111111..2222222 100644',
    '--- a/foo.ts',
    '+++ b/foo.ts',
    '@@ -1,3 +1,4 @@',
    ' alpha',
    '+added-one',
    ' beta',
    ' gamma',
    '@@ -10,2 +11,3 @@',
    ' kappa',
    '+added-two',
    ' lambda',
    '',
  ].join('\n');

  const parsed = parseDiff(fixture);

  it('parses exactly one file with two hunks', () => {
    expect(parsed.files).toHaveLength(1);
    expect(parsed.files[0]?.path).toBe('foo.ts');
    expect(parsed.files[0]?.hunks).toHaveLength(2);
  });

  it('assigns correct new-file line numbers in hunk 1', () => {
    const [hunk1] = parsed.files[0]!.hunks;
    expect(hunk1!.lines).toEqual([
      { kind: 'ctx', text: 'alpha', newLineNo: 1 },
      { kind: 'add', text: 'added-one', newLineNo: 2 },
      { kind: 'ctx', text: 'beta', newLineNo: 3 },
      { kind: 'ctx', text: 'gamma', newLineNo: 4 },
    ]);
  });

  it('assigns correct new-file line numbers in hunk 2, jumping the gap correctly', () => {
    const [, hunk2] = parsed.files[0]!.hunks;
    expect(hunk2!.lines).toEqual([
      { kind: 'ctx', text: 'kappa', newLineNo: 11 },
      { kind: 'add', text: 'added-two', newLineNo: 12 },
      { kind: 'ctx', text: 'lambda', newLineNo: 13 },
    ]);
  });

  it('counts added lines across both hunks', () => {
    expect(parsed.files[0]!.added).toBe(2);
    expect(parsed.files[0]!.removed).toBe(0);
  });
});

describe('parseDiff — removed lines do not carry a new-file line number', () => {
  const fixture = [
    'diff --git a/bar.ts b/bar.ts',
    'index 3333333..4444444 100644',
    '--- a/bar.ts',
    '+++ b/bar.ts',
    '@@ -1,3 +1,2 @@',
    ' keep',
    '-removed-line',
    ' keep2',
    '',
  ].join('\n');

  const parsed = parseDiff(fixture);

  it('marks the removed line with kind "del" and no newLineNo', () => {
    const [hunk] = parsed.files[0]!.hunks;
    expect(hunk!.lines).toEqual([
      { kind: 'ctx', text: 'keep', newLineNo: 1 },
      { kind: 'del', text: 'removed-line' },
      { kind: 'ctx', text: 'keep2', newLineNo: 2 },
    ]);
    expect(parsed.files[0]!.added).toBe(0);
    expect(parsed.files[0]!.removed).toBe(1);
  });
});

describe('parseDiff — defensive on non-diff input', () => {
  it('never throws and returns an empty file list for unrecognizable text', () => {
    expect(() => parseDiff('not a diff, just some prose.\nanother line.')).not.toThrow();
    expect(parseDiff('not a diff, just some prose.\nanother line.')).toEqual({ files: [] });
  });

  it('never throws and returns an empty file list for empty input', () => {
    expect(parseDiff('')).toEqual({ files: [] });
  });
});
