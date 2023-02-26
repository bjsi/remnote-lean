import * as monaco from 'monaco-editor';

export function leanColorize(text: string): string {
  // TODO(gabriel): use promises
  const colorized: string = (monaco.editor.colorize(text, 'lean', {}) as any)._value;
  return colorized?.replace(/&nbsp;/g, ' ');
}
