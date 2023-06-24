import React from 'react';
import { colorizeMessage, leanColorize } from '../lib/utils';
import { GoalWidgetProps } from './types';

interface GoalProps {
  goalState: string | undefined;
  darkMode: boolean;
}

export function Goal(props: GoalProps): React.ReactNode {
  if (!props.goalState) {
    return null;
  }
  let goalString = props.goalState.replace(/^(no goals)/gm, 'goals accomplished 🎉');
  goalString = RegExp('^\\d+ goals|goals accomplished', 'mg').test(goalString)
    ? goalString
    : '1 goal\n'.concat(goalString);
  const goalElem = colorizeMessage(goalString, props.darkMode);
  return (
    <div>
      <pre className="font-code" style={{ whiteSpace: 'pre-wrap' }}>
        {goalElem}
      </pre>
    </div>
  );
}

export function GoalWidget({ goal, position, darkMode }: GoalWidgetProps) {
  const tacticHeader = goal.text && (
    <div className="info-header doc-header">
      {position.line}:{position.column}: tactic{' '}
      {
        <span className="code-block" style={{ fontWeight: 'normal', display: 'inline' }}>
          {goal.text}
        </span>
      }
    </div>
  );
  const docs = goal.doc && <ToggleDoc doc={goal.doc} />;

  const typeHeader = goal.type && (
    <div className="info-header">
      {position.line}:{position.column}: type{' '}
      {goal['full-id'] && (
        <span>
          {' '}
          of{' '}
          <span className="code-block" style={{ fontWeight: 'normal', display: 'inline' }}>
            {goal['full-id']}
          </span>
        </span>
      )}
    </div>
  );
  const typeBody = goal.type &&
    !goal.text && ( // don't show type of tactics
      <div
        className="code-block"
        dangerouslySetInnerHTML={{ __html: leanColorize(goal.type) + (!goal.doc && '<br />') }}
      />
    );

  return (
    // put tactic state first so that there's less jumping around when the cursor moves
    <div className="px-3">
      <Goal goalState={goal.state} darkMode={darkMode} />
      {tacticHeader || typeHeader}
      {typeBody}
      {docs}
    </div>
  );
}

interface ToggleDocProps {
  doc: string;
}
interface ToggleDocState {
  showDoc: boolean;
}
class ToggleDoc extends React.Component<ToggleDocProps, ToggleDocState> {
  constructor(props: ToggleDocProps) {
    super(props);
    this.state = { showDoc: this.props.doc.length < 80 };
    this.onClick = this.onClick.bind(this);
  }
  onClick() {
    this.setState({ showDoc: !this.state.showDoc });
  }
  render() {
    return (
      <div onClick={this.onClick} className="toggleDoc">
        {this.state.showDoc ? (
          this.props.doc // TODO: markdown / highlighting?
        ) : (
          <span>
            {this.props.doc.slice(0, 75)} <span style={{ color: '#246' }}>[...]</span>
          </span>
        )}
        <br />
        <br />
      </div>
    );
  }
}
