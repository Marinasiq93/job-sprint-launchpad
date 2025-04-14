
import { useForm } from "react-hook-form"
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
  const form = useForm<UserPreferences>({
    defaultValues: {
      target_role: "",
      target_sector: "",
      target_company_size: "",
      target_region: "",
      preferred_contact_type: undefined
    }
  })

  const handleSubmit = form.handleSubmit((data) => {
    onSubmit(data)
  })

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

        <FormField
          control={form.control}
          name="target_sector"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Setor de Interesse</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ex: Tecnologia" />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="target_company_size"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tamanho da Empresa</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tamanho" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="1-10">1-10 funcionários</SelectItem>
                  <SelectItem value="11-50">11-50 funcionários</SelectItem>
                  <SelectItem value="51-200">51-200 funcionários</SelectItem>
                  <SelectItem value="201-1000">201-1000 funcionários</SelectItem>
                  <SelectItem value="1000+">1000+ funcionários</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

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

        <FormField
          control={form.control}
          name="preferred_contact_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Contato Preferido</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="recruiter">Recrutador</SelectItem>
                  <SelectItem value="decision-maker">Tomador de Decisão</SelectItem>
                  <SelectItem value="peer">Colega da Área</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <Button type="submit">Salvar Preferências</Button>
      </form>
    </Form>
  )
}
