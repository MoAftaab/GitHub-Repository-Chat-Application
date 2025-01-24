import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Navigation/Header';
import ChatSection from './components/Chat/ChatSection';
import LoginButton from './components/Login/LoginButton';
import RepositoryList from './components/Repository/RepositoryList';
import './App.css';

function App() {
  const [token, setToken] = React.useState(() => {
    // Check URL params first
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    if (urlToken) {
      // Clean up URL
      window.history.replaceState({}, document.title, '/');
      return urlToken;
    }
    // Otherwise check localStorage
    return localStorage.getItem('github_token');
  });

  const [selectedRepo, setSelectedRepo] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (token) {
      localStorage.setItem('github_token', token);
    } else {
      localStorage.removeItem('github_token');
      setSelectedRepo(null);
    }
  }, [token]);

  const handleLogout = () => {
    setToken(null);
    setSelectedRepo(null);
  };

  return (
    <div className="App">
      <Header token={token} onLogout={handleLogout} />
      <main>
        {!token ? (
          <div className="login-container">
            <LoginButton />
          </div>
        ) : (
          <div className="content-container">
            <RepositoryList 
              token={token}
              selectedRepo={selectedRepo}
              onSelectRepo={setSelectedRepo}
              loading={loading}
              setLoading={setLoading}
            />
            {selectedRepo && (
              <ChatSection
                token={token}
                selectedRepo={selectedRepo}
                loading={loading}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
