/**
 * Configuração central de marca.
 * Todos os arquivos de marca ficam em /public/brand e podem ser substituídos
 * sem alterar a lógica do sistema (ou trocados pela tela Configurações > Identidade visual).
 */
export const BRAND = {
  appName: 'Guaporé Studio IA',
  tagline: 'Inteligência e praticidade para sua comunicação.',
  company: 'Guaporé Vidros',
  city: 'Cuiabá – MT',
  colors: {
    navy: '#072851', // amostrado do logotipo fornecido — confirmar com manual de marca
    blindexRed: '#EE2E24', // amostrado do logotipo Blindex fornecido — confirmar
    promoAccent: '#F5B417', // acento provisório para peças promocionais (não-Blindex)
  },
  assets: {
    guaporeSquare: './brand/guapore-logo-quadrado.jpg', // arquivo fornecido
    guaporeCircle: './brand/guapore-logo-circular.jpg', // arquivo fornecido
    guaporeMarkWhite: './brand/guapore-g-branco.png', // derivado do arquivo fornecido (fundo removido)
    guaporeMarkNavy: './brand/guapore-g-azul.png', // derivado do arquivo fornecido (fundo removido)
    blindexLogo: './brand/blindex-logo.png', // arquivo fornecido
  },
  /** Texto legal exibido nas peças com a marca Blindex. Não afirma relação comercial não documentada. */
  blindexLegal: 'Blindex® é marca registrada de seu respectivo titular.',
};

export type FormatId = 'square' | 'story' | 'a4';

export const FORMATS: Record<FormatId, { id: FormatId; label: string; hint: string; w: number; h: number; base: number }> = {
  square: { id: 'square', label: 'Quadrado', hint: '1080 × 1080 px · Feed', w: 1080, h: 1080, base: 10 },
  story: { id: 'story', label: 'Story', hint: '1080 × 1920 px · Status/Stories', w: 1080, h: 1920, base: 10 },
  a4: { id: 'a4', label: 'Documento A4', hint: '1240 × 1754 px · Impressão/PDF', w: 1240, h: 1754, base: 11.48 },
};
