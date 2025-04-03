
import { BRIEFING_CATEGORIES } from "./briefingConstants";

// Perplexity prompts for each category
export const perplexityPromptsByCategory = {
  [BRIEFING_CATEGORIES.CULTURE_VALUES]: (companyName: string, companyWebsite: string) => 
    `Utilize o nome da empresa ${companyName} e a URL institucional ${companyWebsite} para gerar este conteúdo.
    Visite o site institucional da empresa ${companyWebsite} e faça uma pesquisa completa sobre a empresa.
    
    ## Visão Geral da ${companyName}
    
    Comece com um resumo abrangente da empresa: o que ela faz, tamanho, mercado, principais produtos, e posicionamento no setor.
    Inclua dados factuais como ano de fundação, sede, número aproximado de funcionários quando disponível.
    
    ## Valores Corporativos
    
    Detalhe os valores e princípios da empresa com CITAÇÕES DIRETAS quando possível:
    * Liste cada valor corporativo EXPLICITAMENTE DECLARADO no site
    * Para cada valor, explique como ele se manifesta na cultura 
    * Inclua exemplos concretos de como esses valores são aplicados
    * Mencione programas internos ou iniciativas que reflitam esses valores
    
    Busque essas informações em seções como "Sobre Nós", "Missão/Visão/Valores", "Cultura", "Carreiras".
    
    ## Notícias Recentes
    
    Liste 3 NOTÍCIAS RECENTES sobre a empresa (dos últimos 6 meses), no formato:
    1. [DATA DD/MM/AAAA] - [TÍTULO completo da notícia] - [FONTE: nome do site e URL completo]
    2. [DATA DD/MM/AAAA] - [TÍTULO completo da notícia] - [FONTE: nome do site e URL completo]
    3. [DATA DD/MM/AAAA] - [TÍTULO completo da notícia] - [FONTE: nome do site e URL completo]
    
    Citations:
    Ao final, liste todas as fontes utilizadas com URLs completas no formato:
    [1] URL completa
    [2] URL completa
    etc.`,
  
  [BRIEFING_CATEGORIES.MISSION_VISION]: (companyName: string, companyWebsite: string) => 
    `Utilize o nome da empresa ${companyName} e a URL institucional ${companyWebsite} para gerar este conteúdo.
    Visite o site institucional da empresa ${companyWebsite} e faça uma pesquisa completa sobre a empresa.
    
    ## Visão Geral da ${companyName}
    
    Comece com um resumo abrangente da empresa: o que ela faz, tamanho, mercado, principais produtos, e posicionamento no setor.
    Inclua dados factuais como ano de fundação, sede, número aproximado de funcionários quando disponível.
    
    ## Missão e Visão
    
    Detalhe com CITAÇÕES DIRETAS quando possível:
    * MISSÃO OFICIAL: O propósito declarado da empresa (por que ela existe)
    * VISÃO OFICIAL: Onde a empresa deseja chegar no futuro
    * PROPÓSITO: Causa maior ou impacto social que a empresa busca gerar
    
    Se a missão e visão não estiverem explicitamente declaradas, analise o conteúdo do site para inferir o propósito e direção da empresa.
    Inclua citações diretas do CEO ou liderança sobre o propósito da empresa.
    
    Busque essas informações em seções como "Sobre Nós", "Quem Somos", "Missão e Visão", ou similares.
    
    ## Notícias Recentes
    
    Liste 3 NOTÍCIAS RECENTES sobre a empresa (dos últimos 6 meses), no formato:
    1. [DATA DD/MM/AAAA] - [TÍTULO completo da notícia] - [FONTE: nome do site e URL completo]
    2. [DATA DD/MM/AAAA] - [TÍTULO completo da notícia] - [FONTE: nome do site e URL completo]
    3. [DATA DD/MM/AAAA] - [TÍTULO completo da notícia] - [FONTE: nome do site e URL completo]
    
    Citations:
    Ao final, liste todas as fontes utilizadas com URLs completas no formato:
    [1] URL completa
    [2] URL completa
    etc.`,
  
  [BRIEFING_CATEGORIES.PRODUCT_MARKET]: (companyName: string, companyWebsite: string) => 
    `Utilize o nome da empresa ${companyName} e a URL institucional ${companyWebsite} para gerar este conteúdo.
    Visite o site institucional da empresa ${companyWebsite} e faça uma pesquisa completa sobre a empresa.
    
    ## Visão Geral dos Produtos e Mercado
    
    Comece com um panorama abrangente da empresa ${companyName}: produtos e serviços oferecidos, público-alvo, e contexto de mercado.
    Inclua dados factuais sobre o tamanho do mercado e posicionamento competitivo quando disponíveis.
    
    ## Perfil do Cliente e Aplicações
    
    Detalhe com exemplos concretos:
    * Perfil típico dos usuários/clientes da empresa (indústrias, tamanho de empresa, etc.)
    * Principais casos de uso e aplicações dos produtos/serviços
    * Problemas específicos que a solução resolve para os clientes
    * Depoimentos ou casos de sucesso de clientes reais (com citações quando disponíveis)
    
    ## Mercado e Competição
    
    * Tamanho e crescimento do mercado em que a empresa atua (com dados quando disponíveis)
    * 3-5 principais concorrentes diretos no mercado
    * Diferenciais competitivos da empresa (com base no que é declarado no site)
    * Tendências de mercado relevantes para o setor
    
    ## Notícias Recentes
    
    Liste 3 NOTÍCIAS RECENTES sobre os produtos/serviços ou empresa (dos últimos 6 meses), no formato:
    1. [DATA DD/MM/AAAA] - [TÍTULO completo da notícia] - [FONTE: nome do site e URL completo]
    2. [DATA DD/MM/AAAA] - [TÍTULO completo da notícia] - [FONTE: nome do site e URL completo]
    3. [DATA DD/MM/AAAA] - [TÍTULO completo da notícia] - [FONTE: nome do site e URL completo]
    
    Citations:
    Ao final, liste todas as fontes utilizadas com URLs completas no formato:
    [1] URL completa
    [2] URL completa
    etc.`,
  
  [BRIEFING_CATEGORIES.LEADERSHIP]: (companyName: string, companyWebsite: string) => 
    `Utilize o nome da empresa ${companyName} e a URL institucional ${companyWebsite} para gerar este conteúdo.
    Visite o site institucional da empresa ${companyWebsite} e faça uma pesquisa completa sobre a empresa.
    
    ## Visão Geral da ${companyName}
    
    Comece com um resumo abrangente da empresa: o que ela faz, estágio de desenvolvimento (startup, scale-up, empresa estabelecida), 
    e posicionamento no mercado.
    
    ## Liderança e Fundadores
    
    Detalhe com informações específicas:
    * Fundadores: nomes, backgrounds profissionais, e história da fundação da empresa
    * CEO atual e equipe executiva principal: nomes e cargos exatos
    * Experiência profissional prévia dos principais líderes
    * Citações diretas dos líderes sobre a empresa, visão ou cultura (quando disponíveis)
    
    Busque informações tanto no site da empresa (seção "Equipe", "Liderança", "Sobre Nós") quanto em fontes como LinkedIn e entrevistas.
    
    ## Cultura de Liderança
    
    * Estilo de liderança evidenciado por declarações ou políticas da empresa
    * Valores que a liderança promove internamente
    * Iniciativas ou programas liderados pela equipe executiva
    * Como a liderança aborda inovação, diversidade, ou outros temas relevantes
    
    ## Notícias Recentes
    
    Liste 3 NOTÍCIAS RECENTES sobre a liderança/empresa (dos últimos 6 meses), no formato:
    1. [DATA DD/MM/AAAA] - [TÍTULO completo da notícia] - [FONTE: nome do site e URL completo]
    2. [DATA DD/MM/AAAA] - [TÍTULO completo da notícia] - [FONTE: nome do site e URL completo]
    3. [DATA DD/MM/AAAA] - [TÍTULO completo da notícia] - [FONTE: nome do site e URL completo]
    
    Citations:
    Ao final, liste todas as fontes utilizadas com URLs completas no formato:
    [1] URL completa
    [2] URL completa
    etc.`,
  
  [BRIEFING_CATEGORIES.COMPANY_HISTORY]: (companyName: string, companyWebsite: string) => 
    `Utilize o nome da empresa ${companyName} e a URL institucional ${companyWebsite} para gerar este conteúdo.
    Visite o site institucional da empresa ${companyWebsite} e faça uma pesquisa completa sobre a empresa.
    
    ## Visão Geral da ${companyName}
    
    Comece com um resumo abrangente da empresa atualmente: mercado, produtos principais, tamanho e alcance geográfico.
    
    ## História da Fundação
    
    Detalhe com precisão:
    * Ano e local exato de fundação
    * Nomes completos dos fundadores e seus backgrounds
    * Contexto de mercado no momento da fundação
    * Motivação original para a criação da empresa (com citações dos fundadores quando disponíveis)
    * Modelo de negócio inicial e como ele evoluiu
    
    ## Marcos Históricos
    
    Liste cronologicamente 5-7 eventos significativos na história da empresa:
    * Lançamentos de produtos importantes
    * Expansões geográficas
    * Rodadas de investimento significativas
    * Aquisições ou fusões
    * Pivôs estratégicos no modelo de negócio
    * Conquistas e prêmios importantes
    
    Utilize um formato claro com anos específicos para cada marco.
    
    ## Notícias Recentes
    
    Liste 3 NOTÍCIAS RECENTES sobre a empresa (dos últimos 6 meses), no formato:
    1. [DATA DD/MM/AAAA] - [TÍTULO completo da notícia] - [FONTE: nome do site e URL completo]
    2. [DATA DD/MM/AAAA] - [TÍTULO completo da notícia] - [FONTE: nome do site e URL completo]
    3. [DATA DD/MM/AAAA] - [TÍTULO completo da notícia] - [FONTE: nome do site e URL completo]
    
    Citations:
    Ao final, liste todas as fontes utilizadas com URLs completas no formato:
    [1] URL completa
    [2] URL completa
    etc.`
};
