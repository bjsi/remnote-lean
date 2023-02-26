import { Message } from 'lean-client-js-browser';
import React from 'react';
import {
  getAllMessages,
  currentlyRunning,
  getServer,
  registerLeanLanguage,
} from '../lib/langservice';
import { GoalWidget } from './GoalWidget';
import { MessageWidget } from './MessageWidget';
import { DisplayMode, GoalWidgetProps, Position } from './types';
import * as monaco from 'monaco-editor';
import { RNPlugin } from '@remnote/plugin-sdk';

interface InfoViewProps {
  plugin: RNPlugin;
  onSave: () => void;
  file: string;
  cursor?: Position;
}
interface InfoViewState {
  goal?: GoalWidgetProps;
  messages: Message[];
  displayMode: DisplayMode;
}

export class InfoView extends React.Component<InfoViewProps, InfoViewState> {
  private subscriptions: monaco.IDisposable[] = [];

  constructor(props: InfoViewProps) {
    super(props);
    this.state = {
      messages: [],
      displayMode: DisplayMode.OnlyState,
    };
  }
  componentWillMount() {
    registerLeanLanguage();
    this.updateMessages(this.props);
    let timer: NodeJS.Timeout | undefined = undefined; // debounce
    this.subscriptions.push(
      getServer().allMessages.on((allMsgs) => {
        if (timer) {
          clearTimeout(timer);
        }
        timer = setTimeout(() => {
          this.updateMessages(this.props);
          this.refreshGoal(this.props);
        }, 100);
      })
    );
  }
  componentWillUnmount() {
    for (const s of this.subscriptions) {
      s.dispose();
    }
    this.subscriptions = [];
  }
  componentWillReceiveProps(nextProps: InfoViewProps) {
    if (nextProps.cursor === this.props.cursor) {
      return;
    }
    this.updateMessages(nextProps);
    this.refreshGoal(nextProps);
  }

  updateMessages(nextProps: InfoViewProps) {
    this.setState({
      messages: getAllMessages().filter((v) => v.file_name === this.props.file),
    });
  }

  refreshGoal(nextProps?: InfoViewProps) {
    if (!nextProps) {
      nextProps = this.props;
    }
    if (!nextProps.cursor) {
      return;
    }

    const position = nextProps.cursor;
    getServer()
      .info(nextProps.file, position.line, position.column)
      .then((res) => {
        if (res.record) {
          this.setState({ goal: { goal: res.record, position } });
        }
      });
  }

  render() {
    const filteredMsgs =
      this.state.displayMode === DisplayMode.AllMessage
        ? this.state.messages
        : this.state.messages.filter(({ pos_col, pos_line, end_pos_col, end_pos_line }) => {
            if (!this.props.cursor) {
              return false;
            }
            const { line, column } = this.props.cursor;
            return (
              pos_line <= line &&
              ((!end_pos_line && line === pos_line) || line <= end_pos_line) &&
              (line !== pos_line || pos_col <= column) &&
              (line !== end_pos_line || end_pos_col >= column)
            );
          });
    const msgs = filteredMsgs.map((msg, i) => <div key={i}>{MessageWidget({ msg })}</div>);
    return (
      <div style={{ overflow: 'auto', height: '100%' }}>
        <div className="infoview-buttons flex flex-row gap-2">
          <img
            src={this.props.plugin.rootURL + '/display-goal-light.svg'}
            title="Display Goal"
            style={{ opacity: this.state.displayMode === DisplayMode.OnlyState ? 1 : 0.25 }}
            onClick={() => {
              this.setState({ displayMode: DisplayMode.OnlyState });
            }}
          />
          <span>Goal</span>
          <img
            src={this.props.plugin.rootURL + './display-list-light.svg'}
            title="Display Messages"
            style={{ opacity: this.state.displayMode === DisplayMode.AllMessage ? 1 : 0.25 }}
            onClick={() => {
              this.setState({ displayMode: DisplayMode.AllMessage });
            }}
          />
          <span>All Messages</span>
          <button
            onClick={() => {
              this.props.onSave();
            }}
          >
            💾 Save
          </button>
        </div>
        {this.state.displayMode === DisplayMode.OnlyState && this.state.goal && (
          <div key={'goal'}>
            <GoalWidget goal={this.state.goal.goal} position={this.state.goal.position} />
          </div>
        )}
        {msgs}
      </div>
    );
  }
}
