import {
  usePlugin,
  renderWidget,
  useRunAsync,
  WidgetLocation,
  DocumentViewer,
} from '@remnote/plugin-sdk';
import { Resizable } from 're-resizable';
import React from 'react';
import { ProofEditor } from '../components/ProofEditor';

const getBoundedWidth = (width: number, minWidth: number, maxWidth: number) =>
  Math.min(Math.max(width, minWidth), maxWidth);

export const PaneProofEditor = () => {
  const plugin = usePlugin();
  const ctx = useRunAsync(() => plugin.widget.getWidgetContext<WidgetLocation.Flashcard>(), []);
  const remId = ctx?.remId;

  const [width, setWidthInner] = React.useState<number>();

  const startWidth = React.useRef<number>();
  const containerRef = React.useRef<HTMLDivElement>(null);

  const setWidth = (width: number, minWidth: number, maxWidth: number) => {
    setWidthInner(getBoundedWidth(width, minWidth, maxWidth));
  };

  if (!remId) {
    return null;
  }
  return (
    <div ref={containerRef} className="flex h-[100%] video-container w-[100%]">
      {width !== 0 && (
        <Resizable
          minWidth="30%"
          maxWidth="70%"
          enable={{ right: true }}
          size={{ width: width || `50%`, height: '100%' }}
          handleClasses={{ right: '!w-[15px] !right-[-15px] z-[3]' }}
          onResizeStart={() => {
            startWidth.current = width;
          }}
          onResize={(___, __, _, delta) => {
            const containerRefCurrent = containerRef.current;

            if (!startWidth.current || !containerRefCurrent) return;
            const newWidth = startWidth.current + delta.width;

            setWidth(
              newWidth || containerRefCurrent.clientWidth * 0.5,
              containerRefCurrent.clientWidth * 0.3,
              containerRefCurrent.clientWidth * 0.7
            );
          }}
          onResizeStop={(___, __, _, delta) => {
            const containerRefCurrent = containerRef.current;

            if (!startWidth.current || !containerRefCurrent) return;
            const newWidth = startWidth.current + delta.width;

            setWidth(
              newWidth || containerRefCurrent.clientWidth * 0.5,
              containerRefCurrent.clientWidth * 0.3,
              containerRefCurrent.clientWidth * 0.7
            );
          }}
        >
          <DocumentViewer width={'100%'} height={'100%'} documentId={remId} />
        </Resizable>
      )}
      <ProofEditor remId={remId} split="vertical" />
    </div>
  );
};

renderWidget(PaneProofEditor);
