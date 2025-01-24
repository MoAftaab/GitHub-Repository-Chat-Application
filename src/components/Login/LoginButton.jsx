import React from 'react';
import PropTypes from 'prop-types';

/**
 * @component
 * @description A button component that handles GitHub authentication
 */
const LoginButton = ({ onLogin }) => {
    return (
        <div id="loginContainer">
            <button id="loginBtn" onClick={onLogin}>
                Login with GitHub
            </button>
        </div>
    );
};

LoginButton.propTypes = {
    onLogin: PropTypes.func.isRequired
};

export default LoginButton;
