
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface DebugModeToggleProps {
  debugMode: boolean;
  setDebugMode: (value: boolean) => void;
}

const DebugModeToggle: React.FC<DebugModeToggleProps> = ({ debugMode, setDebugMode }) => {
  return (
    <div className="flex items-center justify-end space-x-2 mb-4">
      <Switch 
        id="debug-mode" 
        checked={debugMode} 
        onCheckedChange={setDebugMode}
      />
      <Label htmlFor="debug-mode" className="text-xs text-gray-500">
        Modo Debug
      </Label>
    </div>
  );
};

export default DebugModeToggle;
