
/**
 * Determines the optimal OCR providers based on file type and name
 */
export function selectProviders(file: File): { providers: string[], language: string } {
  let providers: string[] = [];
  let language = "pt"; // Default to Portuguese
  
  // For PDFs (common resume format), try multiple specialized providers
  if (file.type === "application/pdf") {
    if (file.name.toLowerCase().includes("resume") || 
        file.name.toLowerCase().includes("cv") ||
        file.name.toLowerCase().includes("curriculum") ||
        file.name.toLowerCase().includes("currículo")) {
      // For resume PDFs, use these specialized providers
      providers = ["microsoft", "amazon", "google"];
      console.log("Resume detected, using multiple specialized OCR providers");
    } else {
      // For regular PDFs
      providers = ["microsoft", "amazon"];
    }
  }
  // For images, Google's OCR is often good
  else if (file.type.startsWith("image/")) {
    providers = ["google", "microsoft"];
  }
  // For Word documents
  else if (file.type.includes("word") || file.type.includes("docx")) {
    providers = ["amazon", "microsoft"];
  }
  // Default fallback
  else {
    providers = ["amazon"];
  }
  
  // Additional language detection for better OCR
  if (file.name.toLowerCase().includes("en_") || 
      file.name.toLowerCase().includes("_en") ||
      file.name.toLowerCase().includes("english")) {
    language = "en";
    console.log("English language detected from filename");
  }
  
  return { providers, language };
}
