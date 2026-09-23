// Small pure map: file extension → language. Used by the parser/detector
// and the change map. See devpost/spec.md > Components > lib/detectLanguage.ts.

export type Language = 'typescript' | 'javascript' | 'python' | 'other';

const EXTENSION_TO_LANGUAGE: Readonly<Record<string, Language>> = {
  ts: 'typescript',
  tsx: 'typescript',
  mts: 'typescript',
  cts: 'typescript',
  js: 'javascript',
  jsx: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  py: 'python',
  pyi: 'python',
};

/**
 * Detects a coarse language from a file path's extension. Returns 'other'
 * for unknown/missing extensions rather than guessing — detection for such
 * files is simply skipped downstream (spec.md > Important Failure Modes).
 */
export function detectLanguage(path: string): Language {
  const match = /\.([A-Za-z0-9]+)$/.exec(path);
  const ext = match?.[1]?.toLowerCase();
  if (!ext) {
    return 'other';
  }
  return EXTENSION_TO_LANGUAGE[ext] ?? 'other';
}
