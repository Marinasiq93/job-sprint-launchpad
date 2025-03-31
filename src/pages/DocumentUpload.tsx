
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { FileCheck, FileText, Upload, AlertCircle, Check } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const DocumentUpload = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);
  const [coverLetterText, setCoverLetterText] = useState("");
  const [referenceFiles, setReferenceFiles] = useState<File[]>([]);
  const [referenceText, setReferenceText] = useState("");

  const handleResumeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleCoverLetterFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCoverLetterFile(e.target.files[0]);
    }
  };

  const handleReferenceFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files);
      setReferenceFiles([...referenceFiles, ...fileArray]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate that at least resume is provided (file or text)
    if (!resumeFile && !resumeText.trim()) {
      toast.error("É necessário fornecer pelo menos o currículo.");
      setIsLoading(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Save document data to localStorage (for demo only)
      localStorage.setItem('userDocuments', JSON.stringify({
        resume: resumeFile ? resumeFile.name : "texto do currículo",
        coverLetter: coverLetterFile ? coverLetterFile.name : (coverLetterText ? "texto da carta" : null),
        references: referenceFiles.length ? referenceFiles.map(f => f.name) : (referenceText ? "texto das referências" : null),
      }));

      toast.success("Documentos salvos com sucesso!");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Erro ao salvar documentos. Tente novamente.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    toast("Você pode adicionar seus documentos mais tarde no seu perfil.", {
      icon: <AlertCircle className="h-4 w-4" />,
    });
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 border-b">
        <div className="container">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full jobsprint-gradient-bg flex items-center justify-center">
              <span className="text-white font-bold text-sm">JS</span>
            </div>
            <h1 className="text-xl font-semibold">JobSprints</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-8 max-w-3xl animate-fade-in">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Configure seus documentos</h2>
          <p className="text-gray-500 mt-1">
            Esses documentos serão usados como base para personalizar suas candidaturas
          </p>
        </div>

        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Dica</AlertTitle>
          <AlertDescription>
            Esses documentos serão usados como base para personalizar suas candidaturas. Você poderá atualizá-los depois no seu perfil.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Resume Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5 text-jobsprint-blue" />
                Currículo
                <span className="text-red-500 ml-1">*</span>
              </CardTitle>
              <CardDescription>
                Faça upload do seu currículo ou cole o texto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-gray-50 transition-colors">
                  <Input
                    id="resume-file"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeFileChange}
                    className="hidden"
                  />
                  <Label 
                    htmlFor="resume-file" 
                    className="flex flex-col items-center cursor-pointer py-4"
                  >
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm font-medium text-gray-700">
                      {resumeFile ? resumeFile.name : "Clique para fazer upload do arquivo"}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      PDF, DOC, DOCX (max 5MB)
                    </span>
                  </Label>
                  {resumeFile && (
                    <div className="flex items-center justify-center mt-2 text-green-600 text-sm">
                      <FileCheck className="h-4 w-4 mr-1" />
                      Arquivo selecionado
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resume-text">Ou cole o texto do seu currículo:</Label>
                  <Textarea
                    id="resume-text"
                    placeholder="Cole o conteúdo do seu currículo aqui..."
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    rows={5}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cover Letter Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5 text-jobsprint-pink" />
                Carta de Apresentação (Opcional)
              </CardTitle>
              <CardDescription>
                Faça upload de uma carta de apresentação base ou cole o texto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-gray-50 transition-colors">
                  <Input
                    id="cover-letter-file"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleCoverLetterFileChange}
                    className="hidden"
                  />
                  <Label 
                    htmlFor="cover-letter-file" 
                    className="flex flex-col items-center cursor-pointer py-4"
                  >
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm font-medium text-gray-700">
                      {coverLetterFile ? coverLetterFile.name : "Clique para fazer upload do arquivo"}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      PDF, DOC, DOCX (max 5MB)
                    </span>
                  </Label>
                  {coverLetterFile && (
                    <div className="flex items-center justify-center mt-2 text-green-600 text-sm">
                      <FileCheck className="h-4 w-4 mr-1" />
                      Arquivo selecionado
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cover-letter-text">Ou cole o texto da sua carta de apresentação:</Label>
                  <Textarea
                    id="cover-letter-text"
                    placeholder="Cole o conteúdo da sua carta de apresentação aqui..."
                    value={coverLetterText}
                    onChange={(e) => setCoverLetterText(e.target.value)}
                    rows={5}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reference Letters Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5 text-jobsprint-blue" />
                Cartas de Referência (Opcional)
              </CardTitle>
              <CardDescription>
                Faça upload de cartas de referência ou cole o texto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-gray-50 transition-colors">
                  <Input
                    id="reference-files"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleReferenceFilesChange}
                    multiple
                    className="hidden"
                  />
                  <Label 
                    htmlFor="reference-files" 
                    className="flex flex-col items-center cursor-pointer py-4"
                  >
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm font-medium text-gray-700">
                      {referenceFiles.length > 0 
                        ? `${referenceFiles.length} arquivo(s) selecionado(s)` 
                        : "Clique para fazer upload dos arquivos"}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      PDF, DOC, DOCX (max 5MB por arquivo)
                    </span>
                  </Label>
                  {referenceFiles.length > 0 && (
                    <div className="flex items-center justify-center mt-2 text-green-600 text-sm">
                      <FileCheck className="h-4 w-4 mr-1" />
                      {referenceFiles.length} arquivo(s) selecionado(s)
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reference-text">Ou cole o texto das suas referências:</Label>
                  <Textarea
                    id="reference-text"
                    placeholder="Cole o conteúdo das suas cartas de referência aqui..."
                    value={referenceText}
                    onChange={(e) => setReferenceText(e.target.value)}
                    rows={5}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleSkip}
            >
              Pular por agora
            </Button>
            <Button 
              type="submit" 
              className="bg-jobsprint-blue hover:bg-jobsprint-blue/90"
              disabled={isLoading || (!resumeFile && !resumeText.trim())}
            >
              {isLoading ? "Salvando..." : "Salvar e Acessar meu Dashboard"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default DocumentUpload;
