
// Response structure for the briefing
export interface BriefingResponse {
  overview: string;
  highlights: string[];
  summary: string;
  sources?: Array<{
    title: string;
    url: string;
  }>;
}

// Config for CORS headers
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
