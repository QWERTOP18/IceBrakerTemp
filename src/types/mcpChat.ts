// MCP Chat Types
export interface McpChatRequest {
  datetime: string;
  content: string;
}

export interface McpChat {
  datetime: string;
  content: string;
  reply: string;
}
