
import { Loader2 } from "lucide-react";

const LoadingState = () => {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
      <Loader2 className="h-10 w-10 animate-spin mb-4" />
      <p>Analisando informações da empresa...</p>
    </div>
  );
};

export default LoadingState;
