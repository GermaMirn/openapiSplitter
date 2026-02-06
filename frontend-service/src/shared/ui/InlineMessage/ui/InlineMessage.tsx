import React from 'react';
import { Message } from 'primereact/message';
import type { InlineMessageProps } from '../props';

export const InlineMessage: React.FC<InlineMessageProps> = ({
  message,
  severity,
  className = '',
}) => {
  return (
    <Message
      severity={severity}
      text={message}
      className={`flex justify-start ${className}`}
    />
  );
};
