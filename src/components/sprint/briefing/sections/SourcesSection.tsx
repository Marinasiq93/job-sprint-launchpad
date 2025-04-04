
import { Separator } from "@/components/ui/separator";
import { ExternalLink } from "lucide-react";

interface Source {
  title: string;
  url: string;
}

interface SourcesSectionProps {
  sources: Source[];
}

const SourcesSection = ({ sources }: SourcesSectionProps) => {
  // Only render if we have sources
  if (!sources || sources.length === 0) {
    return null;
  }
  
  return (
    <>
      <Separator className="my-8" />
      
      <section>
        <h3 className="text-xl font-semibold mb-5">Fontes</h3>
        <div className="space-y-3">
          {sources.map((source, index) => (
            <div key={index} className="flex items-start">
              <div className="flex items-center justify-center h-5 w-5 rounded-full bg-primary/10 text-primary text-xs font-medium mr-2 flex-shrink-0">
                {index + 1}
              </div>
              <a 
                href={source.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm flex items-start group hover:bg-gray-50 p-1 rounded-md transition-colors text-blue-600 hover:text-blue-800 flex-1 break-all"
              >
                <ExternalLink className="h-3.5 w-3.5 mr-1.5 flex-shrink-0 text-gray-400 group-hover:text-blue-500 mt-0.5" />
                <span className="text-sm line-clamp-2 break-words">
                  {source.title || source.url}
                </span>
              </a>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default SourcesSection;
