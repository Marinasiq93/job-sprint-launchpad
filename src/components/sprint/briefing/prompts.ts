
import { BRIEFING_CATEGORIES } from "./briefingConstants";

// Perplexity prompts for each category
export const perplexityPromptsByCategory = {
  [BRIEFING_CATEGORIES.CULTURE_VALUES]: (companyName: string, companyWebsite: string) => 
    `Analise a empresa ${companyName} (${companyWebsite}).
    
    Comece com um overview da empresa ${companyName}: quem ela é, quando foi fundada, e qual seu posicionamento no mercado.
    
    Em seguida, apresente os valores corporativos e cultura da empresa:
    - Liste e explique os valores e princípios da empresa
    - Detalhe como esses valores se manifestam na cultura
    - Mencione programas internos ou iniciativas que reflitam esses valores
    
    Finalize com 3 notícias recentes sobre a empresa (dos últimos 6 meses)`,
  
  [BRIEFING_CATEGORIES.MISSION_VISION]: (companyName: string, companyWebsite: string) => 
    `Analise a empresa ${companyName} (${companyWebsite}).
    
    Apresente uma visão concisa (máximo 400 palavras) sobre a missão e visão da empresa ${companyName}:
    
    ## Missão e Visão
    - Apresente a missão oficial da empresa (por que ela existe)
    - Explique a visão oficial da empresa (onde deseja chegar no futuro)
    
    ## Iniciativas Concretas
    - Liste 2-3 exemplos práticos de como a empresa está trabalhando para cumprir sua missão
    - Mencione projetos específicos ou iniciativas que demonstrem o alinhamento com a missão declarada
    
    Mantenha o conteúdo objetivo, factual e livre de linguagem promocional excessiva.`,
  
  [BRIEFING_CATEGORIES.PRODUCT_MARKET]: (companyName: string, companyWebsite: string) => 
    `Analise a empresa ${companyName} (${companyWebsite}).
    
    Apresente uma visão concisa (máximo 500 palavras total) dos produtos e mercado da empresa ${companyName}:
    
    ## Produtos e Serviços
    - Lista objetiva dos 3-5 principais produtos/serviços
    - Diferenciais tecnológicos ou inovadores (apenas os mais relevantes)
    
    ## Perfil dos Clientes
    - Segmentos de mercado atendidos
    - Problemas específicos que a solução resolve
    
    ## Mercado e Competição
    - Principais concorrentes diretos (máximo 3)
    - Diferenciais competitivos mais relevantes
    - Uma tendência importante do setor
    
    Mantenha cada seção curta e evite completamente repetições de informações.`,
  
  [BRIEFING_CATEGORIES.LEADERSHIP]: (companyName: string, companyWebsite: string) => 
    `Analise a empresa ${companyName} (${companyWebsite}).
    
    Forneça uma visão concisa e objetiva sobre as pessoas por trás da empresa ${companyName}.
    Não inclua informações gerais sobre a empresa, produtos ou valores que já foram abordados em outras perguntas.
    
    ## Fundadores
    Apresente um breve perfil de cada fundador incluindo:
    - Nome e cargo atual na empresa (se ainda ocupar alguma posição)
    - Formação acadêmica e experiência profissional relevante
    - Papel na fundação da empresa
    - Alguma conquista ou contribuição notável (se disponível)
    
    ## Equipe Executiva
    Se houver outros membros-chave da liderança além dos fundadores:
    - Mencione apenas os principais executivos (C-level ou diretores) que NÃO são fundadores
    - Para cada um, inclua cargo atual, formação e experiência anterior relevante
    - Seja breve e objetivo, focando apenas em 3-5 executivos no máximo
    
    Mantenha o conteúdo conciso e focado nos perfis profissionais das pessoas, sem repetições
    ou informações desnecessárias sobre a empresa em si.`,
  
  [BRIEFING_CATEGORIES.COMPANY_HISTORY]: (companyName: string, companyWebsite: string) => 
    `Analise a empresa ${companyName} (${companyWebsite}).
    
    Apresente uma versão concisa (máximo 400 palavras) da história da empresa com foco em:
    
    ## Fundação
    - Ano e local de fundação
    - Motivação original e o problema que os fundadores buscaram resolver
    - Contexto de mercado na época da fundação
    
    ## Principais Marcos
    - Lista objetiva de 3-5 momentos decisivos na trajetória da empresa
    - Mudanças estratégicas importantes
    - Principais pivôs ou transformações no modelo de negócio
    
    Evite detalhes excessivos e mantenha o foco nos eventos mais significativos
    que ajudam a entender a evolução e os valores da empresa.`
};
