import { Vapi } from '@vapi-ai/server-sdk';
import { z } from 'zod';
import {
  CreateAssistantInputSchema,
  CallInputSchema,
  AssistantOutputSchema,
  CallOutputSchema,
  PhoneNumberOutputSchema,
  ToolOutputSchema,
  UpdateAssistantInputSchema,
  CreateToolInputSchema,
  UpdateToolInputSchema,
  ListCallsInputSchema,
  GetCallTranscriptInputSchema,
  GetCallTranscriptOutputSchema,
  TranscriptEntrySchema,
} from '../schemas/index.js';

// ===== Assistant Transformers =====

export function transformAssistantInput(
  input: z.infer<typeof CreateAssistantInputSchema>
): Vapi.CreateAssistantDto {
  const assistantDto: any = {
    name: input.name,
  };

  assistantDto.model = {
    provider: input.llm.provider as any,
    model: input.llm.model,
  };

  if (input.toolIds && input.toolIds.length > 0) {
    assistantDto.model.toolIds = input.toolIds;
  }

  if (input.instructions) {
    assistantDto.model.messages = [
      {
        role: 'system',
        content: input.instructions,
      },
    ];
  }

  assistantDto.transcriber = {
    provider: input.transcriber.provider,
    ...(input.transcriber.model ? { model: input.transcriber.model } : {}),
  };

  assistantDto.voice = {
    provider: input.voice.provider as any,
    voiceId: input.voice.voiceId,
    ...(input.voice.model ? { model: input.voice.model } : {}),
  };

  if (input.firstMessage) {
    assistantDto.firstMessage = input.firstMessage;
  }

  if (input.firstMessageMode) {
    assistantDto.firstMessageMode = input.firstMessageMode;
  }

  return assistantDto as Vapi.CreateAssistantDto;
}

export function transformUpdateAssistantInput(
  input: z.infer<typeof UpdateAssistantInputSchema>
): Vapi.UpdateAssistantDto {
  const updateDto: any = {};

  if (input.name) {
    updateDto.name = input.name;
  }

  if (input.llm) {
    updateDto.model = {
      provider: input.llm.provider as any,
      model: input.llm.model,
    };

    if (input.toolIds && input.toolIds.length > 0) {
      updateDto.model.toolIds = input.toolIds;
    }

    if (input.instructions) {
      updateDto.model.messages = [
        {
          role: 'system',
          content: input.instructions,
        },
      ];
    }
  } else {
    if (input.toolIds && input.toolIds.length > 0) {
      updateDto.model = { toolIds: input.toolIds };
    }

    if (input.instructions) {
      if (!updateDto.model) updateDto.model = {};
      updateDto.model.messages = [
        {
          role: 'system',
          content: input.instructions,
        },
      ];
    }
  }

  if (input.transcriber) {
    updateDto.transcriber = {
      provider: input.transcriber.provider,
      ...(input.transcriber.model ? { model: input.transcriber.model } : {}),
    };
  }

  if (input.voice) {
    updateDto.voice = {
      provider: input.voice.provider as any,
      voiceId: input.voice.voiceId,
      ...(input.voice.model ? { model: input.voice.model } : {}),
    };
  }

  if (input.firstMessage) {
    updateDto.firstMessage = input.firstMessage;
  }

  if (input.firstMessageMode) {
    updateDto.firstMessageMode = input.firstMessageMode;
  }

  return updateDto as Vapi.UpdateAssistantDto;
}

export function transformAssistantOutput(
  assistant: Vapi.Assistant
): z.infer<typeof AssistantOutputSchema> {
  return {
    id: assistant.id,
    createdAt: assistant.createdAt,
    updatedAt: assistant.updatedAt,
    name: assistant.name || 'Vapi Assistant',
    llm: {
      provider: assistant.model?.provider || 'openai',
      model: assistant.model?.model || 'gpt-4o-mini',
    },
    voice: {
      provider: assistant.voice?.provider || '11labs',
      voiceId: getAssistantVoiceId(assistant.voice),
      model: getAssistantVoiceModel(assistant.voice) || 'eleven_turbo_v2_5',
    },
    transcriber: {
      provider: assistant.transcriber?.provider || 'deepgram',
      model: getAssistantTranscriberModel(assistant.transcriber) || 'nova-3',
    },
    toolIds: assistant.model?.toolIds || [],
  };
}

function getAssistantVoiceId(voice?: Vapi.AssistantVoice): string {
  if (!voice) return '';

  const voiceAny = voice as any;
  return voiceAny.voiceId || voiceAny.voice || '';
}

function getAssistantVoiceModel(voice?: Vapi.AssistantVoice): string {
  if (!voice) return '';

  const voiceAny = voice as any;
  return voiceAny.model || '';
}

function getAssistantTranscriberModel(
  transcriber?: Vapi.AssistantTranscriber
): string {
  if (!transcriber) return '';

  const transcriberAny = transcriber as any;
  return transcriberAny.model || transcriberAny.transcriber || '';
}

// ===== Call Transformers =====

// Transform list calls input to VAPI SDK format
export function transformListCallsInput(
  input: z.infer<typeof ListCallsInputSchema>
): Record<string, unknown> {
  return {
    ...(input.assistantId && { assistantId: input.assistantId }),
    ...(input.phoneNumberId && { phoneNumberId: input.phoneNumberId }),
    ...(input.limit && { limit: input.limit }),
    ...(input.createdAtGt && { createdAtGt: input.createdAtGt }),
    ...(input.createdAtLt && { createdAtLt: input.createdAtLt }),
    ...(input.createdAtGe && { createdAtGe: input.createdAtGe }),
    ...(input.createdAtLe && { createdAtLe: input.createdAtLe }),
  };
}

export function transformCallInput(
  input: z.infer<typeof CallInputSchema>
): Vapi.CreateCallDto {
  return {
    ...(input.assistantId ? { assistantId: input.assistantId } : {}),
    ...(input.phoneNumberId ? { phoneNumberId: input.phoneNumberId } : {}),
    ...(input.customer
      ? {
          customer: {
            number: input.customer.number,
          },
        }
      : {}),
    ...(input.scheduledAt
      ? {
          schedulePlan: {
            earliestAt: input.scheduledAt,
          },
        }
      : {}),
    ...(input.assistantOverrides
      ? {
          assistantOverrides: input.assistantOverrides,
        }
      : {}),
  };
}

// Helper to calculate duration from timestamps
function calculateDuration(call: Vapi.Call): number | undefined {
  const startedAt = call.startedAt;
  const endedAt = call.endedAt;

  if (startedAt && endedAt) {
    const start = new Date(startedAt).getTime();
    const end = new Date(endedAt).getTime();
    return Math.round((end - start) / 1000);
  }
  return undefined;
}

// Helper to format seconds as MM:SS
export function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Transform transcript to plain text format
export function transformTranscriptToPlainText(
  transcript: z.infer<typeof TranscriptEntrySchema>[]
): string {
  return transcript
    .map((entry) => {
      const ts =
        entry.time !== undefined ? `[${formatTimestamp(entry.time)}] ` : '';
      const role = entry.role.charAt(0).toUpperCase() + entry.role.slice(1);
      return `${ts}${role}: ${entry.message}`;
    })
    .join('\n');
}

export function transformCallOutput(
  call: Vapi.Call
): z.infer<typeof CallOutputSchema> {
  const artifact = (call as any).artifact;
  const analysis = (call as any).analysis;

  return {
    id: call.id,
    createdAt: call.createdAt,
    updatedAt: call.updatedAt,
    status: call.status || '',
    type: call.type,
    endedReason: call.endedReason,
    assistantId: call.assistantId,
    phoneNumberId: call.phoneNumberId,
    customer: call.customer
      ? {
          number: call.customer.number || '',
        }
      : undefined,
    scheduledAt: call.schedulePlan?.earliestAt,
    startedAt: call.startedAt,
    endedAt: call.endedAt,
    duration: calculateDuration(call),
    cost: call.cost,
    artifact: artifact
      ? {
          recording: artifact.recording,
          stereoRecordingUrl: artifact.stereoRecordingUrl,
          transcript: artifact.transcript,
          messages: artifact.messages,
          logUrl: artifact.logUrl,
          variableValues: artifact.variableValues,
        }
      : undefined,
    analysis: analysis
      ? {
          summary: analysis.summary,
          successEvaluation: analysis.successEvaluation,
          structuredData: analysis.structuredData,
        }
      : undefined,
  };
}

// Transform get_call_transcript output
export function transformGetCallTranscriptOutput(
  call: Vapi.Call,
  format: 'structured' | 'plain'
): z.infer<typeof GetCallTranscriptOutputSchema> {
  const artifact = (call as any).artifact;
  const transcript = artifact?.transcript || [];

  return {
    callId: call.id,
    transcript:
      format === 'plain' ? transformTranscriptToPlainText(transcript) : transcript,
    duration: calculateDuration(call),
  };
}

// ===== Phone Number Transformers =====

export function transformPhoneNumberOutput(
  phoneNumber: any
): z.infer<typeof PhoneNumberOutputSchema> {
  return {
    id: phoneNumber.id,
    name: phoneNumber.name,
    createdAt: phoneNumber.createdAt,
    updatedAt: phoneNumber.updatedAt,
    phoneNumber: phoneNumber.number,
    status: phoneNumber.status,
  };
}

// ===== Tool Transformers =====

export function transformToolInput(
  input: z.infer<typeof CreateToolInputSchema>
): any {
  let toolDto: any = {
    type: input.type,
  };

  // Add function definition if name and description are provided
  if (input.name || input.description) {
    toolDto.function = {
      ...(input.name && { name: input.name }),
      ...(input.description && { description: input.description }),
    };
  }

  // Handle different tool types using the new nested structure
  switch (input.type) {
    case 'sms':
      if (input.sms?.metadata) {
        toolDto.metadata = input.sms.metadata;
      }
      break;

    case 'transferCall':
      if (input.transferCall?.destinations) {
        toolDto.destinations = input.transferCall.destinations;
      }
      break;

    case 'function':
      if (input.function?.parameters && input.function?.server) {
        // For function tools, add parameters to the existing function object
        if (toolDto.function) {
          toolDto.function.parameters = input.function.parameters;
        } else {
          toolDto.function = {
            parameters: input.function.parameters,
          };
        }
        
        toolDto.server = {
          url: input.function.server.url,
          ...(input.function.server.headers && { headers: input.function.server.headers }),
        };
      }
      break;

    case 'apiRequest':
      if (input.apiRequest?.url) {
        toolDto.url = input.apiRequest.url;
        toolDto.method = input.apiRequest.method || 'POST';
        
        if (input.apiRequest.headers) toolDto.headers = input.apiRequest.headers;
        if (input.apiRequest.body) toolDto.body = input.apiRequest.body;
        if (input.apiRequest.backoffPlan) toolDto.backoffPlan = input.apiRequest.backoffPlan;
        if (input.apiRequest.timeoutSeconds) toolDto.timeoutSeconds = input.apiRequest.timeoutSeconds;
      }
      break;

    default:
      throw new Error(`Unsupported tool type: ${(input as any).type}`);
  }

  return toolDto;
}

export function transformUpdateToolInput(
  input: z.infer<typeof UpdateToolInputSchema>
): any {
  let updateDto: any = {};

  // Add function definition if name and description are provided
  if (input.name || input.description) {
    updateDto.function = {
      ...(input.name && { name: input.name }),
      ...(input.description && { description: input.description }),
    };
  }

  // Handle SMS tool configuration
  if (input.sms?.metadata) {
    updateDto.metadata = input.sms.metadata;
  }

  // Handle Transfer call tool configuration
  if (input.transferCall?.destinations) {
    updateDto.destinations = input.transferCall.destinations;
  }

  // Handle Function tool configuration
  if (input.function?.parameters && input.function?.server) {
    // For function tools, add parameters to the existing function object
    if (updateDto.function) {
      updateDto.function.parameters = input.function.parameters;
    } else {
      updateDto.function = {
        parameters: input.function.parameters,
      };
    }
    
    updateDto.server = {
      url: input.function.server.url,
      ...(input.function.server.headers && { headers: input.function.server.headers }),
    };
  }

  // Handle API Request tool configuration
  if (input.apiRequest) {
    if (input.apiRequest.url) updateDto.url = input.apiRequest.url;
    if (input.apiRequest.method) updateDto.method = input.apiRequest.method;
    if (input.apiRequest.headers) updateDto.headers = input.apiRequest.headers;
    if (input.apiRequest.body) updateDto.body = input.apiRequest.body;
    if (input.apiRequest.backoffPlan) updateDto.backoffPlan = input.apiRequest.backoffPlan;
    if (input.apiRequest.timeoutSeconds) updateDto.timeoutSeconds = input.apiRequest.timeoutSeconds;
  }

  return updateDto;
}

export function transformToolOutput(
  tool: Vapi.ToolsGetResponse
): z.infer<typeof ToolOutputSchema> {
  return {
    id: tool.id,
    createdAt: tool.createdAt,
    updatedAt: tool.updatedAt,
    type: tool.type || '',
    name: tool.function?.name || '',
    description: tool.function?.description || '',
    parameters: tool.function?.parameters || {},
    server: {
      url: tool.server?.url || '',
      headers: tool.server?.headers as Record<string, string> || {},
    }
  };
}
