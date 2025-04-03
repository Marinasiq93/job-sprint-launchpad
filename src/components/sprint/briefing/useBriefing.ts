
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
    
    try {
      const briefingData = await fetchBriefingContent(category, companyName, companyWebsite);
      
      // Cache the result
      setBriefingCache(prev => ({
        ...prev,
        [category]: briefingData
      }));
    } catch (error) {
      console.error('Error loading briefing content:', error);
      // Default content will be used from the currentBriefing variable
    } finally {
      setIsLoading(false);
    }
  };

  // Handle refresh button click
  const handleRefreshAnalysis = async () => {
    setIsLoading(true);
    
    try {
      const briefingData = await fetchBriefingContent(
        currentBriefingCategory, 
        companyName, 
        companyWebsite, 
        true // Force refresh
      );
      
      // Update the cache with new data
      setBriefingCache(prev => ({
        ...prev,
        [currentBriefingCategory]: briefingData
      }));
      
      toast.success('Análise atualizada com sucesso!');
    } catch (error) {
      // Error is already handled in fetchBriefingContent
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
    handleRefreshAnalysis
  };
};
