
import React, { useState } from "react";
import { User, Mail, Edit2 } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/toast";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/profile";

interface ProfileInfoProps {
  profile: Profile | null;
  userEmail: string;
  isLoading: boolean;
}

export const ProfileInfo: React.FC<ProfileInfoProps> = ({
  profile,
  userEmail,
  isLoading
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(profile?.first_name || "");
  const [lastName, setLastName] = useState(profile?.last_name || "");

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

      setIsEditing(false);
      toast.success("Perfil atualizado com sucesso!");
      
      // Refresh the page to show updated info
      window.location.reload();
      
    } catch (error) {
      console.error("Erro não esperado:", error);
      toast.error("Erro ao salvar alterações");
    }
  };

  return (
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
  );
};
