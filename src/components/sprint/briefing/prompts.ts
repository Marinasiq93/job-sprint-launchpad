
import { BRIEFING_CATEGORIES } from "./briefingConstants";

// Perplexity prompts for each category
export const perplexityPromptsByCategory = {
  [BRIEFING_CATEGORIES.CULTURE_VALUES]: (companyName: string, companyWebsite: string) => 
    `Utilize o nome da empresa ${companyName} e a URL institucional ${companyWebsite} para gerar este conteúdo.
    Visite especificamente o site institucional da empresa ${companyWebsite} para esta análise.
    
    Comece com um breve overview da empresa ${companyName}: o que ela faz, seu tamanho, mercado, e principais produtos.
    
    Em seguida, FOQUE A MAIOR PARTE da sua análise nos VALORES CORPORATIVOS da empresa:
    * Extraia e liste os valores e princípios EXPLICITAMENTE DECLARADOS no site da empresa
    * Para cada valor identificado, explique brevemente como ele se manifesta na cultura
    * Extraia CITAÇÕES DIRETAS do site sobre valores e cultura, se disponíveis
    * EVITE REPETIR as mesmas informações em diferentes pontos da análise
    
    Inclua também:
    * Informações do site oficial (seção "Sobre Nós", "Missão/Visão/Valores", "Cultura", etc.)
    * Entrevistas com fundadores ou executivos que mencionem valores
    * Reviews de funcionários no Glassdoor sobre a cultura
    
    ESTRUTURE SUA RESPOSTA COM:
    1. Overview da empresa (1 parágrafo)
    2. Valores Explícitos (em lista com bullets, sem repetições)
    3. Como esses valores se aplicam (sem repetir os valores, apenas explicar como se aplicam)
    4. Citações relevantes sobre a cultura (em itálico)
    
    Finalize com NOTÍCIAS RECENTES:
    Liste 3 NOTÍCIAS RECENTES sobre a empresa (dos últimos 6 meses), no formato:
    1. [DATA DD/MM/AAAA] - [TÍTULO] - [FONTE: URL completo da notícia]
    2. [DATA DD/MM/AAAA] - [TÍTULO] - [FONTE: URL completo da notícia]
    3. [DATA DD/MM/AAAA] - [TÍTULO] - [FONTE: URL completo da notícia]`,
  
  [BRIEFING_CATEGORIES.MISSION_VISION]: (companyName: string, companyWebsite: string) => 
    `Utilize o nome da empresa ${companyName} e a URL institucional ${companyWebsite} para gerar este conteúdo.
    Visite especificamente o site institucional da empresa ${companyWebsite} para esta análise.
    
    Primeiro, traga um resumo geral da empresa ${companyName}: setor de atuação, produtos, e posicionamento no mercado. 
    
    Depois, detalhe com CITAÇÕES DIRETAS quando possível:
    * MISSÃO: O propósito declarado da empresa (por que ela existe)
    * VISÃO: Onde a empresa deseja chegar no futuro
    * PROPÓSITO: Causa maior ou impacto social que a empresa busca gerar
    
    EVITE REPETIR as mesmas informações em diferentes partes da análise.
    
    Busque essas informações prioritariamente no site institucional da empresa, em seções como "Sobre Nós", 
    "Quem Somos", "Missão e Visão", ou similares.
    
    ESTRUTURE SUA RESPOSTA COM:
    1. Overview da empresa (1 parágrafo)
    2. Missão Oficial (com citação direta se disponível)
    3. Visão de Futuro (com citação direta se disponível)
    4. Propósito e Impacto Social (se mencionado)
    
    Finalize com NOTÍCIAS RECENTES:
    Liste 3 NOTÍCIAS RECENTES sobre a empresa (dos últimos 6 meses), no formato:
    1. [DATA DD/MM/AAAA] - [TÍTULO] - [FONTE: URL completo da notícia]
    2. [DATA DD/MM/AAAA] - [TÍTULO] - [FONTE: URL completo da notícia]
    3. [DATA DD/MM/AAAA] - [TÍTULO] - [FONTE: URL completo da notícia]`,
  
  [BRIEFING_CATEGORIES.PRODUCT_MARKET]: (companyName: string, companyWebsite: string) => 
    `Utilize o nome da empresa ${companyName} e a URL institucional ${companyWebsite} para gerar este conteúdo.
    Visite especificamente o site institucional da empresa ${companyWebsite} para esta análise.
    
    Comece com um panorama da empresa ${companyName}: produtos e serviços oferecidos, público-alvo, e contexto de mercado. 
    
    Em seguida, explique detalhadamente:
    * Perfil típico dos usuários/clientes da empresa
    * Setores e indústrias onde seus produtos são mais utilizados
    * Casos de uso e aplicações principais dos produtos
    * Concorrentes diretos no mercado
    
    EVITE REPETIR as mesmas informações em diferentes partes da análise.
    
    Consulte o site oficial da empresa, páginas de produtos, casos de uso, e depoimentos de clientes.
    
    ESTRUTURE SUA RESPOSTA COM:
    1. Overview do Produto/Serviço (1 parágrafo)
    2. Perfil dos Usuários/Clientes (lista com bullets sem repetições)
    3. Setores e Aplicações (sem repetir as informações anteriores)
    4. Mercado e Competidores (mencione 3-5 principais concorrentes)
    
    Finalize com NOTÍCIAS RECENTES:
    Liste 3 NOTÍCIAS RECENTES sobre o produto/serviço ou empresa (dos últimos 6 meses), no formato:
    1. [DATA DD/MM/AAAA] - [TÍTULO] - [FONTE: URL completo da notícia]
    2. [DATA DD/MM/AAAA] - [TÍTULO] - [FONTE: URL completo da notícia]
    3. [DATA DD/MM/AAAA] - [TÍTULO] - [FONTE: URL completo da notícia]`,
  
  [BRIEFING_CATEGORIES.LEADERSHIP]: (companyName: string, companyWebsite: string) => 
    `Utilize o nome da empresa ${companyName} e a URL institucional ${companyWebsite} para gerar este conteúdo.
    Visite especificamente o site institucional da empresa ${companyWebsite} para esta análise.
    
    Forneça uma visão geral da empresa ${companyName}: o que ela faz, em que estágio está (startup, scale-up, enterprise) 
    e qual seu posicionamento no setor. 
    
    Em seguida, descreva detalhadamente o time de liderança:
    * Quem são os fundadores, CEO, CPO, CTO, etc. (com nomes e cargos)
    * Background profissional resumido dessas pessoas
    * Citações ou posicionamentos públicos dos líderes sobre negócio, cultura ou gestão
    
    EVITE REPETIR as mesmas informações em diferentes partes da análise.
    
    Busque essas informações no site da empresa (seção "Equipe", "Liderança", "Sobre Nós"), LinkedIn, 
    e entrevistas públicas.
    
    ESTRUTURE SUA RESPOSTA COM:
    1. Overview da Empresa (1 parágrafo)
    2. Fundadores e História de Fundação (sem repetir informações do overview)
    3. Principais Executivos (lista com nome, cargo e breve background)
    4. Estilo de Liderança e Cultura (baseado em entrevistas/declarações)
    
    Finalize com NOTÍCIAS RECENTES:
    Liste 3 NOTÍCIAS RECENTES sobre a liderança/empresa (dos últimos 6 meses), no formato:
    1. [DATA DD/MM/AAAA] - [TÍTULO] - [FONTE: URL completo da notícia]
    2. [DATA DD/MM/AAAA] - [TÍTULO] - [FONTE: URL completo da notícia]
    3. [DATA DD/MM/AAAA] - [TÍTULO] - [FONTE: URL completo da notícia]`,
  
  [BRIEFING_CATEGORIES.COMPANY_HISTORY]: (companyName: string, companyWebsite: string) => 
    `Utilize o nome da empresa ${companyName} e a URL institucional ${companyWebsite} para gerar este conteúdo.
    Visite especificamente o site institucional da empresa ${companyWebsite} para esta análise.
    
    Dê primeiro um resumo sobre a empresa ${companyName}: mercado, produto e tamanho atual. 
    
    Em seguida, conte a história da empresa de forma cronológica:
    * Ano e contexto de fundação da empresa
    * Fundadores e motivação inicial para criar a empresa
    * Marcos históricos importantes (lançamentos, expansões, pivôs)
    * Rodadas de investimento e crescimento financeiro
    
    EVITE REPETIR as mesmas informações em diferentes partes da análise.
    
    Busque essa cronologia no site da empresa (seção "História", "Sobre Nós", "Nossa Jornada"), 
    releases de imprensa, e plataformas como Crunchbase.
    
    ESTRUTURE SUA RESPOSTA COM:
    1. Overview da Empresa Hoje (1 parágrafo)
    2. Fundação (quando, onde, por quem, motivação inicial)
    3. Linha do Tempo (liste cronologicamente 5-7 marcos importantes, com anos)
    4. Crescimento e Investimentos (sem repetir informações anteriores)
    
    Finalize com NOTÍCIAS RECENTES:
    Liste 3 NOTÍCIAS RECENTES sobre a empresa (dos últimos 6 meses), no formato:
    1. [DATA DD/MM/AAAA] - [TÍTULO] - [FONTE: URL completo da notícia]
    2. [DATA DD/MM/AAAA] - [TÍTULO] - [FONTE: URL completo da notícia]
    3. [DATA DD/MM/AAAA] - [TÍTULO] - [FONTE: URL completo da notícia]`
};
