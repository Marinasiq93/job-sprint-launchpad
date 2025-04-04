
import { Separator } from "@/components/ui/separator";

interface NewsItem {
  title: string;
  date?: string;
  url?: string;
}

interface NewsSectionProps {
  newsItems: NewsItem[];
}

const NewsSection = ({ newsItems }: NewsSectionProps) => {
  if (!newsItems || newsItems.length === 0) {
    return null;
  }
  
  return (
    <>
      <Separator className="my-8" />
      
      <section>
        <h3 className="text-xl font-semibold mb-5">Notícias Recentes</h3>
        <div className="space-y-3">
          {newsItems.map((news, index) => (
            <div key={index} className="flex items-start">
              <div className="flex items-center justify-center h-5 w-5 rounded-full bg-primary/10 text-primary text-xs font-medium mr-2 flex-shrink-0">
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">
                  {news.url ? (
                    <a 
                      href={news.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="hover:text-blue-600"
                    >
                      {news.title}
                    </a>
                  ) : (
                    news.title
                  )}
                </div>
                {news.date && <div className="text-xs text-muted-foreground">{news.date}</div>}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default NewsSection;
