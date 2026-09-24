// The concept detector (the kernel). Runs the rule set over ADDED lines
// only and returns deduplicated Concept[]s, each carrying every citation
// that backs it. See devpost/spec.md > Components > lib/analyze/detectConcepts.ts.
//
// HARD RULE: a Concept only ever comes into existence here as the direct
// result of a rule matching a real added line — there is no code path that
// creates a Concept without appending at least one citation in the same
// step. No rule may emit a concept without a citation, and no concept is
// ever listed that isn't backed by a matched added line.

import { rules } from './rules.js';
import type { Citation, Concept, ParsedDiff } from '../types.js';

export function detectConcepts(parsed: ParsedDiff): Concept[] {
  const byId = new Map<string, Concept>();

  for (const file of parsed.files) {
    for (const hunk of file.hunks) {
      for (const line of hunk.lines) {
        if (line.kind !== 'add' || line.newLineNo === undefined) {
          continue;
        }

        for (const rule of rules) {
          if (!rule.languages.includes(file.language)) {
            continue;
          }
          if (!rule.test(line.text)) {
            continue;
          }

          const citation: Citation = { file: file.path, line: line.newLineNo };
          const existing = byId.get(rule.id);
          if (existing) {
            const alreadyCited = existing.citations.some(
              (c) => c.file === citation.file && c.line === citation.line,
            );
            if (!alreadyCited) {
              existing.citations.push(citation);
            }
          } else {
            byId.set(rule.id, {
              id: rule.id,
              label: rule.label,
              why: rule.why,
              citations: [citation],
            });
          }
        }
      }
    }
  }

  return [...byId.values()];
}
