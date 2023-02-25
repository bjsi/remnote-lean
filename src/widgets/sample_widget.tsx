import { usePlugin, renderWidget, useTracker } from '@remnote/plugin-sdk';
import { Position } from 'monaco-editor';
import React from 'react';
import * as monaco from 'monaco-editor';
import { checkInputCompletionChange } from '../lib/langservice';
interface LeanEditorProps {
  file: string;
  initialValue: string;
  onValueChange?: (value: string) => void;
  initialUrl: string;
  onUrlChange?: (value: string) => void;
  clearUrlParam: () => void;
}
interface LeanEditorState {
  cursor?: Position;
  split: 'vertical' | 'horizontal';
  url: string;
  status: string;
  size: number;
  checked: boolean;
  lastFileName: string;
}
class LeanEditor extends React.Component<LeanEditorProps, LeanEditorState> {
  model: monaco.editor.IModel;
  editor: monaco.editor.IStandaloneCodeEditor;
  constructor(props: LeanEditorProps) {
    super(props);
    this.state = {
      split: 'vertical',
      url: this.props.initialUrl,
      status: null,
      size: null,
      checked: true,
      lastFileName: this.props.file,
    };
    this.model = monaco.editor.createModel(
      this.props.initialValue,
      'lean',
      monaco.Uri.file(this.props.file)
    );
    this.model.updateOptions({ tabSize: 2 });
    this.model.onDidChangeContent((e) => {
      checkInputCompletionChange(e, this.editor, this.model);
      const val = this.model.getValue();

      // do not change code URL param unless user has actually typed
      // (this makes the #url=... param a little more "sticky")
      return (!e.isFlush || !val) && this.props.onValueChange && this.props.onValueChange(val);
    });

    this.updateDimensions = this.updateDimensions.bind(this);
    this.dragFinished = this.dragFinished.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onSave = this.onSave.bind(this);
    this.onLoad = this.onLoad.bind(this);
    this.onChecked = this.onChecked.bind(this);
  }
  componentDidMount() {
    /* TODO: factor this out */
    const ta = document.createElement('div');
    ta.style.fontSize = '1px';
    ta.style.lineHeight = '1';
    ta.innerHTML = 'a';
    document.body.appendChild(ta);
    const minimumFontSize = ta.clientHeight;
    ta.remove();
    const node = findDOMNode(this.refs.monaco) as HTMLElement;
    const DEFAULT_FONT_SIZE = 12;
    const options: monaco.editor.IEditorConstructionOptions = {
      selectOnLineNumbers: true,
      roundedSelection: false,
      readOnly: false,
      theme: 'vs',
      cursorStyle: 'line',
      automaticLayout: true,
      cursorBlinking: 'solid',
      model: this.model,
      minimap: { enabled: false },
      wordWrap: 'on',
      scrollBeyondLastLine: false,
      fontSize: Math.max(DEFAULT_FONT_SIZE, minimumFontSize),
    };
    this.editor = monaco.editor.create(node, options);

    // context key which keeps track of whether unicode translation is possible
    const canTranslate = this.editor.createContextKey('canTranslate', false);
    this.editor.addCommand(
      monaco.KeyCode.Tab,
      () => {
        tabHandler(this.editor, this.model);
      },
      'canTranslate'
    );
    this.editor.onDidChangeCursorPosition((e) => {
      canTranslate.set(checkInputCompletionPosition(e, this.editor, this.model));
      this.setState({ cursor: { line: e.position.lineNumber, column: e.position.column - 1 } });
    });

    this.determineSplit();
    window.addEventListener('resize', this.updateDimensions);
  }
  componentWillUnmount() {
    this.editor.dispose();
    this.editor = undefined;
    window.removeEventListener('resize', this.updateDimensions);
  }
  componentDidUpdate() {
    // if state url is not null, fetch, then set state url to null again
    if (this.state.url) {
      fetch(this.state.url)
        .then((s) => s.text())
        .then((s) => {
          this.model.setValue(s);
          this.setState({ status: null });
        })
        .catch((e) => this.setState({ status: e.toString() }));
      this.setState({ url: null });
    }
  }

  updateDimensions() {
    this.determineSplit();
  }
  determineSplit() {
    const node = findDOMNode(this.refs.root) as HTMLElement;
    this.setState({
      split: node.clientHeight > 0.8 * node.clientWidth ? 'horizontal' : 'vertical',
    });
    // can we reset the pane "size" when split changes?
  }
  dragFinished(newSize) {
    this.setState({ size: newSize });
  }

  onSubmit(value) {
    const lastFileName = value.split('#').shift().split('?').shift().split('/').pop();
    this.props.onUrlChange(value);
    this.setState({ url: value, lastFileName });
  }

  onSave() {
    const file = new Blob([this.model.getValue()], { type: 'text/plain' });
    const a = document.createElement('a');
    const url = URL.createObjectURL(file);
    a.href = url;
    a.download = this.state.lastFileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  }
  onLoad(fileStr, lastFileName) {
    this.model.setValue(fileStr);
    this.props.clearUrlParam();
    this.setState({ lastFileName });
  }

  onChecked() {
    this.setState({ checked: !this.state.checked });
  }

  render() {
    const infoStyle = {
      height:
        this.state.size && this.state.split === 'horizontal'
          ? `calc(95vh - ${this.state.checked ? 115 : 0}px - ${this.state.size}px)`
          : this.state.split === 'horizontal'
          ? // crude hack to set initial height if horizontal
            `calc(35vh - ${this.state.checked ? 45 : 0}px)`
          : '100%',
      width:
        this.state.size && this.state.split === 'vertical'
          ? `calc(98vw - ${this.state.size}px)`
          : this.state.split === 'vertical'
          ? '38vw'
          : '99%',
    };
    return (
      <div className="leaneditorContainer">
        <div className="headerContainer">
          <PageHeader
            file={this.props.file}
            url={this.props.initialUrl}
            onSubmit={this.onSubmit}
            clearUrlParam={this.props.clearUrlParam}
            status={this.state.status}
            onSave={this.onSave}
            onLoad={this.onLoad}
            onChecked={this.onChecked}
          />
        </div>
        <div className="editorContainer" ref="root">
          <SplitPane
            split={this.state.split}
            defaultSize="60%"
            allowResize={true}
            onDragFinished={this.dragFinished}
          >
            <div ref="monaco" className="monacoContainer" />
            <div className="infoContainer" style={infoStyle}>
              <InfoView file={this.props.file} cursor={this.state.cursor} />
            </div>
          </SplitPane>
        </div>
      </div>
    );
  }
}

const defaultValue = `-- Live ${
  (self as any).WebAssembly ? 'WebAssembly' : 'JavaScript'
} version of Lean
#eval let v := lean.version in let s := lean.special_version_desc in string.join
["Lean (version ", v.1.repr, ".", v.2.1.repr, ".", v.2.2.repr, ", ",
if s ≠ "" then s ++ ", " else s, "commit ", (lean.githash.to_list.take 12).as_string, ")"]

example (m n : ℕ) : m + n = n + m :=
by simp [nat.add_comm]`;

export const SampleWidget = () => {
  const plugin = usePlugin();

  let name = useTracker(() => plugin.settings.getSetting<string>('name'));
  let likesPizza = useTracker(() => plugin.settings.getSetting<boolean>('pizza'));
  let favoriteNumber = useTracker(() => plugin.settings.getSetting<number>('favorite-number'));

  return (
    <div className="p-2 m-2 rounded-lg rn-clr-background-light-positive rn-clr-content-positive">
      <h1 className="text-xl">Sample Plugin</h1>
      <div>
        Hi {name}, you {!!likesPizza ? 'do' : "don't"} like pizza and your favorite number is{' '}
        {favoriteNumber}!
      </div>
    </div>
  );
};

renderWidget(SampleWidget);
