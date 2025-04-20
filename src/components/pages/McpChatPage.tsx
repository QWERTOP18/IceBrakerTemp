import React from 'react';
import { MessageCircle } from 'lucide-react';
import ChatInterface from '../ui/ChatInterface';

const McpChatPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex items-center">
        <MessageCircle className="mr-2 text-indigo-600" size={28} />
        <h1 className="text-2xl font-bold">MCP Chat</h1>
      </div>
      
      <div className="card">
        <div className="card-body">
          <ChatInterface />
        </div>
      </div>
    </div>
  );
};

export default McpChatPage;
