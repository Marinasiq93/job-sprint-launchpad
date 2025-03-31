
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import JobSprintCard from "@/components/sprint/JobSprintCard";
import { toast } from "@/lib/toast";

// Define the form data type
interface SprintFormData {
  jobTitle: string;
  companyName: string;
  companyWebsite: string;
  jobUrl?: string;
  jobDescription: string;
}

const NewSprint = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: SprintFormData) => {
    setIsSubmitting(true);
    
    try {
      // TODO: In the future, save the sprint data to the database
      console.log("Sprint data:", data);
      
      // Show success message
      toast.success("Sprint criada com sucesso!");
      
      // Navigate back to dashboard (future: navigate to next step)
      navigate("/dashboard");
    } catch (error) {
      console.error("Error creating sprint:", error);
      toast.error("Erro ao criar sprint. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 max-w-4xl animate-fade-in">
        <h1 className="text-2xl font-bold mb-2">Nova Sprint de Candidatura</h1>
        <p className="text-gray-500 mb-6">
          Inicie uma nova sprint para organizar sua candidatura de forma estratégica
        </p>
        
        <JobSprintCard onSubmit={handleSubmit} />
      </div>
    </DashboardLayout>
  );
};

export default NewSprint;
