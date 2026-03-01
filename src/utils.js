import pc from 'picocolors';
import { resolve, sep } from 'node:path';

const VALID_NAME = /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/;

export function validateName(name) {
  if (!name || !VALID_NAME.test(name)) {
    throw new Error(
      `Invalid name "${name}". Names must contain only letters, numbers, hyphens, dots, and underscores.`
    );
  }
}

export function assertPathWithin(childPath, parentPath) {
  const resolved = resolve(childPath);
  const parent = resolve(parentPath) + sep;
  if (!resolved.startsWith(parent)) {
    throw new Error(`Path "${childPath}" escapes the expected directory`);
  }
}

export const log = {
  info: (msg) => console.log(pc.cyan('i') + ' ' + msg),
  success: (msg) => console.log(pc.green('✓') + ' ' + msg),
  warn: (msg) => console.log(pc.yellow('!') + ' ' + msg),
  error: (msg) => console.error(pc.red('✗') + ' ' + msg),
  dim: (msg) => console.log(pc.dim(msg)),
};

export function formatTable(rows, headers) {
  const cols = headers.length;
  const widths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map((r) => String(r[i] || '').length))
  );

  const sep = widths.map((w) => '─'.repeat(w + 2)).join('┼');
  const formatRow = (row) =>
    row.map((cell, i) => ` ${String(cell).padEnd(widths[i])} `).join('│');

  const lines = [
    pc.dim(formatRow(headers)),
    pc.dim(sep),
    ...rows.map((r) => formatRow(r)),
  ];

  return lines.join('\n');
}

export function plural(count, word) {
  return `${count} ${word}${count !== 1 ? 's' : ''}`;
}
