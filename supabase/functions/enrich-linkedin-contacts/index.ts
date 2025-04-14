
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

interface LinkedInContact {
  first_name: string;
  last_name: string;
  company: string;
  position: string;
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

    if (!Array.isArray(contacts)) {
      throw new Error('Contacts must be an array');
    }

    const enrichedContacts = contacts.map((contact: LinkedInContact) => {
      const enrichedData = inferContactData(contact);
      return {
        ...contact,
        ...enrichedData
      };
    });

    return new Response(JSON.stringify({ contacts: enrichedContacts }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function inferContactData(contact: LinkedInContact) {
  // Basic logic to infer industry, company size, and contact type
  // This can be enhanced with more sophisticated rules or AI
  const position = contact.position?.toLowerCase() || '';
  const company = contact.company?.toLowerCase() || '';

  let contactType = 'Other';
  if (position.includes('recruit') || position.includes('talent')) {
    contactType = 'Recruiter';
  } else if (position.includes('manager') || position.includes('director') || position.includes('head')) {
    contactType = 'Decision-maker';
  }

  // Basic industry inference
  let industry = 'Outros';
  if (company.includes('tech') || company.includes('software')) {
    industry = 'Tecnologia';
  } else if (company.includes('bank') || company.includes('fintech')) {
    industry = 'Fintech';
  }

  // Simple company size inference based on known companies
  let companySize = '11-50'; // default size
  if (company.includes('google') || company.includes('microsoft')) {
    companySize = '1000+';
  }

  return {
    setor: industry,
    porte_empresa: companySize,
    tipo_perfil: contactType
  };
}
