import type { MaterialFields, MaterialKind, MaterialShow } from '../lib/types';

const iso = (offsetDays: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
};

export interface Preset {
  id: string;
  name: string;
  description: string;
  templateId: string;
  fields?: Partial<MaterialFields>;
  show?: Partial<MaterialShow>;
}

/** Atalhos da área "Materiais Blindex". */
export const BLINDEX_PRESETS: Preset[] = [
  { id: 'precos', name: 'Informativo de preços', description: 'Valor do produto com o logotipo Blindex em evidência.', templateId: 'blindex', fields: { title: 'Produto Blindex®' } },
  { id: 'divulgacao', name: 'Divulgação de produto', description: 'Imagem como protagonista, sem preço, para redes sociais.', templateId: 'vitrine', fields: { title: 'Conheça' }, show: { price: false } },
  { id: 'comunicado', name: 'Comunicado comercial', description: 'Avisos de reajuste, prazos e novidades da linha.', templateId: 'comunicado', fields: { title: 'Atualização da linha Blindex' } },
  { id: 'promocao', name: 'Promoção Blindex', description: 'Oferta com preço em destaque e desconto calculado.', templateId: 'promocao', fields: { title: 'Oferta Blindex' } },
  { id: 'vendedores', name: 'Material para vendedores', description: 'Ficha com argumentos de venda e destaques técnicos.', templateId: 'vendedor', fields: { title: 'Ficha do produto' } },
];

type Example = { templateId?: string; fields: Partial<MaterialFields>; show?: Partial<MaterialShow> };

/** Dados FICTÍCIOS usados pelo botão "Exemplo" (somente demonstração). */
export const EXAMPLES: Record<MaterialKind, Example[]> = {
  informativo: [
    { fields: { title: 'Novo valor', productName: 'Silicone incolor 280 g', brandId: 'demo-a', price: '29,90', unit: 'un', description: 'Selante de silicone para vedação de box, janelas e esquadrias.', notes: 'Valor demonstrativo. Sujeito a alteração sem aviso prévio.' } },
    { fields: { title: 'Informativo de preços', productName: 'Espelho lapidado', brandId: 'guapore', price: '389,00', unit: 'm2', description: 'Espelho com acabamento lapidado, sob medida para seu ambiente.', notes: 'Valor demonstrativo por m². Medidas sob consulta.' } },
    { fields: { title: 'Tabela atualizada', productName: 'Vidro temperado incolor 8 mm', brandId: 'guapore', price: '265,00', unit: 'm2', description: 'Chapa temperada incolor de 8 mm para box, portas e divisórias.', notes: 'Valor demonstrativo.' } },
  ],
  promocao: [
    { templateId: 'promocao', fields: { campaignName: 'Semana do Box', title: 'Oferta especial', productName: 'Box de banheiro frontal', brandId: 'blindex', oldPrice: '1.490,00', price: '1.290,00', unit: 'un', description: 'Box frontal de correr em vidro temperado incolor, com ferragens.', validFrom: iso(0), validTo: iso(14), notes: 'Valores fictícios para demonstração. Medida padrão.' }, show: { oldPrice: true } },
    { templateId: 'campanha', fields: { campaignName: 'Mês do Espelho', productName: 'Espelho lapidado', brandId: 'guapore', discountPct: '15', description: 'Condição especial em espelhos lapidados sob medida durante a campanha.', validFrom: iso(0), validTo: iso(30), notes: 'Percentual fictício para demonstração.' }, show: { oldPrice: false, price: false } },
  ],
  blindex: [
    { fields: { title: 'Produto Blindex®', productName: 'Box de banheiro de canto', price: '1.690,00', unit: 'un', description: 'Box de canto em vidro temperado Blindex, com ferragens e instalação.', highlights: 'Vidro temperado de segurança\nFerragens em alumínio\nInstalação por equipe especializada', notes: 'Valor fictício para demonstração.' } },
    { fields: { title: 'Produto Blindex®', productName: 'Guarda-corpo de vidro', price: '890,00', unit: 'ml', description: 'Proteção com transparência e elegância para sacadas e escadas.', highlights: 'Vidro laminado/temperado\nAcabamento sem colunas aparentes\nProjeto sob medida', notes: 'Valor fictício por metro linear.' } },
    { fields: { title: 'Produto Blindex®', productName: 'Porta de vidro temperado pivotante', price: '2.350,00', unit: 'un', description: 'Porta pivotante em vidro temperado, ideal para entradas residenciais e comerciais.', highlights: 'Puxador em aço inox\nVidro temperado incolor\nSob medida', notes: 'Valor fictício para demonstração.' } },
  ],
};
