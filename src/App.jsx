import React, { useState, useEffect, useRef } from 'react';
import LoginButton from './components/Login/LoginButton';
import RepositoryList from './components/Repository/RepositoryList';
import ChatSection from './components/Chat/ChatSection';

/**
 * @component
 * @description Main application component that provides GitHub repository browsing and chat functionality.
 * It handles user authentication, repository selection, file browsing, and chat interactions.
 * @returns {JSX.Element} The rendered application UI
 */
function App() {
    const [accessToken, setAccessToken] = useState(null);
    const [selectedRepo, setSelectedRepo] = useState(null);
    const [repoData, setRepoData] = useState(null);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [repos, setRepos] = useState([]);
    const [messages, setMessages] = useState([]);
    const chatInputRef = useRef(null);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        if (token) {
            setAccessToken(token);
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    useEffect(() => {
        if (accessToken) {
            fetchRepositories();
        }
    }, [accessToken]);

    const handleLogin = () => {
        window.location.href = '/api/auth/github';
    };

    const fetchRepositories = async () => {
        try {
            const response = await fetch(`/api/repos?token=${accessToken}`);
            const repoList = await response.json();
            
            if (!response.ok) {
                throw new Error(repoList.error || 'Failed to fetch repositories');
            }
            setRepos(repoList);
        } catch (error) {
            console.error('Error fetching repositories:', error);
            addMessage('Assistant', 'Failed to load repositories. Please try logging in again.');
        }
    };

    const handleRepoSelect = (repoFullName) => {
        if (selectedRepo === repoFullName) return;

        setSelectedRepo(repoFullName);
        setSelectedFiles([]);
        fetchRepoData(repoFullName);

        const [owner, repo] = repoFullName.split('/');
        addMessage('Assistant', `Now chatting with ${owner}/${repo}. Select files to ask specific questions about them, or ask general questions about the repository.`);
    };

    const fetchRepoData = async (repoFullName) => {
        try {
            const [owner, repo] = repoFullName.split('/');
            const response = await fetch(`/api/repos/${owner}/${repo}?token=${accessToken}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch repository data');
            }

            setRepoData({
                ...data,
                token: accessToken
            });
        } catch (error) {
            console.error('Error fetching repo data:', error);
            addMessage('Assistant', 'Failed to load repository data. Please try again.');
        }
    };

    const fetchCodeDefinitions = async (filePath) => {
        try {
            const response = await fetch(`/api/definitions?token=${accessToken}&repo=${selectedRepo}&file_path=${filePath}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to fetch code definitions for ${filePath}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error fetching code definitions for ${filePath}:`, error);
            addMessage('Assistant', `Failed to fetch code definitions for ${filePath}.`);
            return null;
        }
    };

    const handleSendMessage = async () => {
        const messageText = chatInputRef.current.value.trim();
        if (!messageText) return;

        if (!selectedRepo) {
            addMessage('Assistant', 'Please select a repository first.');
            return;
        }

        chatInputRef.current.value = '';
        addMessage('User', messageText);

        try {
            const loadingId = addMessage('Assistant', 'Thinking...');
            
            let codeDefinitions = [];
            if (selectedFiles.length > 0) {
                const definitionPromises = selectedFiles.map(filePath => 
                    fetchCodeDefinitions(filePath)
                );
                codeDefinitions = await Promise.all(definitionPromises);
                codeDefinitions = codeDefinitions.filter(defs => defs && defs.length > 0).flat();
            }
            
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: messageText,
                    repoData: repoData,
                    filePaths: selectedFiles,
                    codeDefinitions: codeDefinitions
                })
            });

            const data = await response.json();
            removeMessage(loadingId);

            if (!response.ok) {
                throw new Error(data.error || 'Failed to get response');
            }

            addMessage('Assistant', data.response);
        } catch (error) {
            console.error('Chat Error:', error);
            const errorDetails = error.details ? `: ${error.details}` : '';
            addMessage('Assistant', `Error: ${error.message || 'Failed to process your request'}${errorDetails}`);
        }
    };

    const addMessage = (sender, text) => {
        const newMessage = { sender, text, id: Date.now() };
        setMessages(prevMessages => [...prevMessages, newMessage]);
        return newMessage.id;
    };

    const removeMessage = (messageId) => {
        setMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId));
    };

    const handleFileSelect = (path, isSelected) => {
        if (isSelected) {
            setSelectedFiles(prevSelectedFiles => [...prevSelectedFiles, path]);
        } else {
            setSelectedFiles(prevSelectedFiles => prevSelectedFiles.filter(f => f !== path));
        }
    };

    return (
        <>
            {!accessToken ? (
                <LoginButton onLogin={handleLogin} />
            ) : (
                <div id="chatContainer" style={{ display: 'grid' }}>
                    <RepositoryList 
                        repos={repos}
                        selectedRepo={selectedRepo}
                        onRepoSelect={handleRepoSelect}
                        onFileSelect={handleFileSelect}
                    />
                    <ChatSection 
                        messages={messages}
                        inputRef={chatInputRef}
                        onSendMessage={handleSendMessage}
                    />
                </div>
            )}
        </>
    );
}

export default App;
