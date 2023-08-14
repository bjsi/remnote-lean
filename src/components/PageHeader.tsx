import React from 'react';
import { currentlyRunning } from '../lib/langservice';
import * as monaco from 'monaco-editor';

interface PageHeaderProps {
  file: string;
  status: string;
}

interface PageHeaderState {
  currentlyRunning: boolean;
}

export class PageHeader extends React.Component<PageHeaderProps, PageHeaderState> {
  private subscriptions: monaco.IDisposable[] = [];

  constructor(props: PageHeaderProps) {
    super(props);
    this.state = { currentlyRunning: true };
  }

  componentWillMount() {
    this.updateRunning(this.props);
    this.subscriptions.push(currentlyRunning.updated.on((fns) => this.updateRunning(this.props)));
  }

  componentWillUnmount() {
    for (const s of this.subscriptions) {
      s.dispose();
    }
    this.subscriptions = [];
  }

  componentWillReceiveProps(nextProps: PageHeaderProps) {
    this.updateRunning(nextProps);
  }

  updateRunning(nextProps: PageHeaderProps) {
    this.setState({
      currentlyRunning: currentlyRunning.value.indexOf(nextProps.file) !== -1,
    });
  }

  render() {
    const isRunning = this.state.currentlyRunning ? 'busy...' : 'ready!';
    const runColor = this.state.currentlyRunning ? 'orange' : 'lightgreen';
    // TODO: add input for delayMs
    // checkbox for console spam
    // server.logMessagesToConsole = true;
    return (
      <div className="">
        <label style={{ background: runColor }} htmlFor="collapsible" tabIndex={0}>
          Lean is {isRunning}
        </label>
      </div>
    );
  }
}
