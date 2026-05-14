import { z } from 'zod';

// ===== Model Provider and Models =====

export const ModelProvider = {
  OpenAI: 'openai',
  Anthropic: 'anthropic',
  GoogleAI: 'google',
} as const;

export const OpenAIModels = {
  GPT4o: 'gpt-4o',
  GPT4oMini: 'gpt-4o-mini',
} as const;

export const AnthropicModels = {
  Claude3Sonnet: 'claude-3-7-sonnet-20250219',
  Claude3Haiku: 'claude-3-5-haiku-20241022',
} as const;

export const GoogleModels = {
  GeminiPro: 'gemini-1.5-pro',
  GeminiFlash: 'gemini-1.5-flash',
  Gemini2Flash: 'gemini-2.0-flash',
  Gemini2Pro: 'gemini-2.0-pro',
} as const;

export type ModelProviderType =
  (typeof ModelProvider)[keyof typeof ModelProvider];
export type OpenAIModelType = (typeof OpenAIModels)[keyof typeof OpenAIModels];
export type AnthropicModelType =
  (typeof AnthropicModels)[keyof typeof AnthropicModels];
export type GoogleModelType = (typeof GoogleModels)[keyof typeof GoogleModels];

const OpenAILLMSchema = z.object({
  provider: z.literal(ModelProvider.OpenAI),
  model: z.enum([OpenAIModels.GPT4o, OpenAIModels.GPT4oMini] as const),
});

const AnthropicLLMSchema = z.object({
  provider: z.literal(ModelProvider.Anthropic),
  model: z.enum([
    AnthropicModels.Claude3Sonnet,
    AnthropicModels.Claude3Haiku,
  ] as const),
});

const GoogleLLMSchema = z.object({
  provider: z.literal(ModelProvider.GoogleAI),
  model: z.enum([
    GoogleModels.GeminiPro,
    GoogleModels.GeminiFlash,
    GoogleModels.Gemini2Flash,
    GoogleModels.Gemini2Pro,
  ] as const),
});

const GenericLLMSchema = z.object({
  provider: z.string(),
  model: z.string(),
});

const LLMSchema = z.union([
  OpenAILLMSchema,
  AnthropicLLMSchema,
  GoogleLLMSchema,
  GenericLLMSchema,
]);

export const DEFAULT_LLM = {
  provider: ModelProvider.OpenAI,
  model: OpenAIModels.GPT4o,
};

const VoiceProviderSchema = z.enum([
  'vapi',
  '11labs',
  'azure',
  'cartesia',
  'custom-voice',
  'deepgram',
  '11labs',
  'hume',
  'lmnt',
  'neuphonic',
  'openai',
  'playht',
  'rime-ai',
  'smallest-ai',
  'tavus',
  'sesame',
]);

export type VoiceProviderType = z.infer<typeof VoiceProviderSchema>;

export const DEFAULT_VOICE = {
  provider: '11labs' as VoiceProviderType,
  voiceId: 'sarah',
};

export const DEFAULT_TRANSCRIBER = {
  provider: 'deepgram',
  model: 'nova-3',
};

export const ElevenLabsVoiceIds = {
  Sarah: 'sarah',
  Phillip: 'phillip',
  Steve: 'steve',
  Joseph: 'joseph',
  Myra: 'myra',
} as const;

// ===== Common Schemas =====

export const BaseResponseSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// ===== Assistant Schemas =====

export const CreateAssistantInputSchema = z.object({
  name: z.string().describe('Name of the assistant'),
  instructions: z
    .string()
    .optional()
    .default('You are a helpful assistant.')
    .describe('Instructions for the assistant'),
  llm: z
    .union([
      LLMSchema,
      z.string().transform((str) => {
        try {
          return JSON.parse(str);
        } catch (e) {
          throw new Error(`Invalid LLM JSON string: ${str}`);
        }
      }),
    ])
    .default(DEFAULT_LLM)
    .describe('LLM configuration'),
  toolIds: z
    .array(z.string())
    .optional()
    .describe('IDs of tools to use with this assistant'),
  transcriber: z
    .object({
      provider: z.string().describe('Provider to use for transcription'),
      model: z.string().describe('Transcription model to use'),
    })
    .default(DEFAULT_TRANSCRIBER)
    .describe('Transcription configuration'),
  voice: z
    .object({
      provider: VoiceProviderSchema.describe('Provider to use for voice'),
      voiceId: z.string().describe('Voice ID to use'),
      model: z.string().optional().describe('Voice model to use'),
    })
    .default(DEFAULT_VOICE)
    .describe('Voice configuration'),
  firstMessage: z
    .string()
    .optional()
    .default('Hello, how can I help you today?')
    .describe('First message to say to the user'),
  firstMessageMode: z
    .enum([
      'assistant-speaks-first',
      'assistant-waits-for-user',
      'assistant-speaks-first-with-model-generated-message',
    ])
    .default('assistant-speaks-first')
    .optional()
    .describe('This determines who speaks first, either assistant or user'),
});

export const AssistantOutputSchema = BaseResponseSchema.extend({
  name: z.string(),
  llm: z.object({
    provider: z.string(),
    model: z.string(),
  }),
  voice: z.object({
    provider: z.string(),
    voiceId: z.string(),
    model: z.string().optional(),
  }),
  transcriber: z.object({
    provider: z.string(),
    model: z.string(),
  }),
  toolIds: z.array(z.string()).optional(),
});

export const GetAssistantInputSchema = z.object({
  assistantId: z.string().describe('ID of the assistant to get'),
});

export const UpdateAssistantInputSchema = z.object({
  assistantId: z.string().describe('ID of the assistant to update'),
  name: z.string().optional().describe('New name for the assistant'),
  instructions: z
    .string()
    .optional()
    .describe('New instructions for the assistant'),
  llm: z
    .union([
      LLMSchema,
      z.string().transform((str) => {
        try {
          return JSON.parse(str);
        } catch (e) {
          throw new Error(`Invalid LLM JSON string: ${str}`);
        }
      }),
    ])
    .optional()
    .describe('New LLM configuration'),
  toolIds: z
    .array(z.string())
    .optional()
    .describe('New IDs of tools to use with this assistant'),
  transcriber: z
    .object({
      provider: z.string().describe('Provider to use for transcription'),
      model: z.string().describe('Transcription model to use'),
    })
    .optional()
    .describe('New transcription configuration'),
  voice: z
    .object({
      provider: VoiceProviderSchema.describe('Provider to use for voice'),
      voiceId: z.string().describe('Voice ID to use'),
      model: z.string().optional().describe('Voice model to use'),
    })
    .optional()
    .describe('New voice configuration'),
  firstMessage: z
    .string()
    .optional()
    .describe('First message to say to the user'),
  firstMessageMode: z
    .enum([
      'assistant-speaks-first',
      'assistant-waits-for-user',
      'assistant-speaks-first-with-model-generated-message',
    ])
    .optional()
    .describe('This determines who speaks first, either assistant or user'),
});

// ===== Call Schemas =====

// List calls input schema with filters
export const ListCallsInputSchema = z.object({
  assistantId: z.string().optional().describe('Filter by assistant ID'),
  phoneNumberId: z.string().optional().describe('Filter by phone number ID'),
  limit: z
    .number()
    .min(1)
    .max(250)
    .optional()
    .default(100)
    .describe('Maximum number of calls to return (default: 100, max: 250)'),
  createdAtGt: z
    .string()
    .optional()
    .describe('Filter calls created after this ISO datetime'),
  createdAtLt: z
    .string()
    .optional()
    .describe('Filter calls created before this ISO datetime'),
  createdAtGe: z
    .string()
    .optional()
    .describe('Filter calls created at or after this ISO datetime'),
  createdAtLe: z
    .string()
    .optional()
    .describe('Filter calls created at or before this ISO datetime'),
});

// Get call logs input schema — verbose Vapi platform logs (request/response bodies, webhooks, errors)
export const GetCallLogsInputSchema = z.object({
  callId: z
    .string()
    .optional()
    .describe('Filter logs by call ID (most common use)'),
  type: z
    .enum(['Call', 'API', 'Webhook', 'Provider'])
    .optional()
    .describe('Filter by log type'),
  webhookType: z
    .string()
    .optional()
    .describe('Filter by webhook type when type=Webhook'),
  assistantId: z.string().optional().describe('Filter by assistant ID'),
  phoneNumberId: z.string().optional().describe('Filter by phone number ID'),
  customerId: z.string().optional().describe('Filter by customer ID'),
  squadId: z.string().optional().describe('Filter by squad ID'),
  page: z.number().min(1).optional().describe('Page number (default 1)'),
  sortOrder: z
    .enum(['ASC', 'DESC'])
    .optional()
    .describe('Sort order, default DESC'),
  limit: z
    .number()
    .min(1)
    .max(1000)
    .optional()
    .default(100)
    .describe('Max items to return (default 100)'),
  createdAtGt: z.string().optional().describe('Logs created after this ISO datetime'),
  createdAtLt: z.string().optional().describe('Logs created before this ISO datetime'),
  createdAtGe: z.string().optional().describe('Logs created at or after this ISO datetime'),
  createdAtLe: z.string().optional().describe('Logs created at or before this ISO datetime'),
});

// Create call input schema
export const CallInputSchema = z.object({
  assistantId: z
    .string()
    .optional()
    .describe('ID of the assistant to use for the call'),
  phoneNumberId: z
    .string()
    .optional()
    .describe('ID of the phone number to use for the call'),
  customer: z
    .object({
      number: z.string().describe('Customer phone number'),
    })
    .optional()
    .describe('Customer information'),
  scheduledAt: z
    .string()
    .optional()
    .describe(
      'ISO datetime string for when the call should be scheduled (e.g. "2025-03-25T22:39:27.771Z")'
    ),
  assistantOverrides: z
    .object({
      variableValues: z
        .record(z.string(), z.any())
        .optional()
        .describe(
          'Key-value pairs for dynamic variables to use in the assistant\'s prompts (e.g. {"name": "Joe", "age": "24"})'
        ),
    })
    .optional()
    .describe('Overrides for the assistant configuration'),
});

// Transcript entry schema (with timestamps)
export const TranscriptEntrySchema = z.object({
  role: z.enum(['assistant', 'user', 'system', 'tool']),
  message: z.string(),
  time: z.number().optional().describe('Timestamp in seconds from call start'),
});

// Message entry schema (simplified, no timestamps)
export const MessageEntrySchema = z.object({
  role: z.enum(['assistant', 'user', 'system', 'tool']),
  message: z.string(),
});

// Call artifact schema
export const CallArtifactSchema = z.object({
  recording: z.string().optional().describe('URL to call recording MP3'),
  stereoRecordingUrl: z
    .string()
    .optional()
    .describe('URL to stereo call recording'),
  transcript: z
    .array(TranscriptEntrySchema)
    .optional()
    .describe('Full transcript with timestamps'),
  messages: z
    .array(MessageEntrySchema)
    .optional()
    .describe('Simplified message list'),
  logUrl: z.string().optional().describe('URL to detailed call logs'),
  variableValues: z
    .record(z.unknown())
    .optional()
    .describe('Variables captured during call'),
});

// Call analysis schema
export const CallAnalysisSchema = z.object({
  summary: z.string().optional().describe('AI-generated call summary'),
  successEvaluation: z
    .string()
    .optional()
    .describe('Success evaluation result'),
  structuredData: z
    .record(z.unknown())
    .optional()
    .describe('Structured data extracted from call'),
});

// Enhanced call output schema with full data
export const CallOutputSchema = BaseResponseSchema.extend({
  status: z.string(),
  type: z
    .string()
    .optional()
    .describe('Call type: inboundPhoneCall, outboundPhoneCall, webCall'),
  endedReason: z.string().optional(),
  assistantId: z.string().optional(),
  phoneNumberId: z.string().optional(),
  customer: z
    .object({
      number: z.string(),
    })
    .optional(),
  scheduledAt: z.string().optional(),
  startedAt: z.string().optional(),
  endedAt: z.string().optional(),
  duration: z.number().optional().describe('Call duration in seconds'),
  cost: z.number().optional().describe('Call cost in USD'),
  artifact: CallArtifactSchema.optional(),
  analysis: CallAnalysisSchema.optional(),
});

export const GetCallInputSchema = z.object({
  callId: z.string().describe('ID of the call to get'),
});

// Get call transcript input schema
export const GetCallTranscriptInputSchema = z.object({
  callId: z.string().describe('The ID of the call'),
  format: z
    .enum(['structured', 'plain'])
    .optional()
    .default('structured')
    .describe(
      "Output format: 'structured' (array with timestamps) or 'plain' (formatted text)"
    ),
});

// Get call transcript output schema
export const GetCallTranscriptOutputSchema = z.object({
  callId: z.string(),
  transcript: z.union([z.array(TranscriptEntrySchema), z.string()]),
  duration: z.number().optional().describe('Call duration in seconds'),
});

// ===== Phone Number Schemas =====

export const GetPhoneNumberInputSchema = z.object({
  phoneNumberId: z.string().describe('ID of the phone number to get'),
});

export const PhoneNumberOutputSchema = BaseResponseSchema.extend({
  name: z.string().optional(),
  phoneNumber: z.string(),
  status: z.string(),
  capabilities: z
    .object({
      sms: z.boolean().optional(),
      voice: z.boolean().optional(),
    })
    .optional(),
});

// ===== Tool Schemas =====

export const GetToolInputSchema = z.object({
  toolId: z.string().describe('ID of the tool to get'),
});

const TransferCallDestinationSchema = z.object({
  type: z.literal('number'),
  number: z.string().describe('Phone number to transfer to (e.g., "+16054440129"). It can be any phone number in E.164 format.'),
  extension: z.string().optional().describe('Extension number if applicable'),
  callerId: z.string().optional().describe('Caller ID to use for the transfer'),
  description: z.string().optional().describe('Description of the transfer destination'),
});

// Generic custom tool schemas
const JsonSchemaProperty = z.object({
  type: z.string(),
  description: z.string().optional(),
  enum: z.array(z.string()).optional(),
  items: z.any().optional(),
  properties: z.record(z.any()).optional(),
  required: z.array(z.string()).optional(),
});

const JsonSchema = z.object({
  type: z.literal('object'),
  properties: z.record(JsonSchemaProperty),
  required: z.array(z.string()).optional(),
});

const ServerSchema = z.object({
  url: z.string().url().describe('Server URL where the function will be called'),
  headers: z.record(z.string()).optional().describe('Headers to send with the request'),
});

const BackoffPlanSchema = z.object({
  type: z.enum(['fixed', 'exponential']).default('fixed'),
  maxRetries: z.number().default(3).describe('Maximum number of retries'),
  baseDelaySeconds: z.number().default(1).describe('Base delay between retries in seconds'),
});

// Base tool configuration schema (reusable for both create and update)
const BaseToolConfigSchema = z.object({
  // Common fields for all tools
  name: z.string().optional().describe('Name of the function/tool'),
  description: z.string().optional().describe('Description of what the function/tool does'),
  
  // SMS tool configuration
  sms: z.object({
    metadata: z.object({
      from: z.string().describe('Phone number to send SMS from (e.g., "+15551234567"). It must be a twilio number in E.164 format.'),
    }).describe('SMS configuration metadata'),
  }).optional().describe('SMS tool configuration - to send text messages'),
  
  // Transfer call tool configuration
  transferCall: z.object({
    destinations: z.array(TransferCallDestinationSchema).describe('Array of possible transfer destinations'),
  }).optional().describe('Transfer call tool configuration - to transfer calls to destinations'),
  
  // Function tool configuration (custom functions with parameters)
  function: z.object({
    parameters: JsonSchema.describe('JSON schema for function parameters'),
    server: ServerSchema.describe('Server configuration with URL where the function will be called'),
  }).optional().describe('Custom function tool configuration - for custom server-side functions'),
  
  // API Request tool configuration
  apiRequest: z.object({
    url: z.string().url().describe('URL to make the API request to'),
    method: z.enum(['GET', 'POST']).default('POST').describe('HTTP method for the API request'),
    headers: z.record(z.string()).optional().describe('Headers to send with the request (key-value pairs)'),
    body: JsonSchema.optional().describe('Body schema for the API request in JSON Schema format'),
    backoffPlan: BackoffPlanSchema.optional().describe('Retry configuration for failed API requests'),
    timeoutSeconds: z.number().default(20).describe('Request timeout in seconds'),
  }).optional().describe('API Request tool configuration - for HTTP API integration'),
});

export const CreateToolInputSchema = BaseToolConfigSchema.extend({
  type: z.enum(['sms', 'transferCall', 'function', 'apiRequest'])
    .describe('Type of the tool to create'),
});

export const UpdateToolInputSchema = BaseToolConfigSchema.extend({
  toolId: z.string().describe('ID of the tool to update'),
});

export const ToolOutputSchema = BaseResponseSchema.extend({
  type: z
    .string()
    .describe('Type of the tool (dtmf, function, mcp, query, etc.)'),
  name: z.string().describe('Name of the tool'),
  description: z.string().describe('Description of the tool'),
  parameters: z.record(z.any()).describe('Parameters of the tool'),
  server: ServerSchema.describe('Server of the tool'),
});

// ===== Test Suite Schemas (Simulations) =====

export const CreateTestSuiteInputSchema = z.object({
  name: z.string().optional().describe('Name of the test suite'),
  phoneNumberId: z.string().optional().describe('Phone number ID associated with this test suite'),
  targetPhoneNumberId: z.string().optional().describe('Phone number ID being tested (in target plan)'),
  testerAssistantId: z.string().optional().describe('Assistant ID to use as the tester (in tester plan)'),
});

export const GetTestSuiteInputSchema = z.object({
  testSuiteId: z.string().describe('ID of the test suite'),
});

export const UpdateTestSuiteInputSchema = z.object({
  testSuiteId: z.string().describe('ID of the test suite to update'),
  name: z.string().optional().describe('New name for the test suite'),
  phoneNumberId: z.string().optional().describe('New phone number ID'),
});

export const ListTestSuitesInputSchema = z.object({
  limit: z.number().min(1).max(100).optional().default(10).describe('Maximum number of test suites to return'),
});

// Test case (individual test within a suite)
const ScorerSchema = z.object({
  type: z.literal('ai').default('ai').describe('Scorer type (always "ai")'),
  rubric: z.string().describe('Rubric/criteria for the AI scorer to evaluate the test'),
});

export const CreateTestCaseInputSchema = z.object({
  testSuiteId: z.string().describe('ID of the test suite to add the test to'),
  type: z.enum(['voice', 'chat']).default('chat').describe('Type of test: "voice" for full voice simulation, "chat" for text-based'),
  name: z.string().optional().describe('Name of the test case'),
  script: z.string().describe('Script/instructions for the test - what the AI tester should do'),
  scorers: z.array(ScorerSchema).describe('AI scorers with rubrics to evaluate the test outcome'),
  numAttempts: z.number().optional().describe('Number of attempts allowed for the test'),
});

export const GetTestCaseInputSchema = z.object({
  testSuiteId: z.string().describe('ID of the test suite'),
  testId: z.string().describe('ID of the test case'),
});

export const UpdateTestCaseInputSchema = z.object({
  testSuiteId: z.string().describe('ID of the test suite'),
  testId: z.string().describe('ID of the test case to update'),
  type: z.enum(['voice', 'chat']).describe('Type of test'),
  name: z.string().optional().describe('New name for the test case'),
  script: z.string().optional().describe('New script for the test'),
  scorers: z.array(ScorerSchema).optional().describe('New scorers for the test'),
  numAttempts: z.number().optional().describe('New number of attempts'),
});

export const DeleteTestCaseInputSchema = z.object({
  testSuiteId: z.string().describe('ID of the test suite'),
  testId: z.string().describe('ID of the test case to delete'),
});

export const ListTestCasesInputSchema = z.object({
  testSuiteId: z.string().describe('ID of the test suite'),
  limit: z.number().min(1).max(100).optional().default(10).describe('Maximum number of test cases to return'),
});

// Test suite runs
export const CreateTestSuiteRunInputSchema = z.object({
  testSuiteId: z.string().describe('ID of the test suite to run'),
  name: z.string().optional().describe('Name for this test run'),
});

export const GetTestSuiteRunInputSchema = z.object({
  testSuiteId: z.string().describe('ID of the test suite'),
  runId: z.string().describe('ID of the test suite run'),
});

export const ListTestSuiteRunsInputSchema = z.object({
  testSuiteId: z.string().describe('ID of the test suite'),
  limit: z.number().min(1).max(100).optional().default(10).describe('Maximum number of runs to return'),
});

// ===== Eval Schemas (Mock Conversation Testing) =====

const EvalJudgePlanSchema = z.object({
  type: z.enum(['exact', 'regex', 'ai']).describe('Validation type: exact match, regex pattern, or AI judge'),
  content: z.string().optional().describe('Expected content (for exact/regex) or ignored for AI'),
  toolCalls: z.array(z.object({
    name: z.string().describe('Function/tool name to validate'),
    arguments: z.record(z.any()).optional().describe('Expected arguments (for exact match)'),
  })).optional().describe('Tool calls to validate'),
  model: z.object({
    provider: z.string().default('openai').describe('AI judge provider'),
    model: z.string().default('gpt-4o').describe('AI judge model'),
    messages: z.array(z.object({
      role: z.enum(['system', 'user']).describe('Message role'),
      content: z.string().describe('Message content / evaluation prompt'),
    })).describe('Messages for the AI judge'),
  }).optional().describe('AI judge configuration (required when type is "ai")'),
});

const EvalContinuePlanSchema = z.object({
  exitOnFailureEnabled: z.boolean().optional().describe('Exit evaluation if this step fails'),
  overrideResponse: z.string().optional().describe('Override assistant response if validation fails'),
});

const EvalMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system', 'tool']).describe('Role of the message sender'),
  content: z.string().optional().describe('Message content'),
  judgePlan: EvalJudgePlanSchema.optional().describe('Validation plan for assistant messages'),
  continuePlan: EvalContinuePlanSchema.optional().describe('Flow control after this message'),
});

export const CreateEvalInputSchema = z.object({
  name: z.string().describe('Name of the evaluation'),
  description: z.string().optional().describe('Description of what this eval tests'),
  messages: z.array(EvalMessageSchema).describe('Mock conversation messages with validation'),
});

export const GetEvalInputSchema = z.object({
  evalId: z.string().describe('ID of the evaluation'),
});

export const UpdateEvalInputSchema = z.object({
  evalId: z.string().describe('ID of the evaluation to update'),
  name: z.string().optional().describe('New name'),
  description: z.string().optional().describe('New description'),
  messages: z.array(EvalMessageSchema).optional().describe('New mock conversation messages'),
});

export const DeleteEvalInputSchema = z.object({
  evalId: z.string().describe('ID of the evaluation to delete'),
});

export const ListEvalsInputSchema = z.object({
  limit: z.number().min(1).max(100).optional().default(10).describe('Maximum number of evals to return'),
});

export const RunEvalInputSchema = z.object({
  evalId: z.string().describe('ID of the evaluation to run'),
  assistantId: z.string().optional().describe('Target assistant ID to test against'),
  squadId: z.string().optional().describe('Target squad ID to test against (alternative to assistantId)'),
});

export const GetEvalRunInputSchema = z.object({
  runId: z.string().describe('ID of the evaluation run'),
});
