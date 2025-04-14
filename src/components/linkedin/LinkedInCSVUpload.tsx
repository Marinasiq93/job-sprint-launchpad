
import { useState } from 'react'
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "@/lib/toast"
import { supabase } from "@/integrations/supabase/client"

interface LinkedInCSVUploadProps {
  onUploadSuccess?: () => void
}

export const LinkedInCSVUpload = ({ onUploadSuccess }: LinkedInCSVUploadProps) => {
  const [isLoading, setIsLoading] = useState(false)

  const processCSV = async (file: File) => {
    const text = await file.text()
    const rows = text.split('\n')
    const headers = rows[0].split(',')
    
    const contacts = rows.slice(1).map(row => {
      const values = row.split(',')
      return headers.reduce((obj: any, header, index) => {
        obj[header.trim().toLowerCase().replace(/['"]+/g, '')] = values[index]?.replace(/['"]+/g, '')
        return obj
      }, {})
    }).filter(contact => contact['first name'] && contact['last name'])

    return contacts.map(contact => ({
      first_name: contact['first name'],
      last_name: contact['last name'],
      company: contact['company'],
      position: contact['position'],
      linkedin_url: contact['profile url']
    }))
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    try {
      const contacts = await processCSV(file)
      
      // Enrich contacts using edge function
      const { data: enrichedData, error: enrichError } = await supabase.functions
        .invoke('enrich-linkedin-contacts', {
          body: { contacts }
        })

      if (enrichError) throw enrichError

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
          contact_type: contact.tipo_perfil
        })))

      if (insertError) throw insertError

      toast.success('Contatos importados com sucesso!')
      onUploadSuccess?.()
    } catch (error) {
      console.error('Error processing contacts:', error)
      toast.error('Erro ao processar contatos. Por favor tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
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
