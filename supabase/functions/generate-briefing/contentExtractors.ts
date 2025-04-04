
// Re-export all content extractors from their dedicated modules
import { extractHighlights } from './extractors/highlightExtractor.ts';
import { extractSources } from './extractors/sourceExtractor.ts';
import { extractRecentNews } from './extractors/newsExtractor.ts';
import { cleanText } from './utils/textUtils.ts';

// Export all extractors and utilities for use in other files
export {
  extractHighlights,
  extractSources,
  extractRecentNews,
  cleanText
};
