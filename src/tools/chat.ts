import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import {
  ListChatsInputSchema,
  GetChatInputSchema,
  ListSessionsInputSchema,
  GetSessionInputSchema,
} from '../schemas/index.js';
import { createToolHandler } from './utils.js';
import { vapiGet } from '../vapi-http.js';

export const registerChatTools = (server: McpServer) => {
  server.tool(
    'list_chats',
    'Lists Vapi chats (text-based assistant interactions). Supports filters for assistantId, sessionId, previousChatId, squadId, date ranges, and pagination.',
    ListChatsInputSchema.shape,
    createToolHandler(async (data) => vapiGet('/chat', data))
  );

  server.tool(
    'get_chat',
    'Gets a single Vapi chat by ID, including full message history.',
    GetChatInputSchema.shape,
    createToolHandler(async (data) => vapiGet(`/chat/${data.chatId}`))
  );

  server.tool(
    'list_sessions',
    'Lists Vapi sessions. Supports filters for id, name, assistantId, squadId, workflowId, and date ranges.',
    ListSessionsInputSchema.shape,
    createToolHandler(async (data) => vapiGet('/session', data))
  );

  server.tool(
    'get_session',
    'Gets a single Vapi session by ID.',
    GetSessionInputSchema.shape,
    createToolHandler(async (data) => vapiGet(`/session/${data.sessionId}`))
  );
};
