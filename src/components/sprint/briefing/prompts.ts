
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
    
    Foque exclusivamente na missão, visão e propósito da empresa ${companyName}:
    - Apresente a missão oficial da empresa (por que ela existe)
    - Explique a visão oficial da empresa (onde deseja chegar no futuro)
    - Detalhe o propósito maior ou impacto social que a empresa busca gerar
    - Inclua citações inspiradoras dos fundadores ou liderança sobre o propósito da empresa
    
    Liste também exemplos concretos de como a empresa está trabalhando para atingir sua missão,
    como projetos específicos alinhados ao propósito declarado e iniciativas de impacto que refletem os valores.`,
  
  [BRIEFING_CATEGORIES.PRODUCT_MARKET]: (companyName: string, companyWebsite: string) => 
    `Analise a empresa ${companyName} (${companyWebsite}).
    
    Comece com um breve panorama dos produtos e serviços da empresa ${companyName}.
    
    Divida sua análise nas seguintes seções, evitando repetições:

    ## Produtos e Serviços
    - Principais produtos/serviços oferecidos
    - Características e diferenciais principais
    - Tecnologias ou inovações relevantes utilizadas
    
    ## Perfil dos Clientes
    - Perfil típico dos usuários/clientes
    - Principais casos de uso e aplicações
    - Problemas específicos que a solução resolve
    
    ## Mercado e Competição
    - Tamanho e crescimento do mercado
    - Principais concorrentes diretos
    - Diferenciais competitivos (seja conciso e evite repetir informações já mencionadas)
    - Tendências relevantes para o setor
    
    Seja objetivo e não repita as mesmas informações em seções diferentes. Para os diferenciais competitivos, 
    foque apenas no que realmente distingue a empresa dos concorrentes sem repetir características já mencionadas.`,
  
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
    
    Sem repetir informações já abordadas em outros tópicos, foque exclusivamente na trajetória histórica da empresa:
    
    ## Origem e Fundação
    - Ano e local de fundação
    - Contexto histórico e de mercado da época
    - História dos fundadores específica à criação da empresa
    - Motivação original para iniciar o negócio
    
    ## Marcos Históricos
    - Cronologia dos principais acontecimentos
    - Lançamentos transformadores
    - Pivôs estratégicos importantes
    - Momentos de superação de desafios
    
    ## Evolução e Crescimento
    - Como a empresa se transformou ao longo do tempo
    - Expansões geográficas ou de portfólio
    - Aquisições e fusões importantes
    - Mudanças significativas na estratégia ou posicionamento
    
    Apresente a história como uma narrativa que mostre a evolução da empresa e os aprendizados ao longo 
    do caminho, evitando repetir detalhes sobre produtos atuais ou cultura que já foram abordados em outros tópicos.`
};
