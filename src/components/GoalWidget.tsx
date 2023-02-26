import React from 'react';
import { leanColorize } from '../lib/utils';
import { GoalWidgetProps } from './types';

export function GoalWidget({ goal, position }: GoalWidgetProps) {
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

  const goalStateHeader = goal.state && (
    <div className="info-header">
      {position.line}:{position.column}: goal
    </div>
  );

  const goalStateBody = goal.state && <pre className="code-block">{goal.state}</pre>;

  return (
    // put tactic state first so that there's less jumping around when the cursor moves
    <div>
      {goalStateHeader}
      {goalStateBody}
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
