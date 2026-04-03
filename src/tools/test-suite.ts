import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { VapiClient } from '@vapi-ai/server-sdk';

import {
  CreateTestSuiteInputSchema,
  GetTestSuiteInputSchema,
  UpdateTestSuiteInputSchema,
  ListTestSuitesInputSchema,
  CreateTestCaseInputSchema,
  GetTestCaseInputSchema,
  UpdateTestCaseInputSchema,
  DeleteTestCaseInputSchema,
  ListTestCasesInputSchema,
  CreateTestSuiteRunInputSchema,
  GetTestSuiteRunInputSchema,
  ListTestSuiteRunsInputSchema,
} from '../schemas/index.js';
import { createToolHandler } from './utils.js';

export const registerTestSuiteTools = (
  server: McpServer,
  vapiClient: VapiClient
) => {
  // ===== Test Suite CRUD =====

  server.tool(
    'list_test_suites',
    'Lists all Vapi test suites (simulation-based testing with AI-powered callers)',
    ListTestSuitesInputSchema.shape,
    createToolHandler(async (data) => {
      const result = await vapiClient.testSuites.testSuiteControllerFindAllPaginated({
        limit: data.limit,
      });
      return result.results;
    })
  );

  server.tool(
    'create_test_suite',
    'Creates a new test suite for simulation-based testing. Define a suite, then add test cases with scripts and AI scorers.',
    CreateTestSuiteInputSchema.shape,
    createToolHandler(async (data) => {
      const dto: any = {};
      if (data.name) dto.name = data.name;
      if (data.phoneNumberId) dto.phoneNumberId = data.phoneNumberId;
      if (data.targetPhoneNumberId) {
        dto.targetPlan = { phoneNumberId: data.targetPhoneNumberId };
      }
      if (data.testerAssistantId) {
        dto.testerPlan = { assistantId: data.testerAssistantId };
      }
      return await vapiClient.testSuites.testSuiteControllerCreate(dto);
    })
  );

  server.tool(
    'get_test_suite',
    'Gets details of a specific test suite',
    GetTestSuiteInputSchema.shape,
    createToolHandler(async (data) => {
      return await vapiClient.testSuites.testSuiteControllerFindOne(data.testSuiteId);
    })
  );

  server.tool(
    'update_test_suite',
    'Updates an existing test suite',
    UpdateTestSuiteInputSchema.shape,
    createToolHandler(async (data) => {
      const dto: any = {};
      if (data.name) dto.name = data.name;
      if (data.phoneNumberId) dto.phoneNumberId = data.phoneNumberId;
      return await vapiClient.testSuites.testSuiteControllerUpdate(data.testSuiteId, dto);
    })
  );

  server.tool(
    'delete_test_suite',
    'Deletes a test suite',
    GetTestSuiteInputSchema.shape,
    createToolHandler(async (data) => {
      return await vapiClient.testSuites.testSuiteControllerRemove(data.testSuiteId);
    })
  );

  // ===== Test Cases (individual tests within a suite) =====

  server.tool(
    'list_test_cases',
    'Lists all test cases in a test suite',
    ListTestCasesInputSchema.shape,
    createToolHandler(async (data) => {
      const result = await vapiClient.testSuiteTests.testSuiteTestControllerFindAllPaginated(
        data.testSuiteId,
        { limit: data.limit }
      );
      return result.results;
    })
  );

  server.tool(
    'create_test_case',
    'Creates a test case in a test suite. Provide a script (instructions for the AI tester) and scorers (AI rubrics to evaluate the outcome). Type can be "voice" (full audio) or "chat" (text-only, faster).',
    CreateTestCaseInputSchema.shape,
    createToolHandler(async (data) => {
      const dto: any = {
        type: data.type,
        script: data.script,
        scorers: data.scorers,
      };
      if (data.name) dto.name = data.name;
      if (data.numAttempts) dto.numAttempts = data.numAttempts;
      return await vapiClient.testSuiteTests.testSuiteTestControllerCreate(data.testSuiteId, dto);
    })
  );

  server.tool(
    'get_test_case',
    'Gets details of a specific test case',
    GetTestCaseInputSchema.shape,
    createToolHandler(async (data) => {
      return await vapiClient.testSuiteTests.testSuiteTestControllerFindOne(
        data.testSuiteId,
        data.testId
      );
    })
  );

  server.tool(
    'update_test_case',
    'Updates an existing test case',
    UpdateTestCaseInputSchema.shape,
    createToolHandler(async (data) => {
      const dto: any = { type: data.type };
      if (data.name) dto.name = data.name;
      if (data.script) dto.script = data.script;
      if (data.scorers) dto.scorers = data.scorers;
      if (data.numAttempts) dto.numAttempts = data.numAttempts;
      return await vapiClient.testSuiteTests.testSuiteTestControllerUpdate(
        data.testSuiteId,
        data.testId,
        dto
      );
    })
  );

  server.tool(
    'delete_test_case',
    'Deletes a test case from a test suite',
    DeleteTestCaseInputSchema.shape,
    createToolHandler(async (data) => {
      return await vapiClient.testSuiteTests.testSuiteTestControllerRemove(
        data.testSuiteId,
        data.testId
      );
    })
  );

  // ===== Test Suite Runs =====

  server.tool(
    'run_test_suite',
    'Runs all test cases in a test suite. Returns a run ID to track progress. Use get_test_suite_run to check status and results.',
    CreateTestSuiteRunInputSchema.shape,
    createToolHandler(async (data) => {
      const dto: any = {};
      if (data.name) dto.name = data.name;
      return await vapiClient.testSuiteRuns.testSuiteRunControllerCreate(data.testSuiteId, dto);
    })
  );

  server.tool(
    'get_test_suite_run',
    'Gets the status and results of a test suite run. Status can be: queued, in-progress, completed, or failed. Results include scorer outcomes per test case.',
    GetTestSuiteRunInputSchema.shape,
    createToolHandler(async (data) => {
      return await vapiClient.testSuiteRuns.testSuiteRunControllerFindOne(
        data.testSuiteId,
        data.runId
      );
    })
  );

  server.tool(
    'list_test_suite_runs',
    'Lists all runs for a test suite with their statuses and results',
    ListTestSuiteRunsInputSchema.shape,
    createToolHandler(async (data) => {
      const result = await vapiClient.testSuiteRuns.testSuiteRunControllerFindAllPaginated(
        data.testSuiteId,
        { limit: data.limit }
      );
      return result.results;
    })
  );
};
