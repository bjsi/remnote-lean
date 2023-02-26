import { usePlugin, renderWidget } from '@remnote/plugin-sdk';
import { LeanEditor } from '../components/LeanEditor';
import * as monaco from 'monaco-editor';

const defaultValue = `
#eval let v := lean.version in let s := lean.special_version_desc in string.join
["Lean (version ", v.1.repr, ".", v.2.1.repr, ".", v.2.2.repr, ", ",
if s ≠ "" then s ++ ", " else s, "commit ", (lean.githash.to_list.take 12).as_string, ")"]

example (m n : ℕ) : m + n = n + m :=
by simp [nat.add_comm]`;

export const SampleWidget = () => {
  const plugin = usePlugin();
  const fn = monaco.Uri.file('test.lean').fsPath;

  return <LeanEditor file={fn} initialValue={defaultValue} onValueChange={() => {}} />;
};

renderWidget(SampleWidget);
