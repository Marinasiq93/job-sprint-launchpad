
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
// Import types properly
import '@types/testing-library__jest-dom';
import BriefingContent from './BriefingContent';
import { BriefingContent as BriefingContentType } from "./briefingService";
import { describe, test, expect, vi } from 'vitest';

// Mock data
const mockBriefing: BriefingContentType = {
  overview: "This is a test overview",
  highlights: ["Highlight 1", "Highlight 2"],
  summary: "This is a test summary",
  sources: [{ title: "Source 1", url: "https://example.com" }],
  recentNews: [{ title: "News 1", url: "https://example.com/news", date: "2023-01-01" }]
};

describe('BriefingContent', () => {
  test('renders loading state', () => {
    render(<BriefingContent 
      currentBriefing={mockBriefing} 
      currentCategory="culture_values" 
      isLoading={true} 
    />);
    
    expect(screen.getByText(/Analisando informações da empresa/i)).toBeInTheDocument();
  });

  test('renders error state', () => {
    render(<BriefingContent 
      currentBriefing={mockBriefing} 
      currentCategory="culture_values" 
      error="Test error" 
    />);
    
    expect(screen.getByText("Test error")).toBeInTheDocument();
  });

  test('renders content correctly', () => {
    render(<BriefingContent 
      currentBriefing={mockBriefing} 
      currentCategory="culture_values" 
    />);
    
    expect(screen.getByText("This is a test overview")).toBeInTheDocument();
    expect(screen.getByText("Highlight 1")).toBeInTheDocument();
    expect(screen.getByText("This is a test summary")).toBeInTheDocument();
  });
});
