
import { toast } from "@/lib/toast";
import { BRIEFING_CATEGORIES } from "./briefingConstants";
import { supabase } from "@/integrations/supabase/client";
import { BriefingContent } from "./types";
import { perplexityPromptsByCategory } from "./prompts";
import { createRichCompanyBriefing } from "./fallbackContent";

// Re-export the BriefingContent type for external use
export type { BriefingContent };

// Fetch content from Perplexity API
export const fetchBriefingContent = async (
  category: string,
  companyName: string,
  companyWebsite: string,
  refresh = false
): Promise<BriefingContent> => {
  try {
    // Check if the required parameters are provided
    if (!category || !companyName || !companyWebsite) {
      console.error('Missing required parameters:', { category, companyName, companyWebsite });
      throw new Error('Parâmetros insuficientes para analisar a empresa. Verifique os dados fornecidos.');
    }

    console.log(`Fetching briefing for category "${category}" and company "${companyName}"`);

    // Get the prompt for this category
    const prompt = perplexityPromptsByCategory[category](companyName, companyWebsite);
    
    console.log('Calling Supabase Edge Function: generate-briefing');
    // Call Perplexity API through Supabase Edge Function with a timeout
    const fetchPromise = supabase.functions.invoke('generate-briefing', {
      body: {
        prompt,
        category,
        companyName,
        companyWebsite,
        refresh // Signal to bypass any caching on the backend
      },
    });
    
    // Set a timeout for the API call (30 seconds)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Tempo limite excedido ao buscar informações da empresa. A API pode estar indisponível.'));
      }, 30000);
    });
    
    // Race between the API call and the timeout
    const { data, error } = await Promise.race([
      fetchPromise,
      timeoutPromise
    ]) as any;
    
    if (error) {
      console.error('Supabase Edge Function error:', error);
      throw new Error('Falha ao buscar informações da empresa: ' + error.message);
    }
    
    console.log('Edge function response received:', data);
    
    // Check if the response contains an error message or API unavailable flag
    if (data.error || data.apiUnavailable === true) {
      console.error('API returned an error or is unavailable:', data.error || 'API unavailable');
      
      // If there's actual content despite the error, use it
      if (data.overview && data.highlights && data.summary) {
        return {
          overview: data.overview,
          highlights: data.highlights,
          summary: data.summary,
          sources: data.sources || [],
          recentNews: data.recentNews || [],
          apiUnavailable: data.apiUnavailable === true
        };
      }
      throw new Error(data.error || 'API não está disponível no momento.');
    }
    
    return {
      overview: data.overview,
      highlights: data.highlights,
      summary: data.summary,
      sources: data.sources || [],
      recentNews: data.recentNews || [],
      apiUnavailable: data.apiUnavailable === true
    };
  } catch (error) {
    console.error('Erro ao buscar informações da empresa:', error);
    if (refresh) {
      toast.error('Não foi possível atualizar a análise. Tente novamente mais tarde.');
    }
    
    // Return custom rich fallback content with API unavailable flag
    const fallbackContent = createRichCompanyBriefing(companyName);
    return {
      ...fallbackContent,
      apiUnavailable: true
    };
  }
};
