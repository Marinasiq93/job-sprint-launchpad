import { useState } from "react"
import DashboardLayout from "@/components/DashboardLayout"
import { LinkedInCSVUpload } from "@/components/linkedin/LinkedInCSVUpload"
import { UserPreferencesForm } from "@/components/linkedin/UserPreferencesForm"
import { ConnectionResults } from "@/components/linkedin/ConnectionResults"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/lib/toast"
import { useLinkedInConnections } from "@/hooks/use-linkedin-connections"
import { Loader2 } from "lucide-react"

interface UserPreferences {
  target_role: string
  target_sector: string[]
  target_company_size: string[]
  target_region: string
}

const LinkedInConnections = () => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [activeTab, setActiveTab] = useState("import")
  
  const { connections, loading, error, regenerateMessage, refreshConnections } = useLinkedInConnections(preferences)

  const handlePreferencesSubmit = async (prefs: UserPreferences) => {
    try {
      setPreferences(prefs)
      toast.success("Preferências salvas com sucesso!")
      
      // Switch to results tab if there are connections available
      if (connections.length > 0) {
        await refreshConnections()
        setActiveTab("results")
      }
    } catch (err) {
      console.error("Error saving preferences:", err)
      toast.error("Erro ao salvar preferências. Tente novamente.")
    }
  }

  const handleCSVUpload = async () => {
    if (preferences) {
      await refreshConnections()
      setActiveTab("results")
    } else {
      setActiveTab("preferences")
      toast.info("Por favor, defina suas preferências para analisarmos suas conexões")
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Conexões do LinkedIn</h1>
          <p className="text-gray-500 mt-1">
            Gerencie suas conexões estratégicas do LinkedIn
          </p>
        </div>

        <Tabs defaultValue="import" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="import">Importar</TabsTrigger>
            <TabsTrigger value="preferences">Preferências</TabsTrigger>
            <TabsTrigger value="results" disabled={connections.length === 0}>Resultados</TabsTrigger>
          </TabsList>
          
          <TabsContent value="import">
            <Card>
              <CardHeader>
                <CardTitle>Importar Conexões</CardTitle>
                <CardDescription>
                  Faça upload do arquivo CSV exportado do LinkedIn para enriquecer seus contatos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LinkedInCSVUpload onUploadSuccess={handleCSVUpload} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Preferências de Busca</CardTitle>
                <CardDescription>
                  Defina seus objetivos de carreira para encontrar conexões estratégicas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserPreferencesForm 
                  onSubmit={handlePreferencesSubmit}
                  initialValues={preferences || undefined}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="results">
            <Card>
              <CardHeader>
                <CardTitle>Conexões estratégicas para sua próxima oportunidade</CardTitle>
                <CardDescription>
                  Selecionamos as pessoas mais alinhadas com seu objetivo de carreira para você se conectar.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    <span className="ml-2 text-gray-500">Processando suas conexões...</span>
                  </div>
                ) : error ? (
                  <div className="text-center py-12 text-red-500">
                    <p>Erro ao carregar conexões: {error}</p>
                  </div>
                ) : connections.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">
                      Nenhuma conexão encontrada. Importe suas conexões do LinkedIn e defina suas preferências.
                    </p>
                  </div>
                ) : (
                  <ConnectionResults 
                    connections={connections}
                    onRegenerateMessage={regenerateMessage}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

export default LinkedInConnections
