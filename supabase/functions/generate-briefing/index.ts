
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
    console.log(`API key value prefix: ${perplexityApiKey ? perplexityApiKey.substring(0, 5) + '...' : 'not set'}`);
    
    // Check if API key is available and valid
    if (!perplexityApiKey || perplexityApiKey.trim() === '') {
      console.log("PERPLEXITY_API_KEY not set or empty, returning demo content");
      const briefingData = generateDemoContent(companyName, category, companyWebsite || 'https://www.example.com');
      return new Response(JSON.stringify({
        ...briefingData,
        apiUnavailable: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Verify API key format
    if (!perplexityApiKey.startsWith('pplx-')) {
      console.error("Invalid API key format, should start with 'pplx-'");
      const briefingData = generateDemoContent(companyName, category, companyWebsite || 'https://www.example.com');
      return new Response(JSON.stringify({
        ...briefingData,
        error: "API key format is invalid. Perplexity API keys should start with 'pplx-'.",
        apiUnavailable: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    try {
      // Try to get data from Perplexity API (now getting raw text)
      const perplexityResponse = await getPerplexityAnalysis(prompt, perplexityApiKey);
      console.log("Raw API response excerpt:", perplexityResponse.substring(0, 100) + "...");
      
      if (!perplexityResponse || perplexityResponse.trim() === '') {
        console.error("Received empty response from Perplexity API");
        throw new Error("Received empty response from Perplexity API");
      }
      
      // Process the raw text into our expected structure
      const processedResponse = processPerplexityResponse(perplexityResponse, companyName);
      
      // Mark that the API is available
      processedResponse.apiUnavailable = false;
      
      return new Response(JSON.stringify(processedResponse), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (apiError) {
      console.error("Error from Perplexity API, falling back to demo content:", apiError);
      // Fallback to demo content if API call fails
      const briefingData = generateDemoContent(companyName, category, companyWebsite || 'https://www.example.com');
      return new Response(JSON.stringify({
        ...briefingData,
        apiUnavailable: true,
        error: `API Error: ${apiError.message}`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error in generate-briefing function:', error);
    
    // Create a user-friendly error response
    const errorResponse = createFallbackResponse('', error.message);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      apiUnavailable: true,
      ...errorResponse
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
