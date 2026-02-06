import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { CodeViewerProps } from '../props';

export const CodeViewer: React.FC<CodeViewerProps> = ({ content, language = 'yaml', className = '' }) => {
  return (
    <div className={className}>
      <SyntaxHighlighter
        language={language}
        style={oneLight}
        showLineNumbers
        customStyle={{
          margin: 0,
          padding: '1rem',
          background: 'transparent',
          fontSize: '0.875rem',
        }}
        wrapLongLines
      >
        {content}
      </SyntaxHighlighter>
    </div>
  );
};
