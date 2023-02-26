import { Position } from 'monaco-editor';
import React from 'react';
import * as monaco from 'monaco-editor';
import {
  checkInputCompletionChange,
  checkInputCompletionPosition,
  ModelWatcher,
  setWatchers,
  tabHandler,
} from '../lib/langservice';
import { findDOMNode } from 'react-dom';
import { PageHeader } from './PageHeader';
import { InfoView } from './InfoView';
import { RNPlugin } from '@remnote/plugin-sdk';

interface LeanEditorProps {
  remId: string;
  plugin: RNPlugin;
  file: string;
  initialValue: string;
  onValueChange?: (value: string) => void;
}
interface LeanEditorState {
  cursor?: Position;
  split: 'vertical' | 'horizontal';
  status: string | null;
  size: number | null;
  checked: boolean;
  lastFileName: string;
}

let model: monaco.editor.IModel;

export class LeanEditor extends React.Component<LeanEditorProps, LeanEditorState> {
  editor: monaco.editor.IStandaloneCodeEditor | undefined;
  constructor(props: LeanEditorProps) {
    super(props);
    this.state = {
      split: 'vertical',
      status: null,
      size: null,
      checked: true,
      lastFileName: this.props.file,
    };
    if (!model) {
      model = monaco.editor.createModel(
        this.props.initialValue,
        'lean',
        monaco.Uri.file(this.props.file)
      );
      setWatchers((w) => w.set(monaco.Uri.file(this.props.file).fsPath, new ModelWatcher(model)));
    }
    model.updateOptions({ tabSize: 2 });
    model.onDidChangeContent((e) => {
      checkInputCompletionChange(e, this.editor!, model);
      const val = model.getValue();

      // do not change code URL param unless user has actually typed
      // (this makes the #url=... param a little more "sticky")
      return (!e.isFlush || !val) && this.props.onValueChange && this.props.onValueChange(val);
    });
  }

  componentDidMount() {
    const node = findDOMNode(this.refs.monaco) as HTMLElement;
    const DEFAULT_FONT_SIZE = 16;
    const options: monaco.editor.IStandaloneEditorConstructionOptions = {
      selectOnLineNumbers: true,
      roundedSelection: false,
      readOnly: false,
      theme: 'vs-dark',
      cursorStyle: 'line',
      automaticLayout: true,
      cursorBlinking: 'solid',
      model: model,
      minimap: { enabled: false },
      wordWrap: 'on',
      scrollBeyondLastLine: false,
      fontSize: DEFAULT_FONT_SIZE,
    };
    this.editor = monaco.editor.create(node, options);

    // context key which keeps track of whether unicode translation is possible
    const canTranslate = this.editor.createContextKey<boolean>('canTranslate', false);
    this.editor.addCommand(
      monaco.KeyCode.Tab,
      () => {
        tabHandler(this.editor!, model);
      },
      'canTranslate'
    );

    this.editor.onDidChangeCursorPosition((e) => {
      canTranslate.set(checkInputCompletionPosition(e, this.editor!, model));
      this.setState({ cursor: { line: e.position.lineNumber, column: e.position.column - 1 } });
    });
  }
  componentWillUnmount() {
    this.editor?.dispose();
    this.editor = undefined;
  }

  onSubmit(value: string) {
    const lastFileName = value.split('#').shift().split('?').shift().split('/').pop();
    this.setState({ url: value, lastFileName });
  }

  onLoad(fileStr: string, lastFileName: string) {
    model.setValue(fileStr);
    this.setState({ lastFileName });
  }

  onChecked() {
    this.setState({ checked: !this.state.checked });
  }

  render() {
    return (
      <div className="leaneditorContainer min-height-[100%] max-h-[100%] h-[100%] py-2 box-border">
        <div className="headerContainer">
          <PageHeader file={this.props.file} status={this.state.status!} />
        </div>
        <div className="editorContainer" ref="root">
          <div
            ref="monaco"
            className="monacoContainer "
            style={{
              height: '60%',
              minHeight: '60%',
              maxHeight: '60%',
            }}
          />
          <div className="infoContainer">
            <InfoView
              onSave={() => {
                this.props.plugin.rem.findOne(this.props.remId).then((rem) => {
                  if (rem) {
                    rem.setBackText([model.getValue()]);
                  }
                });
              }}
              file={this.props.file}
              cursor={this.state.cursor}
              plugin={this.props.plugin}
            />
          </div>
        </div>
      </div>
    );
  }
}
