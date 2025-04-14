
import { useState } from "react"
import DashboardLayout from "@/components/DashboardLayout"
import { LinkedInCSVUpload } from "@/components/linkedin/LinkedInCSVUpload"
import { UserPreferencesForm } from "@/components/linkedin/UserPreferencesForm"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/lib/toast"

interface UserPreferences {
  target_role: string
  target_sector: string
  target_company_size: string
  target_region: string
  preferred_contact_type?: string
}

const LinkedInConnections = () => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)

  const handlePreferencesSubmit = (prefs: UserPreferences) => {
    setPreferences(prefs)
    toast.success("Preferências salvas com sucesso!")
    console.log("Saved preferences:", prefs)
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

        <Tabs defaultValue="import">
          <TabsList>
            <TabsTrigger value="import">Importar</TabsTrigger>
            <TabsTrigger value="preferences">Preferências</TabsTrigger>
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
                <LinkedInCSVUpload />
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
                <UserPreferencesForm onSubmit={handlePreferencesSubmit} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

export default LinkedInConnections
