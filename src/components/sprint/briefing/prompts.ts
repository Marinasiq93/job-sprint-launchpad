
import { BRIEFING_CATEGORIES } from "./briefingConstants";

// Perplexity prompts for each category
export const perplexityPromptsByCategory = {
  [BRIEFING_CATEGORIES.CULTURE_VALUES]: (companyName: string, companyWebsite: string) => 
    `Utilize o nome da empresa ${companyName} e a URL institucional ${companyWebsite} para gerar este conteúdo.
    Visite o site institucional da empresa ${companyWebsite} e faça uma pesquisa completa sobre a empresa.
    
    Comece com um overview da empresa ${companyName}: quem ela é, quando foi fundada, e qual seu posicionamento no mercado.
    
    Em seguida, apresente os valores corporativos e cultura da empresa:
    - Liste e explique os valores e princípios da empresa
    - Detalhe como esses valores se manifestam na cultura
    - Mencione programas internos ou iniciativas que reflitam esses valores
    
    Finalize com 3 notícias recentes sobre a empresa (dos últimos 6 meses)`,
  
  [BRIEFING_CATEGORIES.MISSION_VISION]: (companyName: string, companyWebsite: string) => 
    `Utilize o nome da empresa ${companyName} e a URL institucional ${companyWebsite} para gerar este conteúdo.
    Visite o site institucional da empresa ${companyWebsite} e faça uma pesquisa completa sobre a empresa.
    
    Foque exclusivamente na missão, visão e propósito da empresa ${companyName}:
    - Apresente a missão oficial da empresa (por que ela existe)
    - Explique a visão oficial da empresa (onde deseja chegar no futuro)
    - Detalhe o propósito maior ou impacto social que a empresa busca gerar
    - Inclua citações inspiradoras dos fundadores ou liderança sobre o propósito da empresa
    
    Liste também exemplos concretos de como a empresa está trabalhando para atingir sua missão,
    como projetos específicos alinhados ao propósito declarado e iniciativas de impacto que refletem os valores.`,
  
  [BRIEFING_CATEGORIES.PRODUCT_MARKET]: (companyName: string, companyWebsite: string) => 
    `Utilize o nome da empresa ${companyName} e a URL institucional ${companyWebsite} para gerar este conteúdo.
    Visite o site institucional da empresa ${companyWebsite} e faça uma pesquisa completa sobre a empresa.
    
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
    `Utilize o nome da empresa ${companyName} e a URL institucional ${companyWebsite} para gerar este conteúdo.
    Visite o site institucional da empresa ${companyWebsite} e faça uma pesquisa completa sobre a empresa.
    
    Comece com um resumo sobre a empresa ${companyName} focando em aspectos gerais de organização e estrutura.
    
    Organize sua análise em seções bem estruturadas:
    
    ## Fundadores e Origem:
    - Nomes dos fundadores e história da fundação
    - Backgrounds profissionais dos fundadores
    - Motivação e visão inicial para a empresa
    
    ## Liderança Atual:
    - CEO atual e equipe executiva principal
    - Experiência profissional prévia dos principais líderes
    - Citações relevantes dos líderes sobre a empresa ou visão
    
    ## Cultura de Liderança:
    - Estilo de liderança evidenciado na empresa
    - Valores que a liderança promove internamente
    - Iniciativas ou programas liderados pela equipe executiva
    - Como a liderança aborda inovação, diversidade e outros temas importantes`,
  
  [BRIEFING_CATEGORIES.COMPANY_HISTORY]: (companyName: string, companyWebsite: string) => 
    `Utilize o nome da empresa ${companyName} e a URL institucional ${companyWebsite} para gerar este conteúdo.
    Visite o site institucional da empresa ${companyWebsite} e faça uma pesquisa completa sobre a empresa.
    
    Comece com um resumo atual da empresa ${companyName}: mercado e alcance geográfico.
    
    Detalhe a história da fundação de forma clara e organizada:
    - Ano e local de fundação
    - Nomes dos fundadores e seus backgrounds
    - Contexto de mercado no momento da fundação
    - Motivação original para a criação da empresa
    - Modelo de negócio inicial e como evoluiu
    
    Liste de forma organizada os eventos significativos na história da empresa:
    - Lançamentos de produtos importantes
    - Expansões geográficas
    - Rodadas de investimento significativas
    - Aquisições ou fusões
    - Pivôs estratégicos no modelo de negócio
    - Conquistas e prêmios importantes`
};
