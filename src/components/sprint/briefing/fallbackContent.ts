
import { BriefingContent } from "./types";

export const createRichCompanyBriefing = (companyName: string): BriefingContent => {
  // Create a rich default content with company name
  return {
    overview: `Estamos analisando informações sobre ${companyName}. No momento, estamos enfrentando dificuldades técnicas para conectar com nossa API de análise.`,
    highlights: [
      `Recomendamos visitar o site oficial de ${companyName} para obter informações atualizadas`,
      "Consulte o LinkedIn da empresa para entender sua cultura e valores",
      "Verifique reviews no Glassdoor para perspectivas de funcionários",
      "Busque notícias recentes para compreender o contexto atual da empresa",
      "Analise perfis de líderes da empresa nas redes sociais"
    ],
    summary: `Para uma análise mais completa sobre ${companyName}, tente novamente mais tarde quando nosso serviço de análise estiver disponível. Você também pode pesquisar manualmente no Google, LinkedIn, e outras fontes.`,
    sources: [
      {
        title: `Site oficial de ${companyName}`,
        url: `https://www.google.com/search?q=${encodeURIComponent(companyName)}+site+oficial`
      },
      {
        title: `${companyName} no LinkedIn`,
        url: `https://www.linkedin.com/company/${encodeURIComponent(companyName.toLowerCase().replace(/\s+/g, '-'))}`
      },
      {
        title: `${companyName} no Glassdoor`,
        url: `https://www.glassdoor.com.br/Avalia%C3%A7%C3%B5es/${encodeURIComponent(companyName)}-Avalia%C3%A7%C3%B5es`
      }
    ],
    recentNews: [
      {
        title: `Veja notícias recentes sobre ${companyName}`,
        url: `https://www.google.com/search?q=${encodeURIComponent(companyName)}+notícias&tbm=nws`
      }
    ]
  };
};
