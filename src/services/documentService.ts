
import { supabase } from "@/integrations/supabase/client";
import { UserDocument, ReferenceFile } from "@/types/documents";
import { Json } from "@/integrations/supabase/types";

export const documentService = {
  async getUserDocuments() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return { data: null, error: new Error("Not authenticated") };
    }

    const { data, error } = await supabase
      .from('user_documents')
      .select('*')
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching documents:", error);
      return { data: null, error };
    }

    return { data: data as UserDocument | null, error: null };
  },

  async saveUserDocuments({ 
    resumeFileName, 
    resumeText, 
    coverLetterFileName, 
    coverLetterText, 
    referenceFiles, 
    referenceText 
  }: {
    resumeFileName: string | null;
    resumeText: string | null;
    coverLetterFileName: string | null;
    coverLetterText: string | null;
    referenceFiles: ReferenceFile[] | null;
    referenceText: string | null;
  }) {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return { data: null, error: new Error("Not authenticated") };
    }

    // Convert ReferenceFile[] to a format that can be stored as JSON in Supabase
    const referenceFilesData = referenceFiles && referenceFiles.length > 0 
      ? referenceFiles.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type
        }))
      : null;

    const { data, error } = await supabase
      .from('user_documents')
      .upsert({
        user_id: session.user.id,
        resume_file_name: resumeFileName,
        resume_text: resumeText,
        cover_letter_file_name: coverLetterFileName,
        cover_letter_text: coverLetterText,
        reference_files: referenceFilesData as unknown as Json,
        reference_text: referenceText
      }, { onConflict: 'user_id' });

    if (error) {
      console.error("Error saving documents:", error);
      return { success: false, error };
    }

    return { success: true, error: null };
  }
};
