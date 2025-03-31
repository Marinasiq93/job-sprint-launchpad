import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/lib/toast";

const formSchema = z.object({
  firstName: z.string().min(2, {
    message: "O nome deve ter pelo menos 2 caracteres.",
  }),
  lastName: z.string().min(2, {
    message: "O sobrenome deve ter pelo menos 2 caracteres.",
  }),
  email: z.string().email({
    message: "Por favor, insira um email válido.",
  }),
  password: z.string().min(6, {
    message: "A senha deve ter pelo menos 6 caracteres.",
  }),
  confirmPassword: z.string().min(6, {
    message: "A confirmação de senha deve ter pelo menos 6 caracteres.",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem.",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

const Signup = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      localStorage.setItem('user', JSON.stringify({
        id: Date.now().toString(),
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
      }));
      
      toast.success("Conta criada com sucesso!");
      
      navigate("/onboarding/documents");
    } catch (error) {
      toast.error("Erro ao criar conta. Tente novamente.");
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
            <h2 className="text-2xl font-bold">Crie sua conta</h2>
            <p className="text-gray-500 mt-1">
              Comece sua jornada para conquistas profissionais
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome*</FormLabel>
                      <FormControl>
                        <Input placeholder="João" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sobrenome*</FormLabel>
                      <FormControl>
                        <Input placeholder="Silva" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email*</FormLabel>
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
                    <FormLabel>Senha*</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="******" {...field} />
                    </FormControl>
                    <FormDescription>
                      Pelo menos 6 caracteres
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirme a senha*</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="******" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full bg-jobsprint-blue hover:bg-jobsprint-blue/90"
                disabled={isLoading}
              >
                {isLoading ? "Criando conta..." : "Criar Conta"}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm">
            <p className="text-gray-500">
              Já tem uma conta?{" "}
              <Link to="/login" className="text-jobsprint-blue hover:underline">
                Faça login
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Signup;
