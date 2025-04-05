
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

const LoadingState: React.FC = () => {
  console.log("Rendering LoadingState component");
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Loader2 className="h-5 w-5 animate-spin text-jobsprint-blue" />
        <p className="text-sm text-jobsprint-blue">Analisando compatibilidade com a vaga...</p>
      </div>
      
      <div className="space-y-2 py-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      
      <div className="space-y-2 py-2">
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      
      <div className="space-y-2 py-2">
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  );
};

export default LoadingState;
