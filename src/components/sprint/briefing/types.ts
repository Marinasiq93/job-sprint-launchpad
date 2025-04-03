
// Interface for the briefing content structure
export interface BriefingContent {
  overview: string;
  highlights: string[];
  summary: string;
  sources?: Array<{
    title: string;
    url: string;
  }>;
  recentNews?: Array<{
    title: string;
    date?: string;
    url?: string;
  }>;
}
