
import { Separator } from "@/components/ui/separator";
import { BriefingContent as BriefingContentType } from "./briefingService";
import { categoryTitles } from "./briefingConstants";

interface BriefingContentProps {
  currentBriefing: BriefingContentType;
  currentCategory: string;
}

const BriefingContent = ({ currentBriefing, currentCategory }: BriefingContentProps) => {
  return (
    <div className="space-y-4">
      <section>
        <h3 className="font-medium text-sm text-muted-foreground mb-2">{categoryTitles[currentCategory]}</h3>
        <p className="text-sm">
          {currentBriefing.overview}
        </p>
      </section>
      
      <Separator />
      
      <section>
        <h3 className="font-medium text-sm text-muted-foreground mb-2">Pontos Principais</h3>
        <ul className="text-sm space-y-1 list-disc pl-5">
          {currentBriefing.highlights.map((highlight, index) => (
            <li key={index}>{highlight}</li>
          ))}
        </ul>
      </section>
      
      <Separator />
      
      <section>
        <h3 className="font-medium text-sm text-muted-foreground mb-2">Análise de Contexto</h3>
        <p className="text-sm">
          {currentBriefing.summary}
        </p>
      </section>
    </div>
  );
};

export default BriefingContent;
