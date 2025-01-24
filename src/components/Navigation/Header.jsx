import React from 'react';
import PropTypes from 'prop-types';
import './Header.css';

/**
 * @component
 * @description Main navigation header with logout functionality
 */
const Header = ({ onLogout, userName }) => {
    const handleLogout = () => {
        const confirmLogout = window.confirm('Are you sure you want to logout?');
        if (confirmLogout) {
            // Clear session data
            localStorage.removeItem('accessToken');
            sessionStorage.clear();
            onLogout();
        }
    };

    return (
        <header className="app-header">
            <div className="header-content">
                <div className="header-title">
                    <h1>GitHub Repository Chat</h1>
                    {userName && <span className="user-name">@{userName}</span>}
                </div>
                {userName && (
                    <button 
                        className="logout-button" 
                        onClick={handleLogout}
                        title="Logout"
                    >
                        <span className="logout-icon">⏻</span>
                        <span className="logout-text">Logout</span>
                    </button>
                )}
            </div>
        </header>
    );
};

Header.propTypes = {
    onLogout: PropTypes.func.isRequired,
    userName: PropTypes.string
};

export default Header;
