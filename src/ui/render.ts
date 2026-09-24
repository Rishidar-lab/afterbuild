// The view. Pure-ish DOM rendering of a `Brief` into the report zone
// (`#report`) as four clearly separated sections, and of the `ParsedDiff`
// into the diff panel (`#diff-view`) with `data-file`/`data-line` anchors on
// added lines. See devpost/spec.md > Components > ui/render.ts and
// devpost/prd.md > Features and Behavior (all four sections).
//
// The concept-to-hunk click highlight itself is Slice 6 — this slice only
// emits the anchors (`data-file`/`data-line` on added diff lines, and
// `data-concept-id` on concept-inventory rows) that behavior will attach
// to. No click listeners are wired here yet.

import type { Brief, ParsedDiff } from '../lib/types.js';

interface ElementOptions {
  className?: string;
  text?: string;
  attrs?: Record<string, string>;
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  options: ElementOptions = {},
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (options.className) {
    node.className = options.className;
  }
  if (options.text !== undefined) {
    node.textContent = options.text;
  }
  if (options.attrs) {
    for (const [key, value] of Object.entries(options.attrs)) {
      node.setAttribute(key, value);
    }
  }
  return node;
}

function citationBadge(file: string, line: number): HTMLElement {
  return el('code', {
    className: 'citation-badge',
    text: `${file}:${line}`,
    attrs: { 'data-file': file, 'data-line': String(line) },
  });
}

function renderChangeMap(brief: Brief): HTMLElement {
  const section = el('section', { className: 'brief-section', attrs: { 'aria-label': 'What Changed' } });
  section.appendChild(el('h2', { text: 'What Changed' }));

  const { totalFiles, totalAdded, totalRemoved } = brief.changeMap;
  section.appendChild(
    el('p', {
      className: 'change-map-summary',
      text: `${totalFiles} file${totalFiles === 1 ? '' : 's'} changed, +${totalAdded} / -${totalRemoved} lines.`,
    }),
  );

  if (brief.changeMap.files.length === 0) {
    section.appendChild(el('p', { className: 'empty-note', text: 'No files changed.' }));
    return section;
  }

  const list = el('ul', { className: 'change-map-list' });
  for (const file of brief.changeMap.files) {
    const item = el('li', { className: 'change-map-entry' });
    item.appendChild(el('code', { className: 'file-path', text: file.path }));
    item.appendChild(
      el('span', {
        className: 'change-stats',
        text: ` (${file.language}) +${file.added}/-${file.removed}`,
      }),
    );
    if (file.functions.length > 0) {
      item.appendChild(
        el('div', {
          className: 'change-functions',
          text: `Functions: ${file.functions.join(', ')}`,
        }),
      );
    }
    list.appendChild(item);
  }
  section.appendChild(list);
  return section;
}

function renderConceptInventory(brief: Brief): HTMLElement {
  const section = el('section', {
    className: 'brief-section',
    attrs: { 'aria-label': 'Concept Inventory' },
  });
  section.appendChild(el('h2', { text: 'Concept Inventory' }));

  if (brief.concepts.length === 0) {
    section.appendChild(
      el('p', {
        className: 'empty-note',
        text: 'No notable constructs detected in added lines.',
      }),
    );
    return section;
  }

  const list = el('ul', { className: 'concept-list' });
  for (const concept of brief.concepts) {
    const item = el('li', {
      className: 'concept-entry',
      attrs: { 'data-concept-id': concept.id },
    });
    item.appendChild(el('span', { className: 'concept-label', text: concept.label }));
    item.appendChild(el('p', { className: 'concept-why', text: concept.why }));

    const citations = el('p', { className: 'concept-citations' });
    citations.appendChild(document.createTextNode('Seen in: '));
    concept.citations.forEach((citation, index) => {
      if (index > 0) {
        citations.appendChild(document.createTextNode(', '));
      }
      citations.appendChild(citationBadge(citation.file, citation.line));
    });
    item.appendChild(citations);

    list.appendChild(item);
  }
  section.appendChild(list);
  return section;
}

function renderLearningPath(brief: Brief): HTMLElement {
  const section = el('section', {
    className: 'brief-section',
    attrs: { 'aria-label': 'What to Understand' },
  });
  section.appendChild(el('h2', { text: 'What to Understand' }));

  if (brief.learningPath.length === 0) {
    section.appendChild(
      el('p', {
        className: 'empty-note',
        text: 'Nothing to learn here — no notable constructs were detected.',
      }),
    );
    return section;
  }

  const list = el('ol', { className: 'learning-path-list' });
  for (const item of brief.learningPath) {
    const li = el('li', { className: 'learning-path-entry' });
    li.appendChild(el('span', { className: 'concept-label', text: item.label }));
    li.appendChild(el('p', { className: 'concept-why', text: item.why }));
    list.appendChild(li);
  }
  section.appendChild(list);
  return section;
}

function renderQuiz(brief: Brief): HTMLElement {
  const section = el('section', { className: 'brief-section', attrs: { 'aria-label': 'Quiz' } });
  section.appendChild(el('h2', { text: 'Quiz' }));

  const list = el('ol', { className: 'quiz-list' });
  brief.quiz.forEach((question, index) => {
    const item = el('li', { className: 'quiz-entry' });
    item.appendChild(
      el('p', { className: 'quiz-prompt', text: `${index + 1}. ${question.prompt}` }),
    );

    const details = el('details', { className: 'quiz-answer' });
    details.appendChild(el('summary', { text: 'Show answer' }));
    details.appendChild(el('p', { className: 'quiz-answer-text', text: question.answer }));
    const source = el('p', { className: 'quiz-source' });
    source.appendChild(document.createTextNode('Source: '));
    source.appendChild(citationBadge(question.ref.file, question.ref.line));
    details.appendChild(source);
    item.appendChild(details);

    list.appendChild(item);
  });
  section.appendChild(list);
  return section;
}

/** Renders a `Brief` into `container` (`#report`) as four clearly separated
 * sections: What Changed, Concept Inventory, What to Understand, Quiz. Idempotent —
 * clears any previous contents first, so re-Analyzing simply replaces it. */
export function renderBrief(container: HTMLElement, brief: Brief): void {
  container.replaceChildren(
    renderChangeMap(brief),
    renderConceptInventory(brief),
    renderLearningPath(brief),
    renderQuiz(brief),
  );
}

/** Renders the parsed diff into `container` (`#diff-view`) with
 * `data-file`/`data-line` anchors on every ADDED line, ready for Slice 6's
 * concept-click-to-highlight behavior to target. */
export function renderDiffView(container: HTMLElement, parsed: ParsedDiff): void {
  if (parsed.files.length === 0) {
    container.replaceChildren(el('p', { className: 'empty-note', text: 'Nothing to show.' }));
    return;
  }

  const fragments: HTMLElement[] = [];
  for (const file of parsed.files) {
    const fileBlock = el('div', { className: 'diff-file' });
    fileBlock.appendChild(el('div', { className: 'diff-file-path', text: file.path }));

    for (const hunk of file.hunks) {
      const hunkBlock = el('div', { className: 'diff-hunk' });
      hunkBlock.appendChild(el('div', { className: 'diff-hunk-header', text: hunk.header }));

      for (const line of hunk.lines) {
        const prefix = line.kind === 'add' ? '+' : line.kind === 'del' ? '-' : ' ';
        const attrs: Record<string, string> =
          line.kind === 'add' && line.newLineNo !== undefined
            ? { 'data-file': file.path, 'data-line': String(line.newLineNo) }
            : {};
        hunkBlock.appendChild(
          el('div', {
            className: `diff-line ${line.kind}`,
            text: `${prefix}${line.text}`,
            attrs,
          }),
        );
      }
      fileBlock.appendChild(hunkBlock);
    }
    fragments.push(fileBlock);
  }
  container.replaceChildren(...fragments);
}
