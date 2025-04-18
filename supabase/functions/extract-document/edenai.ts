
/**
 * Eden AI service integration
 * This file re-exports the necessary functions from the refactored modules
 */

import { extractWithFallbacks, callEdenAI } from "./extractor.ts";
import { processEdenAIResponse } from "./ocr-api.ts";
import { corsHeaders, EDEN_AI_API_KEY, validateAPIKey } from "./utils.ts";
import { callEdenAIWorkflow } from "./workflow.ts";

// Export the functions needed by other modules
export { 
  extractWithFallbacks,
  callEdenAI,
  processEdenAIResponse,
  corsHeaders,
  EDEN_AI_API_KEY,
  validateAPIKey,
  callEdenAIWorkflow
};
