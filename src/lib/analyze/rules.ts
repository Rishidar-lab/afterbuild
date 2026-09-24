// The rule set — a declarative array of small, named, individually testable
// rules. Each rule tests one ADDED line's text and, on a match, backs one
// citation for its concept id. Adding a language means adding rules here,
// not touching the detector engine. See devpost/spec.md > Components >
// lib/analyze/rules.ts and devpost/spec.md > Data Model (concept ids).
//
// Deliberately heuristic, not a semantic understanding of the code — see
// devpost/spec.md > What Was Simplified and Why. Every regex favors
// missing a match over inventing one.

import type { Language } from '../detectLanguage.js';

export interface ConceptRule {
  /** One of the concept ids in spec.md > Data Model. Multiple rules may share an id
   *  (e.g. a JS/TS variant and a Python variant of the same concept). */
  id: string;
  label: string;
  /** One-sentence, plain-English "why it matters here." */
  why: string;
  languages: Language[];
  test: (line: string) => boolean;
}

function bareImportSpecifierJs(line: string): boolean {
  const match =
    /^\s*import\s+(?:[\w$*{},\s]+\sfrom\s+)?['"]([^'"]+)['"]/.exec(line) ??
    /\brequire\(\s*['"]([^'"]+)['"]\s*\)/.exec(line);
  if (!match) {
    return false;
  }
  const specifier = match[1]!;
  return !specifier.startsWith('.') && !specifier.startsWith('/');
}

function bareImportSpecifierPy(line: string): boolean {
  return (
    /^\s*import\s+[A-Za-z_][\w.]*/.test(line) ||
    /^\s*from\s+[A-Za-z_][\w.]*\s+import\s+/.test(line)
  );
}

function jsRegexLiteral(line: string): boolean {
  // Requires an assignment-like `= /pattern/flags` shape ending the
  // (trimmed) line, to keep false positives from a bare division low.
  return /=\s*\/(?!\/)(?:\\.|[^/\\\n])+\/[a-z]*\s*[;,)]?\s*$/.test(line);
}

export const rules: ConceptRule[] = [
  {
    id: 'new-dependency',
    label: 'New dependency/import',
    why: 'This line imports a module the file did not previously depend on.',
    languages: ['typescript', 'javascript'],
    test: bareImportSpecifierJs,
  },
  {
    id: 'new-dependency',
    label: 'New dependency/import',
    why: 'This line imports a module the file did not previously depend on.',
    languages: ['python'],
    test: bareImportSpecifierPy,
  },
  {
    id: 'async-await',
    label: 'Async/await',
    why: 'This line uses async/await — execution can pause here while an asynchronous operation completes.',
    languages: ['typescript', 'javascript', 'python'],
    test: (line) => /\basync\b|\bawait\b/.test(line),
  },
  {
    id: 'promise',
    label: 'Promise',
    why: 'This line works with a Promise directly, a core async-JS building block distinct from async/await.',
    languages: ['typescript', 'javascript'],
    test: (line) =>
      /\bnew\s+Promise\b|\.then\s*\(|\.catch\s*\(|\bPromise\.(all|race|resolve|reject|allSettled)\b/.test(
        line,
      ),
  },
  {
    id: 'react-hook',
    label: 'React hook',
    why: 'This line calls a React hook — the component now carries state or a lifecycle-tied effect.',
    languages: ['typescript', 'javascript'],
    test: (line) => /\buse[A-Z]\w*\s*\(/.test(line),
  },
  {
    id: 'api-route',
    label: 'API route/handler',
    why: 'This line defines an HTTP route or handler, part of the app\'s API surface.',
    languages: ['typescript', 'javascript'],
    test: (line) => /\b(?:router|app)\.(?:get|post|put|patch|delete|use)\s*\(/.test(line),
  },
  {
    id: 'api-route',
    label: 'API route/handler',
    why: 'This line defines an HTTP route or handler, part of the app\'s API surface.',
    languages: ['python'],
    test: (line) => /@(?:app|router)\.(?:get|post|put|patch|delete|route)\s*\(/.test(line),
  },
  {
    id: 'sql',
    label: 'SQL',
    why: 'This line contains a SQL statement, touching the database layer directly.',
    languages: ['typescript', 'javascript', 'python'],
    test: (line) => /\b(SELECT|INSERT\s+INTO|UPDATE|DELETE\s+FROM|CREATE\s+TABLE)\b/i.test(line),
  },
  {
    id: 'regex',
    label: 'Regular expression',
    why: 'This line defines a regular expression — compact, but easy to get subtly wrong.',
    languages: ['typescript', 'javascript'],
    test: jsRegexLiteral,
  },
  {
    id: 'regex',
    label: 'Regular expression',
    why: 'This line defines a regular expression — compact, but easy to get subtly wrong.',
    languages: ['python'],
    test: (line) => /\bre\.(compile|match|fullmatch|search|sub|subn|findall|finditer|split)\s*\(/.test(line),
  },
  {
    id: 'env-var',
    label: 'Environment variable',
    why: 'This line reads configuration from the environment, which must be set correctly wherever the app runs.',
    languages: ['typescript', 'javascript'],
    test: (line) => /\bprocess\.env\.[A-Za-z_][A-Za-z0-9_]*\b/.test(line),
  },
  {
    id: 'env-var',
    label: 'Environment variable',
    why: 'This line reads configuration from the environment, which must be set correctly wherever the app runs.',
    languages: ['python'],
    test: (line) => /\bos\.environ\b/.test(line),
  },
  {
    id: 'auth-token',
    label: 'Auth token/credential',
    why: 'This line touches an auth token or credential — a mistake here is a security bug, not just a functional one.',
    languages: ['typescript', 'javascript', 'python'],
    test: (line) =>
      /\bAuthorization\b|\bBearer\b|\bJWT_SECRET\b|\bjwt\.(sign|verify)\s*\(|\baccess_?token\b/i.test(
        line,
      ),
  },
  {
    id: 'file-io',
    label: 'File I/O',
    why: 'This line reads or writes a file on disk — a common source of path and permission bugs.',
    languages: ['typescript', 'javascript'],
    test: (line) =>
      /\bfs\.(readFile|writeFile|readFileSync|writeFileSync|appendFile|appendFileSync|createReadStream|createWriteStream|unlink|unlinkSync)\b/.test(
        line,
      ),
  },
  {
    id: 'file-io',
    label: 'File I/O',
    why: 'This line reads or writes a file on disk — a common source of path and permission bugs.',
    languages: ['python'],
    test: (line) => /\bopen\s*\(/.test(line),
  },
  {
    id: 'class-added',
    label: 'Class added',
    why: 'This line defines a new class, introducing a new type/unit of behavior.',
    languages: ['typescript', 'javascript', 'python'],
    test: (line) => /^\s*(?:export\s+)?(?:default\s+)?class\s+[A-Za-z_$][\w$]*/.test(line),
  },
  {
    id: 'interface-added',
    label: 'Interface/type added',
    why: 'This line defines a new TypeScript interface or type alias, shaping what data is expected to look like.',
    languages: ['typescript'],
    test: (line) =>
      /^\s*(?:export\s+)?interface\s+[A-Za-z_$][\w$]*/.test(line) ||
      /^\s*(?:export\s+)?type\s+[A-Za-z_$][\w$]*\s*=/.test(line),
  },
  {
    id: 'error-handling',
    label: 'Error handling',
    why: 'This line is part of explicit error handling — worth checking failures are handled the way you expect.',
    languages: ['typescript', 'javascript'],
    test: (line) => /\btry\s*\{|\bcatch\s*\(|\.catch\s*\(/.test(line),
  },
  {
    id: 'error-handling',
    label: 'Error handling',
    why: 'This line is part of explicit error handling — worth checking failures are handled the way you expect.',
    languages: ['python'],
    test: (line) => /^\s*try\s*:|^\s*except\b/.test(line),
  },
];
