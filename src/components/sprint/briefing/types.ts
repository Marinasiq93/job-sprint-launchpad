
export interface Source {
  title: string;
  url: string;
}

export interface NewsItem {
  title: string;
  url: string;
  date?: string; // Added optional date property
}

export interface BriefingContent {
  overview: string;
  highlights: string[];
  summary: string;
  sources: Source[];
  recentNews: NewsItem[];
  apiUnavailable?: boolean; // Added flag to explicitly indicate if API is unavailable
}
