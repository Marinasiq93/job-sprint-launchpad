
import { useState, useEffect } from "react";
import { toast } from "@/lib/toast";
import { fetchBriefingContent, BriefingContent } from "./briefingService";
import { questionToBriefingMap, defaultContentByCategory } from "./briefingConstants";

interface UseBriefingProps {
  companyName: string;
  companyWebsite: string;
  currentQuestionIndex: number;
}

export const useBriefing = ({ companyName, companyWebsite, currentQuestionIndex }: UseBriefingProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [briefingCache, setBriefingCache] = useState<Record<string, BriefingContent>>({});
  const [error, setError] = useState<string | null>(null);
  const [isApiAvailable, setIsApiAvailable] = useState<boolean | undefined>(undefined);

  // Get the current briefing category based on the question index
  const currentBriefingCategory = questionToBriefingMap[currentQuestionIndex] || questionToBriefingMap[0];
  
  // Get the cached briefing or use default content
  const currentBriefing = briefingCache[currentBriefingCategory] || defaultContentByCategory[currentBriefingCategory];

  // Enhanced detection of demo content
  const isContentDemo = (content: BriefingContent): boolean => {
    if (!content || !content.overview) return true;
    
    // Check if any of these demo markers appear in the content
    const demoTerms = [
      'demonstração:', 
      'esta é uma versão de demonstração',
      'esta é uma análise de demonstração',
      'modo de demonstração',
      'apiUnavailable: true'
    ];
    
    // Also check for explicitly flagged content from the API response
    if (content.apiUnavailable === true) return true;
    
    return demoTerms.some(term => 
      content.overview.toLowerCase().includes(term.toLowerCase()) ||
      (content.summary && content.summary.toLowerCase().includes(term.toLowerCase()))
    );
  };

  // Load briefing content
  const loadBriefingContent = async (category: string) => {
    // Skip if we already have cached data for this category
    if (briefingCache[category]) {
      console.log(`Using cached briefing data for category: ${category}`);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching briefing content for ${companyName}, category: ${category}`);
      const briefingData = await fetchBriefingContent(category, companyName, companyWebsite);
      console.log("Received briefing data:", briefingData);
      
      // Check if it's demo content with enhanced logic
      if (isContentDemo(briefingData)) {
        console.log("Demo content detected, API might be unavailable");
        setIsApiAvailable(false);
      } else {
        console.log("Real API content detected, API is available");
        setIsApiAvailable(true);
      }
      
      // Cache the result
      setBriefingCache(prev => ({
        ...prev,
        [category]: briefingData
      }));
    } catch (error) {
      console.error('Error loading briefing content:', error);
      setError("Não foi possível carregar informações da empresa. O serviço de análise pode estar indisponível no momento.");
      setIsApiAvailable(false);
      // Default content will be used from the currentBriefing variable
    } finally {
      setIsLoading(false);
    }
  };

  // Handle refresh button click - forces a new API call
  const handleRefreshAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Refreshing analysis for ${companyName}, category: ${currentBriefingCategory}`);
      // Always pass refresh=true to force a new API call
      const briefingData = await fetchBriefingContent(
        currentBriefingCategory, 
        companyName, 
        companyWebsite, 
        true // Force refresh
      );
      
      // Check if it's demo content
      if (isContentDemo(briefingData)) {
        setIsApiAvailable(false);
        toast.info('Modo de demonstração: API não disponível. Configure a API Perplexity para análise completa.');
      } else {
        setIsApiAvailable(true);
        toast.success('Análise atualizada com sucesso!');
      }
      
      // Update the cache with new data
      setBriefingCache(prev => ({
        ...prev,
        [currentBriefingCategory]: briefingData
      }));
    } catch (error) {
      setError("Não foi possível atualizar a análise. O serviço de análise pode estar indisponível no momento.");
      setIsApiAvailable(false);
      toast.error('Não foi possível atualizar a análise. O serviço de análise pode estar indisponível no momento.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch briefing content on initial render and when category changes
  useEffect(() => {
    loadBriefingContent(currentBriefingCategory);
  }, [currentBriefingCategory, companyName, companyWebsite]);

  return {
    isLoading,
    currentBriefing,
    currentBriefingCategory,
    handleRefreshAnalysis,
    error,
    isApiAvailable
  };
};
