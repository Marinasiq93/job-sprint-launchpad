
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

interface LinkedInContact {
  first_name: string;
  last_name: string;
  company?: string;
  position?: string;
  linkedin_url?: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { contacts } = await req.json();
    console.log(`Received ${contacts?.length || 0} contacts for enrichment`);

    if (!Array.isArray(contacts) || contacts.length === 0) {
      console.log("No contacts provided or empty array");
      throw new Error('Contacts must be a non-empty array');
    }

    // Log the first contact to help with debugging
    if (contacts.length > 0) {
      console.log("First contact sample:", JSON.stringify(contacts[0]));
    }

    const enrichedContacts = contacts.map((contact: LinkedInContact) => {
      const enrichedData = inferContactData(contact);
      console.log(`Enriched ${contact.first_name} ${contact.last_name}`);
      
      return {
        ...contact,
        ...enrichedData
      };
    });

    console.log(`Successfully enriched ${enrichedContacts.length} contacts`);

    return new Response(JSON.stringify({ contacts: enrichedContacts }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error in enrich-linkedin-contacts:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function inferContactData(contact: LinkedInContact) {
  // Basic logic to infer industry, company size, and contact type
  // This can be enhanced with more sophisticated rules or AI
  const position = (contact.position || '').toLowerCase();
  const company = (contact.company || '').toLowerCase();

  let contactType = 'Other';
  if (position.includes('recruit') || position.includes('talent')) {
    contactType = 'Recruiter';
  } else if (position.includes('manager') || position.includes('director') || position.includes('head')) {
    contactType = 'Decision-maker';
  } else if (position.includes('ceo') || position.includes('cto') || position.includes('cio') || position.includes('coo')) {
    contactType = 'C-level';
  }

  // Basic industry inference
  let industry = 'Outros';
  if (company.includes('tech') || company.includes('software') || company.includes('tecnologia') || company.includes('ti')) {
    industry = 'Tecnologia';
  } else if (company.includes('bank') || company.includes('fintech') || company.includes('finance') || company.includes('banco')) {
    industry = 'Fintech';
  } else if (company.includes('health') || company.includes('saude') || company.includes('hospital')) {
    industry = 'Saúde';
  }

  // Simple company size inference based on known companies or keywords
  let companySize = '11-50'; // default size
  if (company.includes('google') || company.includes('microsoft') || company.includes('amazon') || company.includes('meta')) {
    companySize = '1000+';
  } else if (company.includes('startup') || company.includes('pequena')) {
    companySize = '1-10';
  } else if (company.includes('medio') || company.includes('media')) {
    companySize = '51-200';
  } else if (company.includes('grande') || company.includes('enterprise')) {
    companySize = '201-1000';
  }

  return {
    setor: industry,
    porte_empresa: companySize,
    tipo_perfil: contactType
  };
}
