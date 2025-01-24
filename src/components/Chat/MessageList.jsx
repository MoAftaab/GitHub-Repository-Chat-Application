import React from 'react';
import PropTypes from 'prop-types';

/**
 * @component
 * @description Displays a list of chat messages between the user and assistant
 */
const MessageList = ({ messages }) => {
    return (
        <div id="messages">
            {messages.map(msg => (
                <div 
                    key={msg.id} 
                    className={`message ${msg.sender.toLowerCase()}-message`}
                >
                    {msg.text}
                </div>
            ))}
        </div>
    );
};

MessageList.propTypes = {
    messages: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number.isRequired,
        sender: PropTypes.string.isRequired,
        text: PropTypes.string.isRequired
    })).isRequired
};

export default MessageList;
