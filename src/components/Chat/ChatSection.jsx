import React from 'react';
import PropTypes from 'prop-types';
import MessageList from './MessageList';
import ChatInput from './ChatInput';

/**
 * @component
 * @description Main chat section component that displays messages and input area
 */
const ChatSection = ({ 
    messages, 
    inputRef, 
    onSendMessage 
}) => {
    return (
        <section id="chatSection">
            <MessageList messages={messages} />
            <ChatInput 
                inputRef={inputRef}
                onSendMessage={onSendMessage}
            />
        </section>
    );
};

ChatSection.propTypes = {
    messages: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number.isRequired,
        sender: PropTypes.string.isRequired,
        text: PropTypes.string.isRequired
    })).isRequired,
    inputRef: PropTypes.shape({
        current: PropTypes.any
    }).isRequired,
    onSendMessage: PropTypes.func.isRequired
};

export default ChatSection;
