
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MessageGenerationRequest {
  firstName: string
  targetRole: string
  company: string
  matchReason: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { firstName, targetRole, company, matchReason } = await req.json() as MessageGenerationRequest

    // Generate message components
    const greetings = ["Olá", "Oi", "Bom dia", "Boa tarde"]
    const intros = [
      "Notei que você trabalha na",
      "Vi que você faz parte da equipe da",
      "Percebi que você atua na",
      "Observei que você trabalha na"
    ]
    const connections = [
      `e estou em busca de oportunidades como ${targetRole}.`,
      `e estou explorando possibilidades na área de ${targetRole}.`,
      `e estou procurando me conectar com profissionais na área de ${targetRole}.`,
      `e gostaria de expandir minha rede na área de ${targetRole}.`
    ]
    const closings = [
      "Podemos conversar sobre isso?",
      "Você teria disponibilidade para uma conversa rápida?",
      "Poderíamos trocar algumas ideias sobre o mercado?",
      "Gostaria de me conectar para conversarmos sobre isso?"
    ]

    // Randomly select components to create variety
    const greeting = greetings[Math.floor(Math.random() * greetings.length)]
    const intro = intros[Math.floor(Math.random() * intros.length)]
    const connection = connections[Math.floor(Math.random() * connections.length)]
    const closing = closings[Math.floor(Math.random() * closings.length)]

    // Construct the message
    const message = `${greeting} ${firstName}, ${intro} ${company} ${connection} ${matchReason}. ${closing}`

    return new Response(JSON.stringify({ message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
