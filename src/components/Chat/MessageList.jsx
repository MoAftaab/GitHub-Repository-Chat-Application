import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './MessageList.css';

function extractCodeBlocks(text) {
  const codeRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const segments = [];
  let lastIndex = 0;
  let match;

  while ((match = codeRegex.exec(text)) !== null) {
    // Add text before code block
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        content: text.slice(lastIndex, match.index)
      });
    }

    // Add code block
    segments.push({
      type: 'code',
      language: match[1] || 'text',
      content: match[2].trim()
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    segments.push({
      type: 'text',
      content: text.slice(lastIndex)
    });
  }

  return segments;
}

function MessageSegment({ segment }) {
  if (segment.type === 'code') {
    return (
      <div className="code-block">
        <div className="code-header">
          <span className="language">{segment.language}</span>
        </div>
        <SyntaxHighlighter
          language={segment.language}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            borderRadius: '0 0 4px 4px',
          }}
        >
          {segment.content}
        </SyntaxHighlighter>
      </div>
    );
  }
  return <p className="message-text">{segment.content}</p>;
}

function Message({ message }) {
  const segments = extractCodeBlocks(message.text);
  
  return (
    <div className={`message ${message.sender} ${message.isError ? 'error' : ''}`}>
      <div className="message-content">
        {segments.map((segment, index) => (
          <MessageSegment key={index} segment={segment} />
        ))}
      </div>
    </div>
  );
}

function MessageList({ messages }) {
  const messagesEndRef = React.useRef(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="message-list">
      {messages.map((message, index) => (
        <Message key={index} message={message} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}

export default MessageList;
