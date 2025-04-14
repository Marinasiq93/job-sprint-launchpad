
import { useState, useEffect, useCallback } from "react";
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

export const useLinkedInConnections = (preferences: UserPreferences | null) => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConnections = useCallback(async () => {
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
      
      // If no preferences, just return the connections without matching
      if (!preferences || !preferences.target_role) {
        const basicConnections = linkedinConnections.map(contact => ({
          id: contact.id,
          full_name: `${contact.first_name} ${contact.last_name}`,
          title: contact.position || "",
          company: contact.company || "",
          relevancia: "Média" as "Alta" | "Média" | "Baixa",
          motivo: "Configure suas preferências para ver mais detalhes de afinidade.",
          score: 3,
          suggestedMessage: `Olá ${contact.first_name}, notei que você trabalha na ${contact.company || "sua empresa"}. Gostaria de me conectar para expandir nossa rede profissional. Podemos conversar sobre isso?`,
          linkedin_url: contact.linkedin_url
        }));
        setConnections(basicConnections);
        setLoading(false);
        return;
      }

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

          // Generate match data using edge function or local logic
          let matchResult;
          try {
            // Try to use the edge function if available
            const { data, error: matchError } = await supabase.functions
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
            matchResult = data;
          } catch (err) {
            // Fallback: Simple scoring algorithm if edge function fails
            console.error("Edge function error:", err);
            const score = Math.floor(Math.random() * 5) + 1;
            matchResult = {
              relevancia: score >= 4 ? "Alta" : score >= 3 ? "Média" : "Baixa",
              motivo: `Contato trabalha na ${contactData.company}, que pode ter oportunidades na área de ${preferences.target_role}.`,
              score
            };
          }

          // Generate a suggested message
          const suggestedMessage = await generateSuggestedMessage(
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
  }, [preferences]);

  const regenerateMessage = async (connectionId: string) => {
    if (!preferences?.target_role) return;
    
    const connection = connections.find(conn => conn.id === connectionId);
    if (!connection) return;

    try {
      // Generate a new message using the edge function
      const { data, error } = await supabase.functions.invoke('generate-linkedin-message', {
        body: {
          firstName: connection.full_name.split(' ')[0],
          targetRole: preferences.target_role,
          company: connection.company,
          matchReason: connection.motivo
        }
      });

      if (error) throw error;

      // Update the connection with the new message
      const newMessage = data.message;
      setConnections(prevConnections =>
        prevConnections.map(conn =>
          conn.id === connectionId
            ? { ...conn, suggestedMessage: newMessage }
            : conn
        )
      );
      
      return newMessage;
    } catch (error) {
      console.error("Error regenerating message:", error);
      throw error;
    }
  };

  // Helper function to generate suggested messages
  const generateSuggestedMessage = async (
    firstName: string,
    targetRole: string,
    company: string,
    matchReason: string
  ) => {
    try {
      // Try to generate message using the edge function
      const { data, error } = await supabase.functions.invoke('generate-linkedin-message', {
        body: {
          firstName,
          targetRole,
          company,
          matchReason
        }
      });

      if (error) throw error;
      return data.message;
    } catch (err) {
      // Fallback: Generate a basic message if the function fails
      console.error("Error generating message:", err);
      
      const greetings = ["Olá", "Oi", "Bom dia", "Boa tarde"];
      const intros = [
        "Notei que você trabalha na",
        "Vi que você faz parte da equipe da",
        "Percebi que você atua na"
      ];
      const connections = [
        `e estou em busca de oportunidades como ${targetRole}.`,
        `e estou explorando possibilidades na área de ${targetRole}.`
      ];
      const closings = [
        "Podemos conversar sobre isso?",
        "Você teria disponibilidade para uma conversa rápida?"
      ];

      const greeting = greetings[Math.floor(Math.random() * greetings.length)];
      const intro = intros[Math.floor(Math.random() * intros.length)];
      const connection = connections[Math.floor(Math.random() * connections.length)];
      const closing = closings[Math.floor(Math.random() * closings.length)];

      return `${greeting} ${firstName}, ${intro} ${company} ${connection} ${matchReason}. ${closing}`;
    }
  };

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  return {
    connections,
    loading,
    error,
    refreshConnections: fetchConnections,
    regenerateMessage
  };
};
