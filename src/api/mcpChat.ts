import api from './index';
import { McpChat, McpChatRequest } from '../types/mcpChat';

export const mcpChatService = {
  sendChatMessage: async (content: string): Promise<McpChat> => {
    const request: McpChatRequest = {
      datetime: new Date().toISOString(),
      content
    };
    
    const response = await api.post('/mcpchat', request);
    return response.data;
  }
};

export default mcpChatService;
