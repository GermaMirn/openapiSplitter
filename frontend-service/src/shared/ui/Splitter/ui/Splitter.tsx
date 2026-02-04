import React from 'react';
import { Splitter as PrimeSplitter, SplitterPanel } from 'primereact/splitter';
import type { AppSplitterProps } from '../props';

export const Splitter: React.FC<AppSplitterProps> = ({
  left,
  right,
  leftSize = 30,
  leftMinSize = 15,
  height = '100%',
  className = '',
}) => {
  const rightSize = 100 - leftSize;

  return (
    <PrimeSplitter
      style={{ height }}
      className={className}
    >
      <SplitterPanel size={leftSize} minSize={leftMinSize} className="overflow-auto">
        {left}
      </SplitterPanel>
      <SplitterPanel size={rightSize} className="overflow-auto">
        {right}
      </SplitterPanel>
    </PrimeSplitter>
  );
};
