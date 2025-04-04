
import { formatContent } from "../formatters/contentFormatter";

interface MainContentSectionProps {
  overview: string;
}

const MainContentSection = ({ overview }: MainContentSectionProps) => {
  const formattedContent = formatContent(overview);
  
  return (
    <section className="overflow-auto">
      <div 
        className="prose prose-sm max-w-none text-sm leading-relaxed"
        dangerouslySetInnerHTML={{ __html: formattedContent }}
      />
    </section>
  );
};

export default MainContentSection;
