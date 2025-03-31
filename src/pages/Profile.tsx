
import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { ProfileDocuments } from "@/components/profile/ProfileDocuments";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Edit2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/lib/toast";

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
  updated_at: string;
}

const Profile = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setIsLoading(false);
          return;
        }

        setUserEmail(session.user.email || "");

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        if (error) {
          console.error("Erro ao buscar perfil:", error);
          toast.error("Erro ao carregar perfil");
          setIsLoading(false);
          return;
        }

        setProfile(data);
        if (data) {
          setFirstName(data.first_name || "");
          setLastName(data.last_name || "");
        }
      } catch (error) {
        console.error("Erro não esperado:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing && profile) {
      // Reset form to current values when entering edit mode
      setFirstName(profile.first_name || "");
      setLastName(profile.last_name || "");
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Sessão expirada. Faça login novamente.");
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.user.id);

      if (error) {
        console.error("Erro ao atualizar perfil:", error);
        toast.error("Erro ao salvar alterações");
        return;
      }

      // Update local state
      setProfile({
        ...(profile as Profile),
        first_name: firstName,
        last_name: lastName,
        updated_at: new Date().toISOString()
      });

      setIsEditing(false);
      toast.success("Perfil atualizado com sucesso!");
    } catch (error) {
      console.error("Erro não esperado:", error);
      toast.error("Erro ao salvar alterações");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">Carregando perfil...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container">
        <h1 className="text-2xl font-bold mb-6">Meu Perfil</h1>
        
        <div className="grid gap-6 md:grid-cols-7">
          <div className="col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Informações Pessoais</CardTitle>
                  <Button 
                    onClick={handleEditToggle}
                    variant="ghost" 
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <Edit2 className="h-4 w-4" />
                    {isEditing ? "Cancelar" : "Editar"}
                  </Button>
                </div>
                <CardDescription>
                  Seus dados de perfil
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="first-name">Nome</Label>
                      <Input
                        id="first-name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Digite seu nome"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last-name">Sobrenome</Label>
                      <Input
                        id="last-name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Digite seu sobrenome"
                      />
                    </div>
                    <div className="pt-2">
                      <Button 
                        onClick={handleSave}
                        className="w-full bg-jobsprint-blue hover:bg-jobsprint-blue/90"
                        disabled={isLoading}
                      >
                        {isLoading ? "Salvando..." : "Salvar Alterações"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <User className="h-5 w-5 text-gray-500 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Nome Completo</p>
                        <p>
                          {profile?.first_name || profile?.last_name 
                            ? `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim()
                            : "Não informado"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-gray-500 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Email</p>
                        <p>{userEmail}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-4">
            <ProfileDocuments />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
