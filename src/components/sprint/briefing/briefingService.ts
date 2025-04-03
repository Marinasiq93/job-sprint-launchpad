
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
    // Call Perplexity API through Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('generate-briefing', {
      body: {
        prompt,
        category,
        companyName,
        companyWebsite,
        refresh // Signal to bypass any caching on the backend
      },
    });
    
    if (error) {
      console.error('Supabase Edge Function error:', error);
      throw new Error('Falha ao buscar informações da empresa: ' + error.message);
    }
    
    console.log('Edge function response received:', data);
    
    // Check if the response contains an error message
    if (data.error) {
      console.error('API returned an error:', data.error);
      // Use the fallback data if there's an API error but also some content
      if (data.overview && data.highlights && data.summary) {
        return {
          overview: data.overview,
          highlights: data.highlights,
          summary: data.summary,
          sources: data.sources || [],
          recentNews: data.recentNews || []
        };
      }
      throw new Error(data.error);
    }
    
    return {
      overview: data.overview,
      highlights: data.highlights,
      summary: data.summary,
      sources: data.sources || [],
      recentNews: data.recentNews || []
    };
  } catch (error) {
    console.error('Erro ao buscar informações da empresa:', error);
    if (refresh) {
      toast.error('Não foi possível atualizar a análise. Tente novamente mais tarde.');
    }
    
    // Return custom rich fallback content
    return createRichCompanyBriefing(companyName);
  }
};
