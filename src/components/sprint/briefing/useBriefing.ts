
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

  // Load briefing content
  const loadBriefingContent = async (category: string) => {
    // If we already have cached data for this category, use it
    if (briefingCache[category]) {
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const briefingData = await fetchBriefingContent(category, companyName, companyWebsite);
      
      // Check if this is a demo response
      if (briefingData.overview?.includes('Demonstração:') || 
          briefingData.overview?.includes('demo') || 
          briefingData.overview?.includes('Esta é uma versão de demonstração')) {
        setIsApiAvailable(false);
      } else {
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

  // Handle refresh button click
  const handleRefreshAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const briefingData = await fetchBriefingContent(
        currentBriefingCategory, 
        companyName, 
        companyWebsite, 
        true // Force refresh
      );
      
      // Check if this is a demo response
      if (briefingData.overview?.includes('Demonstração:') || 
          briefingData.overview?.includes('demo') || 
          briefingData.overview?.includes('Esta é uma versão de demonstração')) {
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
