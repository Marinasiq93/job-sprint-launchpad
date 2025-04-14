
import DashboardLayout from "@/components/DashboardLayout";
import { LinkedInCSVUpload } from "@/components/linkedin/LinkedInCSVUpload";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

const LinkedInConnections = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Conexões do LinkedIn</h1>
          <p className="text-gray-500 mt-1">
            Gerencie suas conexões estratégicas do LinkedIn
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Importar Conexões</CardTitle>
            <CardDescription>
              Faça upload do arquivo CSV exportado do LinkedIn para enriquecer seus contatos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LinkedInCSVUpload />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default LinkedInConnections;
