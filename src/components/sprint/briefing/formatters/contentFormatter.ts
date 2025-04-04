
/**
 * Utility functions for formatting content in the briefing component
 */

/**
 * Format content with enhanced styling for headers, lists, and other elements
 */
export const formatContent = (content: string): string => {
  if (!content) return '';
  
  // Create a temporary element to hold the content
  const tempDiv = document.createElement('div');
  
  // Replace markdown headers with HTML elements with added classes for better styling
  let formatted = content
    // Replace headers with HTML tags with appropriate classes
    .replace(/#{4,}\s+([^\n]+)/g, '<h4 class="text-lg font-semibold mt-6 mb-3">$1</h4>')
    .replace(/#{3}\s+([^\n]+)/g, '<h3 class="text-xl font-semibold mt-8 mb-4">$1</h3>') 
    .replace(/#{2}\s+([^\n]+)/g, '<h2 class="text-2xl font-semibold mt-10 mb-4">$1</h2>')
    .replace(/#{1}\s+([^\n]+)/g, '<h1 class="text-3xl font-bold mt-10 mb-5">$1</h1>')
    
    // Format section headers in all caps with styling - be more specific to avoid false positives
    // Only match lines that are ENTIRELY in uppercase with minimum 3 chars
    .replace(/^([A-Z][A-Z\s]{2,}[A-Z]:?)$/gm, '<h3 class="text-xl font-semibold mt-8 mb-4">$1</h3>')
    
    // Format capitalized CamelCase headers (like ProductName:)
    .replace(/^([A-Z][a-z]+(?:[A-Z][a-z]+)+:)(\s*)/gm, '<h4 class="text-lg font-semibold mt-6 mb-3">$1</h4>')
    
    // Format bold and italic text
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold">$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/_([^_]+)_/g, '<em>$1</em>')
    
    // Add spacing between paragraphs
    .replace(/\n\n+/g, '</p><p class="mb-4">')
    
    // Convert URLs to links
    .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">$1</a>')
    
    // Improved bullet list handling - catch more patterns including section headers with hyphens
    // First: handle lines that start with hyphen + space + text (normal bullet points)
    .replace(/^[-–•]\s+(.+)$/gm, '<li class="ml-6 mb-2 list-disc">$1</li>')
    
    // Second: handle lines where hyphen is followed by text (no space) that isn't a section header
    .replace(/^[-]([^\s:].+)$/gm, '<li class="ml-6 mb-2 list-disc">$1</li>')
    
    // Third: specifically handle section headers that start with hyphen (like "- PicPay Lovers:")
    .replace(/^[-]\s*([^:]+):(.*)$/gm, '<li class="ml-6 mb-2 list-disc"><strong>$1:</strong>$2</li>')
    
    // Improve numbered list detection and formatting
    // First wrap each numbered item in proper <li> with ordered styling
    .replace(/^(\d+)[.):]\s+(.+)$/gm, '<li class="ml-6 mb-2 list-decimal" value="$1">$2</li>');
  
  // Now process the lists with proper wrapping
  let listProcessed = '';
  let inBulletList = false;
  let inNumberedList = false;
  
  // Split by lines to process lists properly
  const lines = formatted.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if this line is a bullet list item
    if (line.includes('<li class="ml-6 mb-2 list-disc">')) {
      if (!inBulletList) {
        // Start a new bullet list
        listProcessed += '<ul class="my-4 space-y-2">\n';
        inBulletList = true;
      }
      listProcessed += line + '\n';
    } 
    // Check if this line is a numbered list item
    else if (line.includes('<li class="ml-6 mb-2 list-decimal"')) {
      if (!inNumberedList) {
        // Start a new numbered list
        listProcessed += '<ol class="my-4 space-y-2">\n';
        inNumberedList = true;
      }
      listProcessed += line + '\n';
    }
    // This line is not a list item
    else {
      // If we were in a bullet list, close it
      if (inBulletList) {
        listProcessed += '</ul>\n';
        inBulletList = false;
      }
      // If we were in a numbered list, close it
      if (inNumberedList) {
        listProcessed += '</ol>\n';
        inNumberedList = false;
      }
      listProcessed += line + '\n';
    }
  }
  
  // Close any open lists at the end
  if (inBulletList) {
    listProcessed += '</ul>\n';
  }
  if (inNumberedList) {
    listProcessed += '</ol>\n';
  }
  
  formatted = listProcessed;
  
  // Wrap in paragraph tags if needed
  if (!formatted.startsWith('<')) {
    formatted = '<p class="mb-4">' + formatted;
  }
  if (!formatted.endsWith('>')) {
    formatted += '</p>';
  }
  
  return formatted;
};
