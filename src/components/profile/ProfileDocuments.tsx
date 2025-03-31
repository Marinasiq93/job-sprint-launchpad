
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { FileText, FileCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/lib/toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface UserDocument {
  id: string;
  user_id: string;
  resume_file_name: string | null;
  resume_text: string | null;
  cover_letter_file_name: string | null;
  cover_letter_text: string | null;
  reference_files: Array<{name: string, size: number, type: string}> | null;
  reference_text: string | null;
  created_at: string;
  updated_at: string;
}

export const ProfileDocuments = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userDocuments, setUserDocuments] = useState<UserDocument | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [coverLetterText, setCoverLetterText] = useState("");
  const [referenceText, setReferenceText] = useState("");

  useEffect(() => {
    const fetchUserDocuments = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('user_documents')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (error) {
          console.error("Erro ao buscar documentos:", error);
          toast.error("Erro ao carregar documentos");
          setIsLoading(false);
          return;
        }

        setUserDocuments(data);
        if (data) {
          setResumeText(data.resume_text || "");
          setCoverLetterText(data.cover_letter_text || "");
          setReferenceText(data.reference_text || "");
        }
      } catch (error) {
        console.error("Erro não esperado:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDocuments();
  }, []);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      // Reset text fields to current values when entering edit mode
      if (userDocuments) {
        setResumeText(userDocuments.resume_text || "");
        setCoverLetterText(userDocuments.cover_letter_text || "");
        setReferenceText(userDocuments.reference_text || "");
      }
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
        .from('user_documents')
        .upsert({
          user_id: session.user.id,
          resume_file_name: userDocuments?.resume_file_name || null,
          resume_text: resumeText || null,
          cover_letter_file_name: userDocuments?.cover_letter_file_name || null,
          cover_letter_text: coverLetterText || null,
          reference_files: userDocuments?.reference_files || null,
          reference_text: referenceText || null
        }, { onConflict: 'user_id' });

      if (error) {
        console.error("Erro ao atualizar documentos:", error);
        toast.error("Erro ao salvar alterações");
        return;
      }

      // Update local state
      setUserDocuments({
        ...(userDocuments as UserDocument),
        resume_text: resumeText,
        cover_letter_text: coverLetterText,
        reference_text: referenceText,
        updated_at: new Date().toISOString()
      });

      setIsEditing(false);
      toast.success("Documentos atualizados com sucesso!");
    } catch (error) {
      console.error("Erro não esperado:", error);
      toast.error("Erro ao salvar alterações");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando documentos...</div>;
  }

  if (!userDocuments) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Você ainda não possui documentos. Por favor, adicione seus documentos para melhorar suas candidaturas.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Meus Documentos</h2>
        <Button 
          onClick={handleEditToggle}
          variant={isEditing ? "destructive" : "outline"}
        >
          {isEditing ? "Cancelar" : "Editar Documentos"}
        </Button>
      </div>

      <Separator />

      {/* Resume */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5 text-jobsprint-blue" />
            Currículo
          </CardTitle>
          <CardDescription>
            Seu currículo atual
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userDocuments.resume_file_name && (
            <div className="mb-4 p-3 bg-gray-50 rounded-md flex items-center">
              <FileCheck className="h-5 w-5 text-green-600 mr-2" />
              <span>{userDocuments.resume_file_name}</span>
            </div>
          )}

          {isEditing ? (
            <Textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Cole o texto do seu currículo aqui..."
              rows={5}
            />
          ) : (
            userDocuments.resume_text ? (
              <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded-md">
                {userDocuments.resume_text}
              </div>
            ) : (
              <div className="text-gray-500 italic">Nenhum texto de currículo fornecido</div>
            )
          )}
        </CardContent>
      </Card>

      {/* Cover Letter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5 text-jobsprint-pink" />
            Carta de Apresentação
          </CardTitle>
          <CardDescription>
            Sua carta de apresentação atual
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userDocuments.cover_letter_file_name && (
            <div className="mb-4 p-3 bg-gray-50 rounded-md flex items-center">
              <FileCheck className="h-5 w-5 text-green-600 mr-2" />
              <span>{userDocuments.cover_letter_file_name}</span>
            </div>
          )}

          {isEditing ? (
            <Textarea
              value={coverLetterText}
              onChange={(e) => setCoverLetterText(e.target.value)}
              placeholder="Cole o texto da sua carta de apresentação aqui..."
              rows={5}
            />
          ) : (
            userDocuments.cover_letter_text ? (
              <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded-md">
                {userDocuments.cover_letter_text}
              </div>
            ) : (
              <div className="text-gray-500 italic">Nenhuma carta de apresentação fornecida</div>
            )
          )}
        </CardContent>
      </Card>

      {/* References */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5 text-jobsprint-blue" />
            Referências
          </CardTitle>
          <CardDescription>
            Suas referências atuais
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userDocuments.reference_files && userDocuments.reference_files.length > 0 && (
            <div className="mb-4 space-y-2">
              {userDocuments.reference_files.map((file, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-md flex items-center">
                  <FileCheck className="h-5 w-5 text-green-600 mr-2" />
                  <span>{file.name}</span>
                </div>
              ))}
            </div>
          )}

          {isEditing ? (
            <Textarea
              value={referenceText}
              onChange={(e) => setReferenceText(e.target.value)}
              placeholder="Cole o texto das suas referências aqui..."
              rows={5}
            />
          ) : (
            userDocuments.reference_text ? (
              <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded-md">
                {userDocuments.reference_text}
              </div>
            ) : (
              <div className="text-gray-500 italic">Nenhuma referência fornecida</div>
            )
          )}
        </CardContent>
      </Card>

      {isEditing && (
        <div className="flex justify-end">
          <Button 
            onClick={handleSave}
            className="bg-jobsprint-blue hover:bg-jobsprint-blue/90"
            disabled={isLoading}
          >
            {isLoading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      )}
    </div>
  );
};
