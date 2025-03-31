import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/lib/toast";

// Define the form schema
const formSchema = z.object({
  email: z.string().email({
    message: "Por favor, insira um email válido.",
  }),
  password: z.string().min(1, {
    message: "A senha é obrigatória.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user exists (for demo only)
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        if (user.email === data.email) {
          // Password check would happen on the server in a real application
          toast.success("Login realizado com sucesso!");
          navigate("/dashboard");
          return;
        }
      }
      
      // If we get here, login failed
      toast.error("Email ou senha inválidos.");
    } catch (error) {
      toast.error("Erro ao fazer login. Tente novamente.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 border-b">
        <div className="container">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full jobsprint-gradient-bg flex items-center justify-center">
              <span className="text-white font-bold text-sm">JS</span>
            </div>
            <h1 className="text-xl font-semibold">JobSprints</h1>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="onboarding-container w-full max-w-md animate-fade-in">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold">Entre na sua conta</h2>
            <p className="text-gray-500 mt-1">
              Continue sua jornada para conquistas profissionais
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="seu@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="******" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-sm text-jobsprint-blue hover:underline">
                  Esqueceu a senha?
                </Link>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-jobsprint-blue hover:bg-jobsprint-blue/90"
                disabled={isLoading}
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm">
            <p className="text-gray-500">
              Ainda não tem uma conta?{" "}
              <Link to="/signup" className="text-jobsprint-blue hover:underline">
                Crie uma agora
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
