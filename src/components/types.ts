import { InfoRecord } from 'lean-client-js-browser';

export interface Position {
  line: number;
  column: number;
}

export enum DisplayMode {
  OnlyState, // only the state at the current cursor position including the tactic state
  AllMessage, // all messages
}

export interface GoalWidgetProps {
  goal: InfoRecord;
  position: Position;
  darkMode: boolean;
}
