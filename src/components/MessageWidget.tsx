import { Message } from 'lean-client-js-browser';
import { leanColorize } from '../lib/utils';

interface MessageWidgetProps {
  msg: Message;
}

export function MessageWidget({ msg }: MessageWidgetProps) {
  const colorOfSeverity = {
    information: 'green',
    warning: 'orange',
    error: 'red',
  };

  console.log(msg);
  // TODO: links and decorations on hover
  return (
    <div style={{ paddingBottom: '1em' }}>
      <div className="info-header" style={{ color: colorOfSeverity[msg.severity] }}>
        {msg.pos_line}:{msg.pos_col}: {msg.severity}: {msg.caption}
      </div>
      <div className="code-block" dangerouslySetInnerHTML={{ __html: leanColorize(msg.text) }} />
    </div>
  );
}
