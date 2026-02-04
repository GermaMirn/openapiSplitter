import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { CodeViewerProps } from '../props';

export const CodeViewer: React.FC<CodeViewerProps> = ({
  content,
  language = 'yaml',
  className = '',
}) => {
  return (
    <SyntaxHighlighter
      language={language}
      style={oneLight}
      showLineNumbers
      customStyle={{
        margin: 0,
        padding: 0,
        background: 'transparent',
        fontSize: '0.875rem',
        minHeight: '100%',
      }}
      codeTagProps={{ style: { fontFamily: 'ui-monospace, monospace' } }}
      wrapLongLines
      className={className}
    >
      {content}
    </SyntaxHighlighter>
  );
};
