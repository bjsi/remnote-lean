import * as monaco from 'monaco-editor';

export function leanColorize(text: string): string {
  // TODO(gabriel): use promises
  const colorized: string = (monaco.editor.colorize(text, 'lean', {}) as any)._value;
  return colorized?.replace(/&nbsp;/g, ' ');
}

export function partition<T>(arr: T[], pred: (x: T) => boolean): [T[], T[]] {
  const left: T[] = [];
  const right: T[] = [];
  for (const x of arr) {
    if (pred(x)) {
      left.push(x);
    } else {
      right.push(x);
    }
  }
  return [left, right];
}
