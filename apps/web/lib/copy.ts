export const copy = {
  signup: {
    subtitle: "Você está a 2 minutos de fazer parte da história.",
  },
  plans: {
    subtitle: "Cada plano é um tijolo na reconstrução. Escolha o seu.",
  },
  dashboard: {
    welcome: (name: string, amount: string | number, total: string | number) => `Olá, ${name}. Sua contribuição este mês: R$${amount}. Juntos já contribuímos R$${total}.`,
    delinquencyBanner: "O Tubarão sente sua falta. Volte para a reconstrução.",
  },
  transparency: {
    heroSubheading: "Sem segredos. Sem desculpas. Os números estão aqui.",
  },
  welcome: {
    title: (name: string, memberNumber: string | number) => `Bem-vindo à família, ${name}! Você é o sócio nº ${memberNumber}.`,
    referralCta: (points: number) => `Indique um amigo e ganhe ${points} Escudos`,
    shareMessage: (url: string, code: string) => `Acabei de me tornar sócio do Tubarão! Entra comigo: ${url}?ref=${code}`,
  },
};
