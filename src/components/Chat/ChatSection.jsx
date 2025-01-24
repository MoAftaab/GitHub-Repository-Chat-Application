import React, { useState, useEffect } from 'react';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import FileTree from '../Repository/FileTree';
import './ChatSection.css';

function ChatSection({ token, selectedRepo }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [error, setError] = useState(null);
  const [files, setFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  // Fetch repository files
  useEffect(() => {
    if (selectedRepo) {
      setLoadingFiles(true);
      setError(null);
      fetch(`/api/repos/${selectedRepo.owner.login}/${selectedRepo.name}/files?token=${token}`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch repository files');
          return res.json();
        })
        .then(data => {
          setFiles(data);
          setLoadingFiles(false);
        })
        .catch(err => {
          console.error('Error fetching files:', err);
          setError('Failed to load repository files. Please try again.');
          setLoadingFiles(false);
        });
    }
  }, [selectedRepo, token]);

  const handleSendMessage = async (message) => {
    try {
      setLoading(true);
      setError(null);
      
      // Add user message to chat
      const userMessage = { text: message, sender: 'user' };
      setMessages(prev => [...prev, userMessage]);

      // Prepare selected file contents and fetch code
      const fileData = await Promise.all(
        selectedFiles.map(async file => {
          try {
            const response = await fetch(
              `/api/repos/${selectedRepo.owner.login}/${selectedRepo.name}/contents/${file}?token=${token}`
            );
            if (!response.ok) throw new Error(`Failed to fetch ${file}`);
            const data = await response.json();
            return {
              path: file,
              content: data.content,
              language: file.split('.').pop() || 'text'
            };
          } catch (err) {
            console.error(`Error fetching ${file}:`, err);
            throw new Error(`Failed to fetch ${file}`);
          }
        })
      );

      // Send chat message to server with file contents
      const response = await fetch('/api/chat?token=' + token, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          repoData: selectedRepo,
          files: fileData,
          codeDefinitions: fileData.map(f => {
            const lang = f.path.split('.').pop() || 'text';
            return `Content of ${f.path}:\n\`\`\`${lang}\n${f.content}\n\`\`\``;
          })
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');
      
      const data = await response.json();
      
      // Add AI response to chat
      const aiMessage = { text: data.response, sender: 'ai' };
      setMessages(prev => [...prev, aiMessage]);
      
    } catch (err) {
      console.error('Chat error:', err);
      setError('Failed to process message. Please try again.');
      
      // Add error message to chat
      const errorMessage = { 
        text: 'Sorry, I encountered an error. Please try again.', 
        sender: 'ai',
        isError: true 
      };
      setMessages(prev => [...prev, errorMessage]);
      
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (filePath) => {
    setSelectedFiles(prev => {
      const isSelected = prev.includes(filePath);
      if (isSelected) {
        return prev.filter(f => f !== filePath);
      } else {
        return [...prev, filePath];
      }
    });
  };

  return (
    <div className="chat-section">
      <div className="repository-info">
        <h2>{selectedRepo?.name}</h2>
        <p>{selectedRepo?.description || 'No description available'}</p>
      </div>

      {loadingFiles ? (
        <div className="loading">Loading repository files...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <>
          <FileTree
            files={files}
            selectedFiles={selectedFiles}
            onFileSelect={handleFileSelect}
          />
          
          <MessageList messages={messages} />
          
          <ChatInput 
            onSendMessage={handleSendMessage} 
            loading={loading}
            disabled={loadingFiles || loading}
          />
        </>
      )}
    </div>
  );
}

export default ChatSection;
