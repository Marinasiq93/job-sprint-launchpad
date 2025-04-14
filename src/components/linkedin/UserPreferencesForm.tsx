
import { useState } from "react"
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

interface UserPreferences {
  target_role: string
  target_sector: string
  target_company_size: string
  target_region: string
  preferred_contact_type?: string
}

interface UserPreferencesFormProps {
  onSubmit: (preferences: UserPreferences) => void
}

export const UserPreferencesForm = ({ onSubmit }: UserPreferencesFormProps) => {
  const [preferences, setPreferences] = useState<UserPreferences>({
    target_role: "",
    target_sector: "",
    target_company_size: "",
    target_region: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(preferences)
  }

  return (
    <Form>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField>
          <FormItem>
            <FormLabel>Cargo Desejado</FormLabel>
            <FormControl>
              <Input
                value={preferences.target_role}
                onChange={(e) => setPreferences({ ...preferences, target_role: e.target.value })}
                placeholder="Ex: Product Manager"
              />
            </FormControl>
          </FormItem>
        </FormField>

        <FormField>
          <FormItem>
            <FormLabel>Setor de Interesse</FormLabel>
            <FormControl>
              <Input
                value={preferences.target_sector}
                onChange={(e) => setPreferences({ ...preferences, target_sector: e.target.value })}
                placeholder="Ex: Tecnologia"
              />
            </FormControl>
          </FormItem>
        </FormField>

        <FormField>
          <FormItem>
            <FormLabel>Tamanho da Empresa</FormLabel>
            <Select
              value={preferences.target_company_size}
              onValueChange={(value) => setPreferences({ ...preferences, target_company_size: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tamanho" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-10">1-10 funcionários</SelectItem>
                <SelectItem value="11-50">11-50 funcionários</SelectItem>
                <SelectItem value="51-200">51-200 funcionários</SelectItem>
                <SelectItem value="201-1000">201-1000 funcionários</SelectItem>
                <SelectItem value="1000+">1000+ funcionários</SelectItem>
              </SelectContent>
            </Select>
          </FormItem>
        </FormField>

        <FormField>
          <FormItem>
            <FormLabel>Região</FormLabel>
            <FormControl>
              <Input
                value={preferences.target_region}
                onChange={(e) => setPreferences({ ...preferences, target_region: e.target.value })}
                placeholder="Ex: Brasil, Remoto"
              />
            </FormControl>
          </FormItem>
        </FormField>

        <FormField>
          <FormItem>
            <FormLabel>Tipo de Contato Preferido</FormLabel>
            <Select
              value={preferences.preferred_contact_type}
              onValueChange={(value) => setPreferences({ ...preferences, preferred_contact_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recruiter">Recrutador</SelectItem>
                <SelectItem value="decision-maker">Tomador de Decisão</SelectItem>
                <SelectItem value="peer">Colega da Área</SelectItem>
              </SelectContent>
            </Select>
          </FormItem>
        </FormField>

        <Button type="submit">Salvar Preferências</Button>
      </form>
    </Form>
  )
}
