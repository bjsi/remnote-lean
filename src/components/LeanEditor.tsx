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
import { partition } from '../lib/utils';

interface LeanEditorProps {
  remId: string;
  includeRemIds?: string[];
  plugin: RNPlugin;
  file: string;
  initialValue: string;
  onValueChange?: (value: string) => void;
  isDarkMode: boolean;
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

interface IMyStandaloneCodeEditor extends monaco.editor.IStandaloneCodeEditor {
  // used for importing hidden code from other Rem
  setHiddenAreas(range: monaco.IRange[]): void;
}

export class LeanEditor extends React.Component<LeanEditorProps, LeanEditorState> {
  editor: IMyStandaloneCodeEditor | undefined;
  constructor(props: LeanEditorProps) {
    super(props);
    this.state = {
      split: 'vertical',
      status: null,
      size: null,
      checked: true,
      lastFileName: this.props.file,
    };
    this.initModel();
  }

  async getExtraHiddenCode() {
    const rems = (await this.props.plugin.rem.findMany(this.props.includeRemIds || [])) || [];

    // make it work in such a way that I can still add extra imports to the code if needed

    // TODO
    const codes = await Promise.all(
      rems.map(async (x) => this.props.plugin.richText.toString(x.text))
    );
    // code without imports
    const code: string[] = [];
    // unique imports
    const imports: string[] = [];

    for (const c of codes) {
      const [importCode, codeCode] = partition(c.split('\n'), (x) => x.trim().startsWith('import'));
      code.push(codeCode.join('\n'));
      imports.push(...importCode);
    }

    return;
  }

  initModel() {
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
      return (!e.isFlush || !val) && this.props.onValueChange && this.props.onValueChange(val);
    });
  }
  componentDidUpdate(
    prevProps: Readonly<LeanEditorProps>,
    prevState: Readonly<LeanEditorState>,
    snapshot?: any
  ): void {
    if (this.props.isDarkMode != prevProps.isDarkMode) {
      monaco.editor.setTheme(this.props.isDarkMode ? 'vs-dark' : 'vs');
    }
  }

  componentDidMount() {
    const node = findDOMNode(this.refs.monaco) as HTMLElement;
    const DEFAULT_FONT_SIZE = 16;
    const options: monaco.editor.IStandaloneEditorConstructionOptions = {
      selectOnLineNumbers: true,
      roundedSelection: false,
      readOnly: false,
      theme: 'vs',
      cursorStyle: 'line',
      automaticLayout: true,
      cursorBlinking: 'solid',
      model: model,
      minimap: { enabled: false },
      wordWrap: 'on',
      scrollBeyondLastLine: false,
      fontSize: DEFAULT_FONT_SIZE,
    };
    this.editor = monaco.editor.create(node, options) as IMyStandaloneCodeEditor;

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
