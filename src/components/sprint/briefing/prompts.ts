
import { BRIEFING_CATEGORIES } from "./briefingConstants";

// Perplexity prompts for each category
export const perplexityPromptsByCategory = {
  [BRIEFING_CATEGORIES.CULTURE_VALUES]: (companyName: string, companyWebsite: string) => 
    `Utilize o nome da empresa ${companyName} e a URL institucional ${companyWebsite} para gerar este conteúdo.
    Visite o site institucional da empresa ${companyWebsite} e faça uma pesquisa completa sobre a empresa.
    
    Comece com um overview da empresa ${companyName}: o que ela faz, tamanho, mercado, principais produtos, e posicionamento no setor.
    Inclua dados factuais como ano de fundação, sede, número aproximado de funcionários quando disponível.
    
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
    
    Comece com um panorama abrangente dos produtos e serviços da empresa ${companyName},
    explicando o que eles oferecem, seu público-alvo, e contexto de mercado.
    
    Detalhe o perfil dos clientes e aplicações:
    - Perfil típico dos usuários/clientes da empresa
    - Principais casos de uso e aplicações dos produtos/serviços
    - Problemas específicos que a solução resolve para os clientes
    - Depoimentos ou casos de sucesso de clientes reais (se disponíveis)
    
    Apresente informações sobre o mercado e competição:
    - Tamanho e crescimento do mercado em que a empresa atua
    - Principais concorrentes diretos no mercado
    - Diferenciais competitivos da empresa
    - Tendências relevantes para o setor`,
  
  [BRIEFING_CATEGORIES.LEADERSHIP]: (companyName: string, companyWebsite: string) => 
    `Utilize o nome da empresa ${companyName} e a URL institucional ${companyWebsite} para gerar este conteúdo.
    Visite o site institucional da empresa ${companyWebsite} e faça uma pesquisa completa sobre a empresa.
    
    Comece com um resumo sobre a empresa ${companyName}: o que ela faz, estágio de desenvolvimento,
    e posicionamento no mercado.
    
    Detalhe informações sobre a liderança e fundadores:
    - Nomes dos fundadores, backgrounds profissionais e história da fundação
    - CEO atual e equipe executiva principal
    - Experiência profissional prévia dos principais líderes
    - Citações dos líderes sobre a empresa, visão ou cultura (quando disponíveis)
    
    Explique sobre a cultura de liderança:
    - Estilo de liderança evidenciado por declarações ou políticas da empresa
    - Valores que a liderança promove internamente
    - Iniciativas ou programas liderados pela equipe executiva
    - Como a liderança aborda temas como inovação e diversidade`,
  
  [BRIEFING_CATEGORIES.COMPANY_HISTORY]: (companyName: string, companyWebsite: string) => 
    `Utilize o nome da empresa ${companyName} e a URL institucional ${companyWebsite} para gerar este conteúdo.
    Visite o site institucional da empresa ${companyWebsite} e faça uma pesquisa completa sobre a empresa.
    
    Comece com um resumo atual da empresa ${companyName}: mercado, produtos principais, tamanho e alcance geográfico.
    
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
