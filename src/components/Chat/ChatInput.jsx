import React from 'react';
import PropTypes from 'prop-types';

/**
 * @component
 * @description Input component for typing and sending chat messages
 */
const ChatInput = ({ inputRef, onSendMessage }) => {
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            onSendMessage();
        }
    };

    return (
        <div id="inputArea">
            <input 
                type="text" 
                id="chatInput" 
                placeholder="Type your message here" 
                ref={inputRef}
                onKeyPress={handleKeyPress}
            />
            <button 
                id="sendBtn" 
                onClick={onSendMessage}
            >
                Send
            </button>
        </div>
    );
};

ChatInput.propTypes = {
    inputRef: PropTypes.shape({
        current: PropTypes.any
    }).isRequired,
    onSendMessage: PropTypes.func.isRequired
};

export default ChatInput;
