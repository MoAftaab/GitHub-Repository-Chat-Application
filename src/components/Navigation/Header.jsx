import React from 'react';
import './Header.css';

function Header({ token, onLogout }) {
  return (
    <header className="app-header">
      <div className="header-title">
        <h1>GitHub Repository Chat</h1>
      </div>
      {token && (
        <button onClick={onLogout} className="logout-button">
          Logout
        </button>
      )}
    </header>
  );
}

export default Header;
