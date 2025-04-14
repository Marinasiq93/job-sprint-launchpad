
import { useState } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Copy, RefreshCw, Linkedin } from "lucide-react";
import { toast } from "@/lib/toast";
import { useMediaQuery } from "@/hooks/use-media-query";

interface Connection {
  id: string;
  full_name: string;
  title: string;
  company: string;
  relevancia: "Alta" | "Média" | "Baixa";
  motivo: string;
  score: number;
  suggestedMessage: string;
  linkedin_url?: string;
}

interface ConnectionResultsProps {
  connections: Connection[];
  onRegenerateMessage: (connectionId: string) => Promise<void>;
}

export const ConnectionResults = ({ connections, onRegenerateMessage }: ConnectionResultsProps) => {
  const [loadingRegenerate, setLoadingRegenerate] = useState<Record<string, boolean>>({});
  const isMobile = useMediaQuery("(max-width: 768px)");

  const handleCopyMessage = (message: string, name: string) => {
    navigator.clipboard.writeText(message);
    toast.success(`Mensagem para ${name} copiada!`);
  };

  const handleRegenerateMessage = async (connectionId: string) => {
    setLoadingRegenerate((prev) => ({ ...prev, [connectionId]: true }));
    
    try {
      await onRegenerateMessage(connectionId);
      toast.success("Mensagem regenerada com sucesso!");
    } catch (error) {
      toast.error("Erro ao regenerar mensagem. Tente novamente.");
    } finally {
      setLoadingRegenerate((prev) => ({ ...prev, [connectionId]: false }));
    }
  };

  const openLinkedInProfile = (url?: string) => {
    if (!url) {
      toast.error("URL do LinkedIn não disponível para este contato");
      return;
    }
    window.open(url, "_blank");
  };

  const getBadgeVariant = (relevancia: string) => {
    switch (relevancia) {
      case "Alta":
        return "bg-green-500 hover:bg-green-600";
      case "Média":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "Baixa":
        return "bg-gray-500 hover:bg-gray-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  if (isMobile) {
    return (
      <div className="space-y-4">
        {connections.map((connection) => (
          <Card key={connection.id} className="relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-2 h-full ${connection.relevancia === "Alta" ? "bg-green-500" : connection.relevancia === "Média" ? "bg-yellow-500" : "bg-gray-500"}`} />
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{connection.full_name}</CardTitle>
                  <p className="text-sm text-gray-500">{connection.title} • {connection.company}</p>
                </div>
                <Badge className={getBadgeVariant(connection.relevancia)}>
                  {connection.relevancia} afinidade
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pb-2">
              <div>
                <h4 className="text-sm font-semibold mb-1">Por que conectar</h4>
                <p className="text-sm">{connection.motivo}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-1">Mensagem sugerida</h4>
                <p className="text-sm bg-gray-50 p-2 rounded-md border">
                  {connection.suggestedMessage}
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleRegenerateMessage(connection.id)}
                disabled={loadingRegenerate[connection.id]}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${loadingRegenerate[connection.id] ? "animate-spin" : ""}`} />
                Regenerar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopyMessage(connection.suggestedMessage, connection.full_name)}
              >
                <Copy className="h-4 w-4 mr-1" />
                Copiar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openLinkedInProfile(connection.linkedin_url)}
                disabled={!connection.linkedin_url}
              >
                <Linkedin className="h-4 w-4 mr-1" />
                LinkedIn
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Cargo e Empresa</TableHead>
          <TableHead>Afinidade</TableHead>
          <TableHead>Motivo</TableHead>
          <TableHead>Mensagem Sugerida</TableHead>
          <TableHead className="w-[220px]">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {connections.map((connection) => (
          <TableRow key={connection.id}>
            <TableCell className="font-medium">{connection.full_name}</TableCell>
            <TableCell>{connection.title} • {connection.company}</TableCell>
            <TableCell>
              <Badge className={getBadgeVariant(connection.relevancia)}>
                {connection.relevancia} afinidade
              </Badge>
            </TableCell>
            <TableCell>{connection.motivo}</TableCell>
            <TableCell className="max-w-xs truncate">
              <div className="bg-gray-50 p-2 rounded-md border">
                {connection.suggestedMessage}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRegenerateMessage(connection.id)}
                  disabled={loadingRegenerate[connection.id]}
                >
                  <RefreshCw className={`h-4 w-4 mr-1 ${loadingRegenerate[connection.id] ? "animate-spin" : ""}`} />
                  Regenerar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyMessage(connection.suggestedMessage, connection.full_name)}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copiar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openLinkedInProfile(connection.linkedin_url)}
                  disabled={!connection.linkedin_url}
                >
                  <Linkedin className="h-4 w-4 mr-1" />
                  LinkedIn
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
