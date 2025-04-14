
import { useState } from 'react'
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "@/lib/toast"
import { supabase } from "@/integrations/supabase/client"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface LinkedInCSVUploadProps {
  onUploadSuccess?: () => void
}

export const LinkedInCSVUpload = ({ onUploadSuccess }: LinkedInCSVUploadProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const processCSV = async (file: File) => {
    try {
      const text = await file.text()
      const rows = text.split('\n')
      
      if (rows.length <= 1) {
        throw new Error("CSV file appears to be empty or invalid")
      }
      
      const headers = rows[0].split(',')
      
      console.log("CSV headers:", headers)
      console.log("Total rows found:", rows.length)
      
      const contacts = rows.slice(1)
        .filter(row => row.trim().length > 0) // Skip empty lines
        .map(row => {
          const values = row.split(',')
          return headers.reduce((obj: any, header, index) => {
            const cleanHeader = header.trim().toLowerCase().replace(/['"]+/g, '')
            let value = values[index] ? values[index].replace(/['"]+/g, '') : ''
            obj[cleanHeader] = value
            return obj
          }, {})
        })
        .filter(contact => contact['first name'] && contact['last name'])
      
      console.log("Processed contacts:", contacts.length, contacts[0])
      
      if (contacts.length === 0) {
        throw new Error("No valid contacts found in CSV file")
      }

      return contacts.map(contact => ({
        first_name: contact['first name'],
        last_name: contact['last name'],
        company: contact['company'],
        position: contact['position'],
        linkedin_url: contact['profile url']
      }))
    } catch (error) {
      console.error("Error processing CSV:", error)
      throw new Error(`Failed to process CSV: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    const file = event.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    try {
      const contacts = await processCSV(file)
      console.log(`Sending ${contacts.length} contacts for enrichment...`)
      
      if (contacts.length === 0) {
        throw new Error("No valid contacts found in the CSV file. Please check the format.")
      }
      
      // Enrich contacts using edge function
      const { data: enrichedData, error: enrichError } = await supabase.functions
        .invoke('enrich-linkedin-contacts', {
          body: { contacts }
        })

      if (enrichError) {
        console.error("Enrichment error:", enrichError)
        throw enrichError
      }

      console.log("Enriched data received:", enrichedData)
      
      if (!enrichedData?.contacts || !Array.isArray(enrichedData.contacts) || enrichedData.contacts.length === 0) {
        throw new Error("No contacts were returned after enrichment")
      }

      // Store enriched contacts in database
      const { error: insertError } = await supabase.from('linkedin_connections')
        .insert(enrichedData.contacts.map((contact: any) => ({
          first_name: contact.first_name,
          last_name: contact.last_name,
          company: contact.company,
          position: contact.position,
          linkedin_url: contact.linkedin_url,
          industry: contact.setor,
          company_size: contact.porte_empresa,
          contact_type: contact.tipo_perfil,
          user_id: supabase.auth.getUser().then(res => res.data.user?.id)
        })))

      if (insertError) {
        console.error("Insert error:", insertError)
        throw insertError
      }

      toast.success('Contatos importados com sucesso!')
      onUploadSuccess?.()
    } catch (error) {
      console.error('Error processing contacts:', error)
      setError(error instanceof Error ? error.message : 'Erro desconhecido ao processar contatos')
      toast.error('Erro ao processar contatos. Por favor tente novamente.')
    } finally {
      setIsLoading(false)
      // Reset the file input so the same file can be uploaded again if needed
      const fileInput = document.getElementById('csv-file') as HTMLInputElement
      if (fileInput) fileInput.value = ''
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div>
        <Label htmlFor="csv-file">Selecione seu arquivo CSV do LinkedIn</Label>
        <Input
          id="csv-file"
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          disabled={isLoading}
          className="mt-2"
        />
      </div>
      <p className="text-sm text-gray-500">
        Exporte suas conexões do LinkedIn em Configurações {'>'} Dados e Privacidade {'>'} Como o LinkedIn usa seus dados {'>'} Obter uma cópia dos seus dados
      </p>
    </div>
  )
}
