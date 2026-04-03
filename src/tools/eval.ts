import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import {
  CreateEvalInputSchema,
  GetEvalInputSchema,
  UpdateEvalInputSchema,
  DeleteEvalInputSchema,
  ListEvalsInputSchema,
  RunEvalInputSchema,
  GetEvalRunInputSchema,
} from '../schemas/index.js';
import { createToolHandler } from './utils.js';
import { getToken } from '../auth.js';

const VAPI_API_BASE = 'https://api.vapi.ai';

async function vapiApiFetch(path: string, options: RequestInit = {}): Promise<any> {
  const token = getToken();
  if (!token) throw new Error('No API token available');

  const res = await fetch(`${VAPI_API_BASE}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Vapi API error ${res.status}: ${body}`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export const registerEvalTools = (server: McpServer) => {
  // ===== Eval CRUD =====

  server.tool(
    'list_evals',
    'Lists all evaluations (mock conversation tests with exact/regex/AI validation)',
    ListEvalsInputSchema.shape,
    createToolHandler(async (data) => {
      return await vapiApiFetch(`/eval?limit=${data.limit}`);
    })
  );

  server.tool(
    'create_eval',
    'Creates a mock conversation evaluation. Define user messages and expected assistant responses with validation (exact match, regex, or AI judge). Can also validate tool calls.',
    CreateEvalInputSchema.shape,
    createToolHandler(async (data) => {
      return await vapiApiFetch('/eval', {
        method: 'POST',
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          type: 'chat.mockConversation',
          messages: data.messages,
        }),
      });
    })
  );

  server.tool(
    'get_eval',
    'Gets details of a specific evaluation',
    GetEvalInputSchema.shape,
    createToolHandler(async (data) => {
      return await vapiApiFetch(`/eval/${data.evalId}`);
    })
  );

  server.tool(
    'update_eval',
    'Updates an existing evaluation',
    UpdateEvalInputSchema.shape,
    createToolHandler(async (data) => {
      const body: any = {};
      if (data.name) body.name = data.name;
      if (data.description) body.description = data.description;
      if (data.messages) body.messages = data.messages;
      return await vapiApiFetch(`/eval/${data.evalId}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
    })
  );

  server.tool(
    'delete_eval',
    'Deletes an evaluation',
    DeleteEvalInputSchema.shape,
    createToolHandler(async (data) => {
      return await vapiApiFetch(`/eval/${data.evalId}`, {
        method: 'DELETE',
      });
    })
  );

  // ===== Eval Runs =====

  server.tool(
    'run_eval',
    'Runs an evaluation against an assistant or squad. Returns a run ID. Use get_eval_run to check status (queued → in-progress → completed/failed) and see pass/fail results.',
    RunEvalInputSchema.shape,
    createToolHandler(async (data) => {
      const target: any = {};
      if (data.assistantId) {
        target.type = 'assistant';
        target.assistantId = data.assistantId;
      } else if (data.squadId) {
        target.type = 'squad';
        target.squadId = data.squadId;
      }
      return await vapiApiFetch('/eval/run', {
        method: 'POST',
        body: JSON.stringify({
          evalId: data.evalId,
          target,
        }),
      });
    })
  );

  server.tool(
    'get_eval_run',
    'Gets the status and results of an evaluation run. Shows pass/fail for each conversation turn, including judge results and failure reasons.',
    GetEvalRunInputSchema.shape,
    createToolHandler(async (data) => {
      return await vapiApiFetch(`/eval/run/${data.runId}`);
    })
  );
};
