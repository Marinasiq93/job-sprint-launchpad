
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/lib/toast";
import { Profile } from "@/types/profile";

export const useProfile = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setIsLoading(false);
        return;
      }

      setUserEmail(session.user.email || "");

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (error) {
        console.error("Erro ao buscar perfil:", error);
        toast.error("Erro ao carregar perfil");
        setIsLoading(false);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error("Erro não esperado:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return { profile, userEmail, isLoading };
};
