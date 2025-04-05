
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import DocumentUpload from "./pages/DocumentUpload";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import NewSprint from "./pages/NewSprint";
import SprintCultura from "./pages/sprint/SprintCultura";
import SprintFitAnalysis from "./pages/sprint/SprintFitAnalysis";
import TestRunnerPage from "./pages/TestRunner";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding/documents" element={<DocumentUpload />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/profile" element={<Profile />} />
          <Route path="/dashboard/new-sprint" element={<NewSprint />} />
          <Route path="/dashboard/sprint/:sprintId/cultura" element={<SprintCultura />} />
          <Route path="/dashboard/sprint/:sprintId/fit-analysis" element={<SprintFitAnalysis />} />
          <Route path="/test-runner" element={<TestRunnerPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
