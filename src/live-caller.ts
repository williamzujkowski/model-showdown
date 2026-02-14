/**
 * Live MCP tool caller — bridges ToolCaller interface to a real nexus-agents MCP server.
 *
 * Usage: NEXUS_LIVE=true npx tsx src/run-live.ts
 */

import type { ToolCaller } from './pipeline.js';

/**
 * Create a ToolCaller that delegates to a callback function.
 */
export function createLiveCaller(
  callFn: (tool: string, args: Record<string, unknown>) => Promise<unknown>,
): ToolCaller {
  return { call: callFn };
}

/**
 * Check if live mode is enabled via NEXUS_LIVE environment variable.
 */
export function isLiveMode(): boolean {
  return process.env['NEXUS_LIVE'] === 'true';
}
