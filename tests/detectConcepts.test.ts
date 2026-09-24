// Slice 4 — concept detection tests. See devpost/spec.md > Components >
// lib/analyze/detectConcepts.ts and devpost/IMPLEMENTATION_PLAN.md > Slice 4.
//
// Three layers:
//  1. Representative rules: positive case matches, a plausible negative case
//     does not (guards against both false negatives and false positives).
//  2. The grounding invariant over the bundled sample: every emitted concept
//     carries >=1 citation, and every citation resolves to a real ADDED line
//     at that file:line in the diff (no hallucinated citations).
//  3. The sample yields (at least) the expected distinct concept ids.

import { describe, expect, it } from 'vitest';

import { detectConcepts } from '../src/lib/analyze/detectConcepts.js';
import type { Language } from '../src/lib/detectLanguage.js';
import { parseDiff } from '../src/lib/diff/parseDiff.js';
import { sampleDiff } from '../src/samples/sample.diff.js';
import type { FileDiff, ParsedDiff } from '../src/lib/types.js';

/** Builds a minimal single-file, single-hunk ParsedDiff whose ADDED lines are
 * exactly `lines`, numbered 1..n in the new file — enough control to isolate
 * one rule at a time without hand-writing raw diff text. */
function fileOfAddedLines(path: string, language: Language, lines: string[]): FileDiff {
  return {
    path,
    language,
    added: lines.length,
    removed: 0,
    functions: [],
    hunks: [
      {
        header: `@@ -0,0 +1,${lines.length} @@`,
        lines: lines.map((text, i) => ({ kind: 'add' as const, text, newLineNo: i + 1 })),
      },
    ],
  };
}

function idsFor(path: string, language: Language, lines: string[]): string[] {
  const parsed: ParsedDiff = { files: [fileOfAddedLines(path, language, lines)] };
  return detectConcepts(parsed).map((c) => c.id);
}

describe('detectConcepts — representative rules (positive matches, plausible negatives abstain)', () => {
  it('new-dependency (JS/TS): bare import matches, relative import does not', () => {
    expect(idsFor('a.ts', 'typescript', ["import jwt from 'jsonwebtoken';"])).toContain(
      'new-dependency',
    );
    expect(idsFor('a.ts', 'typescript', ["import helper from './x';"])).not.toContain(
      'new-dependency',
    );
  });

  it('new-dependency (Python): absolute import matches, relative "from . import" does not', () => {
    expect(idsFor('a.py', 'python', ['import os'])).toContain('new-dependency');
    expect(idsFor('a.py', 'python', ['from . import foo'])).not.toContain('new-dependency');
  });

  it('regex (JS/TS): an assigned regex literal matches, a bare division does not', () => {
    expect(idsFor('a.ts', 'typescript', ['const RE = /^abc$/;'])).toContain('regex');
    expect(idsFor('a.ts', 'typescript', ['const c = a / b;'])).not.toContain('regex');
  });

  it('regex (Python): re.compile matches, an unrelated call does not', () => {
    expect(idsFor('a.py', 'python', ['pattern = re.compile(r"^abc$")'])).toContain('regex');
    expect(idsFor('a.py', 'python', ['pattern = build(r"^abc$")'])).not.toContain('regex');
  });

  it('env-var (JS/TS): process.env access matches, a plain config lookup does not', () => {
    expect(idsFor('a.ts', 'typescript', ['const key = process.env.API_KEY;'])).toContain(
      'env-var',
    );
    expect(idsFor('a.ts', 'typescript', ['const key = config.apiKey;'])).not.toContain(
      'env-var',
    );
  });

  it('env-var (Python): os.environ access matches, a plain config lookup does not', () => {
    expect(idsFor('a.py', 'python', ['webhook = os.environ.get("X")'])).toContain('env-var');
    expect(idsFor('a.py', 'python', ['webhook = config.get("X")'])).not.toContain('env-var');
  });

  it('api-route (JS/TS): router.<method>( matches, an unrelated router property access does not', () => {
    expect(idsFor('a.ts', 'typescript', ["router.post('/login', handler);"])).toContain(
      'api-route',
    );
    expect(idsFor('a.ts', 'typescript', ['const x = router.stuff;'])).not.toContain(
      'api-route',
    );
  });

  it('api-route (Python): @app.route(...) matches, an unrelated decorator does not', () => {
    expect(idsFor('a.py', 'python', ["@app.route('/x')"])).toContain('api-route');
    expect(idsFor('a.py', 'python', ['@app.other()'])).not.toContain('api-route');
  });

  it('async-await: an async function declaration matches, a plain function does not', () => {
    expect(idsFor('a.ts', 'typescript', ['async function foo() {}'])).toContain('async-await');
    expect(idsFor('a.ts', 'typescript', ['function foo() {}'])).not.toContain('async-await');
  });

  it('promise: .then(/.catch( / new Promise matches, a plain call does not', () => {
    expect(idsFor('a.ts', 'typescript', ['fetchData().then((x) => x);'])).toContain('promise');
    expect(idsFor('a.ts', 'typescript', ['const result = doSomething();'])).not.toContain(
      'promise',
    );
  });

  it('react-hook: a use-prefixed call matches, a use-prefixed identifier that is not called does not', () => {
    expect(idsFor('a.ts', 'typescript', ['const [x, setX] = useState(0);'])).toContain(
      'react-hook',
    );
    expect(idsFor('a.ts', 'typescript', ['const x = useful;'])).not.toContain('react-hook');
  });

  it('sql: a SELECT statement matches, an unrelated string literal does not', () => {
    expect(idsFor('a.ts', 'typescript', ["db.query('SELECT * FROM users');"])).toContain('sql');
    expect(idsFor('a.ts', 'typescript', ["db.query('fetch users');"])).not.toContain('sql');
  });

  it('auth-token: an Authorization header read matches, an unrelated header does not', () => {
    expect(
      idsFor('a.ts', 'typescript', ["const t = req.headers['authorization'];"]),
    ).toContain('auth-token');
    expect(
      idsFor('a.ts', 'typescript', ["const t = req.headers['content-type'];"]),
    ).not.toContain('auth-token');
  });

  it('file-io (JS/TS): fs.readFileSync matches, an unlisted fs call does not', () => {
    expect(idsFor('a.ts', 'typescript', ['fs.readFileSync(path);'])).toContain('file-io');
    expect(idsFor('a.ts', 'typescript', ['fs.existsSync(path);'])).not.toContain('file-io');
  });

  it('file-io (Python): open( matches, an unrelated call does not', () => {
    expect(idsFor('a.py', 'python', ['f = open("x.txt")'])).toContain('file-io');
    expect(idsFor('a.py', 'python', ['f = read("x.txt")'])).not.toContain('file-io');
  });

  it('class-added: an exported class matches, an exported const object does not', () => {
    expect(idsFor('a.ts', 'typescript', ['export class Foo {}'])).toContain('class-added');
    expect(idsFor('a.ts', 'typescript', ['export const Foo = {};'])).not.toContain(
      'class-added',
    );
  });

  it('interface-added: an interface/type alias matches, a const declaration does not', () => {
    expect(idsFor('a.ts', 'typescript', ['export interface Foo {}'])).toContain(
      'interface-added',
    );
    expect(idsFor('a.ts', 'typescript', ['export const Foo = {};'])).not.toContain(
      'interface-added',
    );
  });

  it('error-handling (JS/TS): try { matches, a plain if does not', () => {
    expect(idsFor('a.ts', 'typescript', ['try {'])).toContain('error-handling');
    expect(idsFor('a.ts', 'typescript', ['if (x) {'])).not.toContain('error-handling');
  });

  it('error-handling (Python): try: matches, a plain if does not', () => {
    expect(idsFor('a.py', 'python', ['try:'])).toContain('error-handling');
    expect(idsFor('a.py', 'python', ['if x:'])).not.toContain('error-handling');
  });
});

describe('detectConcepts — citation grounding', () => {
  it('never emits a concept without at least one citation', () => {
    const parsed: ParsedDiff = {
      files: [fileOfAddedLines('a.ts', 'typescript', ['async function foo() {}'])],
    };
    for (const concept of detectConcepts(parsed)) {
      expect(concept.citations.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('deduplicates repeated citations for the same file:line but keeps distinct ones', () => {
    // Two rules matching the id `async-await` should not double-cite the
    // same line, but should each carry a separate line's citation.
    const parsed: ParsedDiff = {
      files: [
        fileOfAddedLines('a.ts', 'typescript', [
          'async function foo() {}',
          'await bar();',
        ]),
      ],
    };
    const concept = detectConcepts(parsed).find((c) => c.id === 'async-await');
    expect(concept).toBeDefined();
    expect(concept!.citations).toEqual(
      expect.arrayContaining([
        { file: 'a.ts', line: 1 },
        { file: 'a.ts', line: 2 },
      ]),
    );
    expect(concept!.citations).toHaveLength(2);
  });
});

describe('detectConcepts — invariant over the bundled sample diff', () => {
  const parsedSample = parseDiff(sampleDiff);
  const concepts = detectConcepts(parsedSample);

  /** Every "file:line" that is a real ADDED line in the parsed sample. */
  const realAddedLines = new Set<string>();
  for (const file of parsedSample.files) {
    for (const hunk of file.hunks) {
      for (const line of hunk.lines) {
        if (line.kind === 'add' && line.newLineNo !== undefined) {
          realAddedLines.add(`${file.path}:${line.newLineNo}`);
        }
      }
    }
  }

  it('finds at least one concept on the sample', () => {
    expect(concepts.length).toBeGreaterThan(0);
  });

  it('every concept has at least one citation', () => {
    for (const concept of concepts) {
      expect(concept.citations.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('every citation resolves to a real ADDED line at that file:line in the diff', () => {
    for (const concept of concepts) {
      for (const citation of concept.citations) {
        const key = `${citation.file}:${citation.line}`;
        expect(realAddedLines.has(key)).toBe(true);
      }
    }
  });

  it('yields at least the expected distinct concept ids for the demo spread', () => {
    const ids = concepts.map((c) => c.id);
    expect(ids).toEqual(
      expect.arrayContaining([
        'new-dependency',
        'env-var',
        'regex',
        'api-route',
        'async-await',
        'auth-token',
        'error-handling',
      ]),
    );
  });
});
