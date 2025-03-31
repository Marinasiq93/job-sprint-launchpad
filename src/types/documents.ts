
import { Json } from "@/integrations/supabase/types";

// Define a type for the user document that matches our database schema
export interface UserDocument {
  id: string;
  user_id: string;
  resume_file_name: string | null;
  resume_text: string | null;
  cover_letter_file_name: string | null;
  cover_letter_text: string | null;
  reference_files: Array<ReferenceFile> | null;
  reference_text: string | null;
  created_at: string;
  updated_at: string;
}

// Define a type for reference files
export interface ReferenceFile {
  name: string;
  size: number;
  type: string;
}
