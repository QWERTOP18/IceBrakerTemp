import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { McpChat } from '../../types/mcpChat';
import mcpChatService from '../../api/mcpChat';
import ChatMessage from './ChatMessage';

const ChatInterface: React.FC = () => {
  const [chatHistory, setChatHistory] = useState<McpChat[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;
    
    setIsLoading(true);
    try {
      const response = await mcpChatService.sendChatMessage(inputMessage);
      setChatHistory(prevHistory => [...prevHistory, response]);
      setInputMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-3 space-y-4" style={{ minHeight: '400px', maxHeight: '600px' }}>
        {chatHistory.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>Start a conversation with MCP</p>
          </div>
        ) : (
          chatHistory.map((message, index) => (
            <ChatMessage key={index} message={message} />
          ))
        )}
      </div>
      
      <div className="p-3 border-t border-gray-200 mt-4">
        <div className="flex items-center">
          <textarea
            className="flex-1 bg-white text-gray-800 border border-gray-300 rounded-l-md p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
            placeholder="Type a message..."
            rows={2}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <button
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-r-md disabled:opacity-50"
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
