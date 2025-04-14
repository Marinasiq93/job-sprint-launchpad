
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface JobSearchPreferences {
  target_role: string
  target_sector: string
  target_company_size: string
  target_region: string
  preferred_contact_type?: string
}

interface EnrichedContact {
  full_name: string
  title: string
  company: string
  inferred_sector: string
  inferred_company_size: string
  inferred_contact_type: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { preferences, contact } = await req.json() as {
      preferences: JobSearchPreferences
      contact: EnrichedContact
    }

    // Calculate match score based on multiple factors
    let score = 3 // Base score
    let reasons = []

    // Check sector match
    if (contact.inferred_sector.toLowerCase() === preferences.target_sector.toLowerCase()) {
      score += 1
      reasons.push("Atua no setor desejado")
    }

    // Check company size match
    if (contact.inferred_company_size === preferences.target_company_size) {
      score += 0.5
      reasons.push("Empresa do porte ideal")
    }

    // Check contact type relevance
    if (preferences.preferred_contact_type && 
        contact.inferred_contact_type.toLowerCase() === preferences.preferred_contact_type.toLowerCase()) {
      score += 0.5
      reasons.push("Perfil profissional estratégico")
    }

    // Determine relevance level
    let relevancia = "Média"
    if (score >= 4) relevancia = "Alta"
    if (score <= 2) relevancia = "Baixa"

    // Format final response
    const matchResult = {
      match: score >= 3,
      relevancia,
      motivo: reasons.join(". ") || "Conexão pode ser relevante para sua busca",
      score: Math.min(Math.round(score), 5)
    }

    return new Response(JSON.stringify(matchResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
