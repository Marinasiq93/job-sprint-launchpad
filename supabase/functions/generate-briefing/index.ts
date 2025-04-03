
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { BriefingResponse, corsHeaders } from "./types.ts";
import { createFallbackResponse, generateDemoContent } from "./fallbackUtils.ts";
import { getPerplexityAnalysis, processPerplexityResponse } from "./perplexityService.ts";

// Get the API key from environment variables
const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, category, companyName, companyWebsite, refresh = false } = await req.json();

    // Validate required input parameters
    if (!category || !companyName) {
      console.error('Missing required parameters:', { category: !!category, companyName: !!companyName });
      return new Response(JSON.stringify(
        createFallbackResponse('', 'Missing required parameters: category or companyName')
      ), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    console.log(`Processing briefing request for ${companyName}, category: ${category}`);
    console.log(`API key present: ${!!perplexityApiKey}`);
    
    // Check if API key is available
    if (!perplexityApiKey) {
      console.log("PERPLEXITY_API_KEY not set, returning demo content");
      const briefingData = generateDemoContent(companyName, category, companyWebsite || 'https://www.example.com');
      return new Response(JSON.stringify(briefingData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    try {
      // Try to get data from Perplexity API (now getting raw text)
      const perplexityResponse = await getPerplexityAnalysis(prompt, perplexityApiKey);
      console.log("Raw API response excerpt:", perplexityResponse.substring(0, 100) + "...");
      
      // Process the raw text into our expected structure
      const processedResponse = processPerplexityResponse(perplexityResponse, companyName);
      
      return new Response(JSON.stringify(processedResponse), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (apiError) {
      console.error("Error from Perplexity API, falling back to demo content:", apiError);
      // Fallback to demo content if API call fails
      const briefingData = generateDemoContent(companyName, category, companyWebsite || 'https://www.example.com');
      return new Response(JSON.stringify(briefingData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error in generate-briefing function:', error);
    
    // Create a user-friendly error response
    const errorResponse = createFallbackResponse('', error.message);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      ...errorResponse
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
