
import { useForm } from "react-hook-form"
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { MultiSelectTags } from "./MultiSelectTags"

interface UserPreferences {
  target_role: string
  target_sector: string[]
  target_company_size: string[]
  target_region: string
}

interface UserPreferencesFormProps {
  onSubmit: (preferences: UserPreferences) => void
}

export const UserPreferencesForm = ({ onSubmit }: UserPreferencesFormProps) => {
  const [selectedSectors, setSelectedSectors] = useState<string[]>([])
  const [selectedCompanySizes, setSelectedCompanySizes] = useState<string[]>([])
  
  const form = useForm<UserPreferences>({
    defaultValues: {
      target_role: "",
      target_sector: [],
      target_company_size: [],
      target_region: "",
    }
  })

  const handleSubmit = form.handleSubmit((data) => {
    data.target_sector = selectedSectors
    data.target_company_size = selectedCompanySizes
    onSubmit(data)
  })

  const sectors = [
    { value: "tecnologia", label: "Tecnologia" },
    { value: "financas", label: "Finanças" },
    { value: "saude", label: "Saúde" },
    { value: "educacao", label: "Educação" },
    { value: "varejo", label: "Varejo" }
  ]

  const companySizes = [
    { value: "1-10", label: "1-10 funcionários" },
    { value: "11-50", label: "11-50 funcionários" },
    { value: "51-200", label: "51-200 funcionários" },
    { value: "201-1000", label: "201-1000 funcionários" },
    { value: "1000+", label: "1000+ funcionários" }
  ]

  const toggleSector = (value: string) => {
    setSelectedSectors(prev => 
      prev.includes(value)
        ? prev.filter(item => item !== value)
        : [...prev, value]
    )
  }

  const toggleCompanySize = (value: string) => {
    setSelectedCompanySizes(prev => 
      prev.includes(value)
        ? prev.filter(item => item !== value)
        : [...prev, value]
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          control={form.control}
          name="target_role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cargo Desejado</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ex: Product Manager" />
              </FormControl>
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel>Setores de Interesse</FormLabel>
          <MultiSelectTags
            options={sectors}
            selected={selectedSectors}
            onSelect={toggleSector}
            onRemove={toggleSector}
            placeholder="Selecione setores"
            label="Adicionar setor"
          />
        </FormItem>

        <FormItem>
          <FormLabel>Tamanhos de Empresa</FormLabel>
          <MultiSelectTags
            options={companySizes}
            selected={selectedCompanySizes}
            onSelect={toggleCompanySize}
            onRemove={toggleCompanySize}
            placeholder="Selecione tamanhos"
            label="Adicionar tamanho"
          />
        </FormItem>

        <FormField
          control={form.control}
          name="target_region"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Região</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ex: Brasil, Remoto" />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit">Salvar Preferências</Button>
      </form>
    </Form>
  )
}
