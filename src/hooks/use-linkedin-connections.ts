
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Connection {
  id: string;
  full_name: string;
  title: string;
  company: string;
  relevancia: "Alta" | "Média" | "Baixa";
  motivo: string;
  score: number;
  suggestedMessage: string;
  linkedin_url?: string;
}

interface UserPreferences {
  target_role: string;
  target_sector: string[];
  target_company_size: string[];
  target_region: string;
}

export const useLinkedInConnections = () => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConnections = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch connections from Supabase
      const { data: linkedinConnections, error: fetchError } = await supabase
        .from('linkedin_connections')
        .select('*');
        
      if (fetchError) throw fetchError;
      
      if (!linkedinConnections || linkedinConnections.length === 0) {
        setConnections([]);
        setLoading(false);
        return;
      }
      
      // Fetch user preferences
      const { data: preferencesData, error: preferencesError } = await supabase
        .from('user_preferences')
        .select('*')
        .single();
        
      if (preferencesError && preferencesError.code !== 'PGRST116') {
        throw preferencesError;
      }
      
      const preferences = preferencesData || {
        target_role: "",
        target_sector: [],
        target_company_size: [],
        target_region: ""
      };

      // Process each connection with the match function
      const processedConnections = await Promise.all(
        linkedinConnections.map(async (contact) => {
          const contactData = {
            full_name: `${contact.first_name} ${contact.last_name}`,
            title: contact.position || "",
            company: contact.company || "",
            inferred_sector: contact.industry || "",
            inferred_company_size: contact.company_size || "",
            inferred_contact_type: contact.contact_type || ""
          };

          // Call the match-linkedin-connection edge function to analyze the match
          const { data: matchResult, error: matchError } = await supabase.functions
            .invoke('match-linkedin-connection', {
              body: {
                preferences: {
                  target_role: preferences.target_role,
                  target_sector: preferences.target_sector?.[0] || "",
                  target_company_size: preferences.target_company_size?.[0] || "",
                  target_region: preferences.target_region || ""
                },
                contact: contactData
              }
            });

          if (matchError) throw matchError;

          // Generate a suggested message (simplified version for now)
          const suggestedMessage = generateSuggestedMessage(
            contactData.full_name.split(' ')[0],
            preferences.target_role,
            contactData.company,
            matchResult.motivo
          );

          return {
            id: contact.id,
            full_name: contactData.full_name,
            title: contactData.title,
            company: contactData.company,
            relevancia: matchResult.relevancia,
            motivo: matchResult.motivo,
            score: matchResult.score,
            suggestedMessage,
            linkedin_url: contact.linkedin_url
          };
        })
      );

      // Sort connections by score (descending)
      const sortedConnections = processedConnections.sort((a, b) => b.score - a.score);
      setConnections(sortedConnections);
    } catch (err: any) {
      console.error("Error fetching connections:", err);
      setError(err.message || "Erro ao buscar conexões");
    } finally {
      setLoading(false);
    }
  };

  const regenerateMessage = async (connectionId: string) => {
    const connection = connections.find(conn => conn.id === connectionId);
    if (!connection) return;

    try {
      // Fetch user preferences
      const { data: preferencesData, error: preferencesError } = await supabase
        .from('user_preferences')
        .select('*')
        .single();

      if (preferencesError && preferencesError.code !== 'PGRST116') {
        throw preferencesError;
      }

      const preferences = preferencesData || {
        target_role: ""
      };

      // Generate a new message
      const newMessage = generateSuggestedMessage(
        connection.full_name.split(' ')[0],
        preferences.target_role,
        connection.company,
        connection.motivo,
        true // Flag to generate variation
      );

      // Update the connection with the new message
      setConnections(prevConnections =>
        prevConnections.map(conn =>
          conn.id === connectionId
            ? { ...conn, suggestedMessage: newMessage }
            : conn
        )
      );
    } catch (error) {
      console.error("Error regenerating message:", error);
      throw error;
    }
  };

  // Helper function to generate suggested messages
  const generateSuggestedMessage = (
    firstName: string,
    targetRole: string,
    company: string,
    matchReason: string,
    variation = false
  ) => {
    const greetings = [
      "Olá",
      "Oi",
      "Bom dia",
      "Boa tarde"
    ];

    const intros = [
      "Notei que você trabalha na",
      "Vi que você faz parte da equipe da",
      "Percebi que você atua na",
      "Observei que você trabalha na"
    ];

    const connections = [
      `e estou em busca de oportunidades como ${targetRole}.`,
      `e estou explorando possibilidades na área de ${targetRole}.`,
      `e estou procurando me conectar com profissionais na área de ${targetRole}.`,
      `e gostaria de expandir minha rede na área de ${targetRole}.`
    ];

    const closings = [
      "Podemos conversar sobre isso?",
      "Você teria disponibilidade para uma conversa rápida?",
      "Poderíamos trocar algumas ideias sobre o mercado?",
      "Gostaria de me conectar para conversarmos sobre isso?"
    ];

    const greeting = greetings[variation ? Math.floor(Math.random() * greetings.length) : 0];
    const intro = intros[variation ? Math.floor(Math.random() * intros.length) : 0];
    const connection = connections[variation ? Math.floor(Math.random() * connections.length) : 0];
    const closing = closings[variation ? Math.floor(Math.random() * closings.length) : 0];

    return `${greeting} ${firstName}, ${intro} ${company} ${connection} ${matchReason}. ${closing}`;
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  return {
    connections,
    loading,
    error,
    refreshConnections: fetchConnections,
    regenerateMessage
  };
};
