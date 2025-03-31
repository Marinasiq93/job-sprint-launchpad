
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

// Form schema with validation
const formSchema = z.object({
  jobTitle: z.string().min(1, "Nome da vaga é obrigatório"),
  companyName: z.string().min(1, "Nome da empresa é obrigatório"),
  companyWebsite: z.string().url("URL inválida").min(1, "Link do site é obrigatório"),
  jobUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  jobDescription: z.string().min(1, "Descrição da vaga é obrigatória"),
});

// Type definition based on schema
type FormValues = z.infer<typeof formSchema>;

interface JobSprintCardProps {
  onSubmit: (data: FormValues) => void;
}

const JobSprintCard = ({ onSubmit }: JobSprintCardProps) => {
  const [title, setTitle] = useState("Nova Sprint de Candidatura");

  // Initialize form with react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobTitle: "",
      companyName: "",
      companyWebsite: "",
      jobUrl: "",
      jobDescription: "",
    },
  });

  // Watch form fields to update title
  const watchJobTitle = form.watch("jobTitle");
  const watchCompanyName = form.watch("companyName");

  // Update card title when fields change
  useEffect(() => {
    if (watchJobTitle && watchCompanyName) {
      setTitle(`${watchJobTitle} na ${watchCompanyName}`);
    } else if (watchJobTitle) {
      setTitle(`${watchJobTitle}`);
    } else if (watchCompanyName) {
      setTitle(`Vaga na ${watchCompanyName}`);
    } else {
      setTitle("Nova Sprint de Candidatura");
    }
  }, [watchJobTitle, watchCompanyName]);

  // Form submission handler
  const handleSubmit = (data: FormValues) => {
    onSubmit(data);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-md hover:shadow-lg transition-shadow animate-fade-in">
      <CardHeader className="border-b pb-3">
        <CardTitle className="text-xl md:text-2xl font-bold text-center jobsprint-gradient-text">
          {title}
        </CardTitle>
      </CardHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent className="pt-6 space-y-4">
            {/* Job Title Field */}
            <FormField
              control={form.control}
              name="jobTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Vaga <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Product Marketing Manager" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Company Name Field */}
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Empresa <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Nubank" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Company Website Field */}
            <FormField
              control={form.control}
              name="companyWebsite"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link do Site Institucional da Empresa <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input 
                      type="url"
                      placeholder="https://nubank.com.br" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Job URL Field */}
            <FormField
              control={form.control}
              name="jobUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link da Vaga</FormLabel>
                  <FormControl>
                    <Input 
                      type="url"
                      placeholder="https://carreiras.nubank.com.br/pm-vaga" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Job Description Field */}
            <FormField
              control={form.control}
              name="jobDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição da Vaga <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Cole aqui a descrição completa da vaga" 
                      className="min-h-[120px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          
          <CardFooter className="flex flex-col gap-4 border-t pt-4">
            <Button 
              type="submit" 
              className="w-full bg-jobsprint-blue hover:bg-jobsprint-blue/90 font-semibold"
            >
              Começar minha Sprint
            </Button>
            
            <p className="text-center text-sm text-muted-foreground italic">
              Vamos montar sua candidatura com estratégia e confiança — passo a passo.
            </p>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default JobSprintCard;
