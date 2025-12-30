import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { VapiClient, Vapi } from '@vapi-ai/server-sdk';

import {
  CallInputSchema,
  GetCallInputSchema,
  ListCallsInputSchema,
  GetCallTranscriptInputSchema,
} from '../schemas/index.js';
import {
  transformCallInput,
  transformCallOutput,
  transformListCallsInput,
  transformGetCallTranscriptOutput,
} from '../transformers/index.js';
import { createToolHandler } from './utils.js';

export const registerCallTools = (
  server: McpServer,
  vapiClient: VapiClient
) => {
  server.tool(
    'list_calls',
    'Lists Vapi calls with optional filters for assistantId, phoneNumberId, date ranges, and limit',
    ListCallsInputSchema.shape,
    createToolHandler(async (data) => {
      const queryParams = transformListCallsInput(data);
      const calls = await vapiClient.calls.list(queryParams);
      return calls.map(transformCallOutput);
    })
  );

  server.tool(
    'create_call',
    'Creates a outbound call',
    CallInputSchema.shape,
    createToolHandler(async (data) => {
      const createCallDto = transformCallInput(data);
      const call = await vapiClient.calls.create(createCallDto);
      return transformCallOutput(call as unknown as Vapi.Call);
    })
  );

  server.tool(
    'get_call',
    'Gets detailed call information including transcript, recording URL, analysis, and captured variables',
    GetCallInputSchema.shape,
    createToolHandler(async (data) => {
      const call = await vapiClient.calls.get(data.callId);
      return transformCallOutput(call);
    })
  );

  server.tool(
    'get_call_transcript',
    "Get call transcript in structured (with timestamps) or plain text format. Use format='plain' for readable output like '[00:03] User: Hello'",
    GetCallTranscriptInputSchema.shape,
    createToolHandler(async (data) => {
      const call = await vapiClient.calls.get(data.callId);
      return transformGetCallTranscriptOutput(call, data.format || 'structured');
    })
  );
};
