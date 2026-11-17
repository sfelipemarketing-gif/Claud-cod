import { forwardRef, type ComponentType } from 'react';
import { FORMATS, type FormatId } from '../config/brand';
import { discountPct, parseBRL, unitSuffix, validityText } from '../lib/format';
import type { Settings } from '../lib/store';
import type { Brand, Material, MaterialFields, MaterialKind, MaterialShow } from '../lib/types';
import { Campanha, Comunicado, DestaqueBlindex, Informativo, Promocao, Vendedor, Vitrine } from './templates';
import type { ArtCtx } from './types';

export interface TemplateDef {
  id: string;
  name: string;
  description: string;
  kinds: MaterialKind[];
  blindex: boolean; // modelo dedicado/compatível com Blindex
  component: ComponentType<{ c: ArtCtx }>;
  /** Campos relevantes para o formulário */
  uses: Partial<Record<keyof MaterialShow | 'campaign', boolean>>;
}

export const TEMPLATES: TemplateDef[] = [
  { id: 'informativo', name: 'Informativo comercial', description: 'Visual clean em azul e branco para comunicar preços.', kinds: ['informativo'], blindex: false, component: Informativo, uses: { title: true, price: true, description: true, highlights: true, notes: true, validity: true, image: true, brandLogo: true } },
  { id: 'blindex', name: 'Destaque Blindex', description: 'Azul, vermelho e branco com o logotipo Blindex em evidência.', kinds: ['informativo', 'blindex'], blindex: true, component: DestaqueBlindex, uses: { title: true, price: true, description: true, highlights: true, notes: true, validity: true, image: true } },
  { id: 'promocao', name: 'Promoção', description: 'Oferta e preço em destaque, com cálculo de desconto.', kinds: ['informativo', 'promocao', 'blindex'], blindex: true, component: Promocao, uses: { title: true, price: true, oldPrice: true, description: true, notes: true, validity: true, image: true, brandLogo: true } },
  { id: 'campanha', name: 'Campanha interna', description: 'Nome da campanha, período e percentual em evidência.', kinds: ['promocao'], blindex: true, component: Campanha, uses: { campaign: true, price: true, oldPrice: true, description: true, notes: true, validity: true, image: true, brandLogo: true } },
  { id: 'vitrine', name: 'Vitrine de produto', description: 'Divulgação com a imagem do produto como protagonista.', kinds: ['informativo', 'blindex'], blindex: true, component: Vitrine, uses: { title: true, price: true, description: true, notes: true, image: true, brandLogo: true } },
  { id: 'comunicado', name: 'Comunicado comercial', description: 'Texto institucional para avisos, reajustes e novidades.', kinds: ['informativo', 'blindex'], blindex: true, component: Comunicado, uses: { title: true, price: true, description: true, highlights: true, notes: true, validity: true, image: true, brandLogo: true } },
  { id: 'vendedor', name: 'Material para vendedores', description: 'Ficha com argumentos de venda e destaques técnicos.', kinds: ['informativo', 'blindex'], blindex: true, component: Vendedor, uses: { title: true, price: true, description: true, highlights: true, notes: true, validity: true, image: true, brandLogo: true } },
];

export const getTemplate = (id: string) => TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];

export const EMPTY_FIELDS: MaterialFields = {
  title: '', productName: '', brandId: 'guapore', brandCustom: '', price: '', oldPrice: '', discountPct: '',
  unit: 'un', unitCustom: '', description: '', highlights: '', notes: '', validFrom: '', validTo: '', campaignName: '',
};

export const DEFAULT_SHOW: MaterialShow = {
  title: true, price: true, oldPrice: true, description: true, highlights: true, notes: true, validity: true, image: true, brandLogo: true,
};

export function buildCtx(m: Pick<Material, 'format' | 'fields' | 'show' | 'imageId' | 'imageData'>, image: string | null, brands: Brand[], settings: Settings): ArtCtx {
  const f = m.fields;
  const brand = brands.find((b) => b.id === f.brandId);
  const brandName = f.brandId === 'custom' ? f.brandCustom : brand?.name ?? '';
  const price = parseBRL(f.price);
  const oldPrice = parseBRL(f.oldPrice);
  const computed = discountPct(oldPrice, price);
  const typed = f.discountPct ? Number(f.discountPct.replace(',', '.')) : null;
  const pct = m.show.oldPrice && computed != null ? computed : typed != null && Number.isFinite(typed) && typed > 0 && typed < 100 ? typed : null;
  const fmt = FORMATS[m.format];
  return {
    format: m.format,
    isSquare: m.format === 'square',
    isStory: m.format === 'story',
    isA4: m.format === 'a4',
    H: fmt.h / fmt.base,
    f,
    show: m.show,
    image,
    brand,
    brandName,
    isBlindex: !!brand?.isBlindex,
    settings,
    navy: settings.navy,
    red: settings.blindexRed,
    accent: settings.promoAccent,
    price,
    oldPrice: m.show.oldPrice ? oldPrice : null,
    pct,
    unit: unitSuffix(f.unit, f.unitCustom),
    validity: validityText(f.validFrom, f.validTo),
    highlights: f.highlights.split('\n').map((s) => s.trim()).filter(Boolean).slice(0, 6),
  };
}

/** Renderiza a arte em tamanho real (1080/1240 px). A pré-visualização aplica escala por fora. */
export const ArtRenderer = forwardRef<HTMLDivElement, { ctx: ArtCtx; templateId: string; format: FormatId }>(function ArtRenderer({ ctx, templateId, format }, ref) {
  const fmt = FORMATS[format];
  const T = getTemplate(templateId).component;
  return (
    <div
      ref={ref}
      className="art-root"
      style={{ width: fmt.w, height: fmt.h, fontSize: fmt.base, position: 'relative', overflow: 'hidden', background: '#fff', display: 'flex', flexDirection: 'column' }}
    >
      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        <T c={ctx} />
      </div>
      {ctx.settings.demoWatermark ? (
        <div style={{ height: '2.6em', flex: 'none', background: '#FFF4D6', color: '#7a5a00', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8em', fontSize: '1.15em', fontWeight: 700, letterSpacing: '0.14em' }}>
          MATERIAL DEMONSTRATIVO · PREÇOS E PRODUTOS FICTÍCIOS · GUAPORÉ STUDIO IA
        </div>
      ) : null}
    </div>
  );
});
