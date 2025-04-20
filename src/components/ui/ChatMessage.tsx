import React from 'react';
import { McpChat } from '../../types/mcpChat';

interface ChatMessageProps {
  message: McpChat;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  return (
    <div className="mb-6">
      {/* User message */}
      <div className="flex mb-3">
        <div className="ml-auto max-w-[80%] bg-indigo-100 p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-800">{message.content}</p>
        </div>
      </div>
      
      {/* AI response */}
      <div className="flex mb-3">
        <div className="max-w-[80%] bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-800">{message.reply}</p>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
