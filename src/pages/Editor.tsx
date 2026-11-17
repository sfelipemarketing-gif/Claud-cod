import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Wand2, Sparkles, Loader2, RotateCcw, Eye, PenLine, Calculator, Lock } from 'lucide-react';
import { ArtPreview } from '../components/ArtPreview';
import { ImageFinder } from '../components/ImageFinder';
import { ResultModal, resolveImage } from '../components/ExportPanel';
import { Badge, DemoNotice, Field, PageHeader, Segmented, useDebounced, useToast } from '../components/ui';
import { ArtRenderer, buildCtx, DEFAULT_SHOW, EMPTY_FIELDS, getTemplate, TEMPLATES } from '../art/registry';
import { FORMATS, type FormatId } from '../config/brand';
import { brl, discountPct, formatPct, parseBRL, UNITS, uid } from '../lib/format';
import { searchLibrary } from '../lib/search';
import { useStore } from '../lib/store';
import { useAuth } from '../lib/auth';
import type { LibraryItem, Material, MaterialFields, MaterialKind, MaterialShow, UnitId } from '../lib/types';
import { renderJpeg } from '../lib/export';
import { BLINDEX_PRESETS, EXAMPLES } from '../data/presets';

const KIND_COPY: Record<MaterialKind, { eyebrow: string; title: string; subtitle: string; cta: string }> = {
  informativo: { eyebrow: 'Gerador de informativos', title: 'Criar informativo', subtitle: 'Preencha as informações, confirme a imagem e gere uma peça pronta para divulgar.', cta: 'Gerar informativo' },
  promocao: { eyebrow: 'Promoções internas', title: 'Criar promoção ou campanha', subtitle: 'Informe a campanha, os valores e o período. O desconto é calculado automaticamente para conferência.', cta: 'Gerar promoção' },
  blindex: { eyebrow: 'Materiais Blindex', title: 'Criar material Blindex', subtitle: 'Peças com a identidade Blindex em destaque, assinadas pela Guaporé Vidros.', cta: 'Gerar material Blindex' },
};

interface Draft {
  templateId: string;
  format: FormatId;
  fields: MaterialFields;
  show: MaterialShow;
  imageId: string | null;
  imageData?: string;
  auto: boolean;
}

const draftKey = (k: MaterialKind) => `gs:draft:${k}`;

function initialDraft(kind: MaterialKind, templateParam: string | null, presetId: string | null): Draft {
  const preset = presetId ? BLINDEX_PRESETS.find((p) => p.id === presetId) : undefined;
  const allowed = TEMPLATES.filter((t) => t.kinds.includes(kind));
  const templateId = preset?.templateId ?? (templateParam && allowed.some((t) => t.id === templateParam) ? templateParam : allowed[0].id);
  const base: Draft = {
    templateId,
    format: 'square',
    fields: { ...EMPTY_FIELDS, brandId: kind === 'blindex' ? 'blindex' : 'guapore', ...(preset?.fields ?? {}) },
    show: { ...DEFAULT_SHOW, oldPrice: kind === 'promocao', ...(preset?.show ?? {}) },
    imageId: null,
    auto: true,
  };
  if (!preset && !templateParam) {
    try {
      const saved = localStorage.getItem(draftKey(kind));
      if (saved) return { ...base, ...JSON.parse(saved) };
    } catch { /* sem rascunho */ }
  }
  return base;
}

export default function Editor({ kind: kindProp }: { kind: MaterialKind }) {
  const [params, setParams] = useSearchParams();
  const editId = params.get('id');
  const { history, library, brands, synonyms, settings, saveMaterial } = useStore();
  const { user } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const editing = editId ? history.find((h) => h.id === editId) : undefined;
  const kind = editing?.kind ?? kindProp;
  const copy = KIND_COPY[kind];

  const [d, setD] = useState<Draft>(() =>
    editing
      ? { templateId: editing.templateId, format: editing.format, fields: { ...EMPTY_FIELDS, ...editing.fields }, show: { ...DEFAULT_SHOW, ...editing.show }, imageId: editing.imageId, imageData: editing.imageData, auto: false }
      : initialDraft(kind, params.get('template'), params.get('preset')),
  );
  const [materialId, setMaterialId] = useState<string | null>(editing?.id ?? null);
  const [manualQuery, setManualQuery] = useState('');
  const [result, setResult] = useState<Material | null>(null);
  const [generating, setGenerating] = useState(false);
  const [mobileTab, setMobileTab] = useState<'form' | 'preview'>('form');
  const [brandTouched, setBrandTouched] = useState(!!editing || kind === 'blindex');
  const exportRef = useRef<HTMLDivElement>(null);

  // limpa parâmetros de preset/template após aplicar
  useEffect(() => {
    const refId = params.get('ref');
    const item = refId ? library.find((l) => l.id === refId) : undefined;
    if (item) {
      setD((p) => ({ ...p, imageId: item.id, imageData: undefined, auto: false, fields: { ...p.fields, productName: item.name, brandId: kind === 'blindex' ? 'blindex' : item.brandId } }));
      setBrandTouched(true);
    }
    if (params.get('preset') || params.get('template') || refId) {
      const p = new URLSearchParams(params);
      p.delete('preset'); p.delete('template'); p.delete('ref');
      setParams(p, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // rascunho local
  useEffect(() => {
    if (editing) return;
    try { localStorage.setItem(draftKey(kind), JSON.stringify({ ...d, imageData: undefined })); } catch { /* cota */ }
  }, [d, kind, editing]);

  const setF = <K extends keyof MaterialFields>(k: K, v: MaterialFields[K]) => setD((p) => ({ ...p, fields: { ...p.fields, [k]: v } }));
  const setS = (k: keyof MaterialShow, v: boolean) => setD((p) => ({ ...p, show: { ...p.show, [k]: v } }));
  const tpl = getTemplate(d.templateId);
  const templates = TEMPLATES.filter((t) => t.kinds.includes(kind));
  const brandName = d.fields.brandId === 'custom' ? d.fields.brandCustom : brands.find((b) => b.id === d.fields.brandId)?.name ?? '';

  // ── Busca automática de imagem ──
  const autoQuery = [d.fields.productName, d.fields.brandId !== 'guapore' ? brandName : ''].filter(Boolean).join(' ');
  const q = useDebounced(manualQuery || autoQuery, 220);
  const outcome = useMemo(() => searchLibrary(q, library, brands, synonyms), [q, library, brands, synonyms]);

  useEffect(() => {
    if (!d.auto || d.imageData) return;
    if (outcome.status === 'unique') {
      const top = outcome.hits[0].item;
      if (d.imageId !== top.id) {
        setD((p) => ({ ...p, imageId: top.id }));
        if (!brandTouched && top.brandId !== d.fields.brandId && kind !== 'blindex') setF('brandId', top.brandId);
      }
    } else if (outcome.status === 'multiple' && d.imageId && !outcome.hits.some((h) => h.item.id === d.imageId)) {
      setD((p) => ({ ...p, imageId: null }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outcome]);

  const pick = (item: LibraryItem) => {
    setD((p) => ({ ...p, imageId: item.id, imageData: undefined, auto: false }));
    if (!brandTouched && kind !== 'blindex') setF('brandId', item.brandId);
  };

  const selectedItem = library.find((l) => l.id === d.imageId);
  const isBlindexRef = d.fields.brandId === 'blindex' || selectedItem?.brandId === 'blindex';
  const suggestBlindex = isBlindexRef && !tpl.blindex && kind !== 'promocao';

  // ── Pré-visualização ──
  const image = resolveImage(d, library);
  const ctx = useMemo(() => buildCtx(d, image, brands, settings), [d, image, brands, settings]);

  // ── Desconto ──
  const pN = parseBRL(d.fields.price);
  const oN = parseBRL(d.fields.oldPrice);
  const calc = discountPct(oN, pN);

  const reset = () => {
    try { localStorage.removeItem(draftKey(kind)); } catch { /* */ }
    setD(initialDraft(kind, null, null));
    setManualQuery('');
    setMaterialId(null);
    setBrandTouched(kind === 'blindex');
    if (editId) setParams({}, { replace: true });
  };

  const fillExample = () => {
    const ex = EXAMPLES[kind][Math.floor(Math.random() * EXAMPLES[kind].length)];
    setD((p) => ({ ...p, fields: { ...EMPTY_FIELDS, brandId: p.fields.brandId, ...ex.fields }, templateId: ex.templateId ?? p.templateId, show: { ...p.show, ...(ex.show ?? {}) }, imageId: null, imageData: undefined, auto: true }));
    setBrandTouched(!!ex.fields.brandId);
    setManualQuery('');
    toast({ kind: 'info', text: 'Exemplo fictício preenchido para demonstração.' });
  };

  const generate = async () => {
    if (!d.fields.productName.trim() && !d.fields.campaignName.trim() && !d.fields.title.trim()) {
      toast({ kind: 'error', text: 'Informe ao menos o nome do produto (ou da campanha).' });
      return;
    }
    if (d.show.price && d.fields.price && pN == null) {
      toast({ kind: 'error', text: 'Preço inválido. Use o formato 1.234,56.' });
      return;
    }
    setGenerating(true);
    try {
      let thumb: string | undefined;
      if (exportRef.current) {
        try { thumb = await renderJpeg(exportRef.current, d.format, { pixelRatio: 0.28, quality: 0.78 }); } catch (e) { console.warn('miniatura', e); }
      }
      const now = Date.now();
      const id = materialId ?? uid('mat');
      const m: Material = {
        id, kind, templateId: d.templateId, format: d.format, fields: d.fields, show: d.show, imageId: d.imageId, imageData: d.imageData,
        name: d.fields.campaignName || d.fields.productName || d.fields.title || 'Material',
        thumb, createdAt: editing?.createdAt ?? now, updatedAt: now, createdBy: user?.name,
      };
      saveMaterial(m);
      setMaterialId(id);
      setResult(m);
    } finally {
      setGenerating(false);
    }
  };

  const unitSel = (
    <select className="input" value={d.fields.unit} onChange={(e) => setF('unit', e.target.value as UnitId)}>
      {UNITS.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
    </select>
  );

  const brandSelect = (
    <Field label="Marca">
      {kind === 'blindex' ? (
        <div className="input flex items-center gap-2 bg-bred-50/60 border-bred/20"><img src={settings.blindexLogo} className="w-6 h-6 rounded" alt="" /><span className="font-semibold text-bred-700">Blindex</span><Lock className="w-3.5 h-3.5 ml-auto text-bred-700/60" /></div>
      ) : (
        <>
          <select className="input" value={d.fields.brandId} onChange={(e) => { setF('brandId', e.target.value); setBrandTouched(true); }}>
            {brands.map((b) => <option key={b.id} value={b.id}>{b.name}{b.fictitious ? ' (fictícia)' : ''}</option>)}
            <option value="custom">Outra marca…</option>
          </select>
          {d.fields.brandId === 'custom' ? <input className="input mt-2" placeholder="Nome da marca" value={d.fields.brandCustom} onChange={(e) => setF('brandCustom', e.target.value)} /> : null}
        </>
      )}
    </Field>
  );

  const form = (
    <div className="space-y-5">
      {/* 1. Modelo e formato */}
      <section className="card p-5 sm:p-6">
        <StepTitle n={1} title="Modelo e formato" />
        <div className="flex gap-3 overflow-x-auto scrollbar-thin pb-2 -mx-1 px-1 snap-x">
          {templates.map((t) => (
            <TemplateThumb key={t.id} id={t.id} name={t.name} active={t.id === d.templateId} blindex={t.blindex && (t.id === 'blindex' || kind === 'blindex')} ctx={ctx} onClick={() => setD((p) => ({ ...p, templateId: t.id }))} />
          ))}
        </div>
        <p className="text-[12.5px] text-ink-mute mt-2 mb-4">{tpl.description}</p>
        <Segmented<FormatId> value={d.format} onChange={(v) => setD((p) => ({ ...p, format: v }))} options={Object.values(FORMATS).map((f) => ({ value: f.id, label: f.label, hint: f.hint.split(' · ')[0] }))} />
      </section>

      {/* 2. Informações */}
      <section className="card p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <StepTitle n={2} title="Informações" className="!mb-0" />
          <button type="button" className="btn-ghost btn-sm text-navy" onClick={fillExample}><Wand2 className="w-4 h-4" /> Exemplo</button>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {kind === 'promocao' ? (
            <Field label="Nome da campanha" className="sm:col-span-2">
              <input className="input" value={d.fields.campaignName} onChange={(e) => setF('campaignName', e.target.value)} placeholder="Ex.: Semana do Box" />
            </Field>
          ) : null}
          <Field label={kind === 'promocao' ? 'Chamada / título' : 'Título do comunicado'} className="sm:col-span-2" toggle={{ checked: d.show.title, onChange: (v) => setS('title', v) }}>
            <input className="input" value={d.fields.title} onChange={(e) => setF('title', e.target.value)} placeholder={kind === 'promocao' ? 'Ex.: Oferta especial' : 'Ex.: Novos valores · Novidade · Tabela de preços'} />
          </Field>
          <Field label={kind === 'promocao' ? 'Produto ou serviço' : 'Nome do produto'} className="sm:col-span-2">
            <input className="input text-[16px] font-semibold" value={d.fields.productName} onChange={(e) => setF('productName', e.target.value)} placeholder="Ex.: Box de banheiro frontal · Silicone incolor" autoFocus={!editing} />
          </Field>
          {brandSelect}
          <Field label="Unidade de medida">
            {unitSel}
            {d.fields.unit === 'custom' ? <input className="input mt-2" placeholder="Ex.: kit, par, rolo" value={d.fields.unitCustom} onChange={(e) => setF('unitCustom', e.target.value)} /> : null}
          </Field>

          {kind === 'promocao' || tpl.uses.oldPrice ? (
            <Field label="Preço anterior (R$)" toggle={{ checked: d.show.oldPrice, onChange: (v) => setS('oldPrice', v) }}>
              <MoneyInput value={d.fields.oldPrice} onChange={(v) => setF('oldPrice', v)} placeholder="Opcional" />
            </Field>
          ) : null}
          <Field label={kind === 'promocao' ? 'Preço promocional (R$)' : 'Preço (R$)'} toggle={{ checked: d.show.price, onChange: (v) => setS('price', v) }} className={kind === 'promocao' || tpl.uses.oldPrice ? '' : 'sm:col-span-2'}>
            <MoneyInput value={d.fields.price} onChange={(v) => setF('price', v)} placeholder="Informe o valor" />
          </Field>

          {kind === 'promocao' || tpl.uses.oldPrice ? (
            <div className="sm:col-span-2">
              {d.show.oldPrice && calc != null && pN != null && oN != null ? (
                <div className="flex items-start gap-2.5 rounded-xl bg-emerald-50 border border-emerald-200 px-3.5 py-2.5 text-[13px] text-emerald-900">
                  <Calculator className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>Desconto calculado: <b>{formatPct(calc)}</b> (de {brl(oN)} para {brl(pN)} · economia de {brl(oN - pN)}). <b>Confira antes de publicar.</b></span>
                </div>
              ) : d.show.oldPrice && oN != null && pN != null && pN >= oN ? (
                <div className="rounded-xl bg-amber-50 border border-amber-200 px-3.5 py-2.5 text-[13px] text-amber-900">O preço promocional não é menor que o anterior — nenhum desconto será exibido.</div>
              ) : (
                <Field label="Percentual de desconto (opcional)" hint="Use quando não houver preço anterior. Se informar os dois preços, o percentual é calculado automaticamente.">
                  <div className="relative"><input className="input pr-9" inputMode="decimal" value={d.fields.discountPct} onChange={(e) => setF('discountPct', e.target.value.replace(/[^\d,.]/g, ''))} placeholder="Ex.: 10" /><span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-mute font-semibold">%</span></div>
                </Field>
              )}
            </div>
          ) : null}

          <Field label="Descrição" className="sm:col-span-2" toggle={{ checked: d.show.description, onChange: (v) => setS('description', v) }}>
            <textarea className="input" rows={3} value={d.fields.description} onChange={(e) => setF('description', e.target.value)} placeholder="Breve descrição do produto ou do comunicado" />
          </Field>
          {tpl.uses.highlights ? (
            <Field label="Destaques (um por linha)" className="sm:col-span-2" toggle={{ checked: d.show.highlights, onChange: (v) => setS('highlights', v) }} hint="Até 6 itens. Ex.: Vidro temperado 8 mm · Instalação inclusa">
              <textarea className="input" rows={3} value={d.fields.highlights} onChange={(e) => setF('highlights', e.target.value)} placeholder={'Vidro temperado 8 mm\nFerragens inclusas'} />
            </Field>
          ) : null}
          <Field label="Observações adicionais" className="sm:col-span-2" toggle={{ checked: d.show.notes, onChange: (v) => setS('notes', v) }}>
            <input className="input" value={d.fields.notes} onChange={(e) => setF('notes', e.target.value)} placeholder="Ex.: Valores sujeitos a alteração sem aviso prévio." />
          </Field>
          {tpl.uses.validity ? (
            <Field label="Validade" className="sm:col-span-2" toggle={{ checked: d.show.validity, onChange: (v) => setS('validity', v) }} hint="Quando aplicável. Deixe em branco se não houver prazo.">
              <div className="grid grid-cols-2 gap-2">
                <input type="date" className="input" value={d.fields.validFrom} onChange={(e) => setF('validFrom', e.target.value)} aria-label="Início" />
                <input type="date" className="input" value={d.fields.validTo} onChange={(e) => setF('validTo', e.target.value)} aria-label="Fim" />
              </div>
            </Field>
          ) : null}
        </div>
      </section>

      {/* 3. Imagem */}
      <section className="card p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <StepTitle n={3} title="Imagem do produto" className="!mb-0" />
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-[12.5px] text-ink-soft cursor-pointer"><input type="checkbox" className="accent-[rgb(var(--navy))]" checked={d.show.brandLogo} onChange={(e) => setS('brandLogo', e.target.checked)} /> Logotipo da marca</label>
          </div>
        </div>
        <ImageFinder
          outcome={outcome}
          query={autoQuery}
          manualQuery={manualQuery}
          setManualQuery={setManualQuery}
          selectedId={d.imageId}
          uploaded={d.imageData}
          auto={d.auto}
          onPick={pick}
          onUpload={(data) => setD((p) => ({ ...p, imageData: data, imageId: null, auto: false }))}
          onClear={() => setD((p) => ({ ...p, imageId: null, imageData: undefined, auto: false }))}
        />
      </section>
    </div>
  );

  const preview = (
    <div className="space-y-4">
      {suggestBlindex ? (
        <div className="rounded-2xl border border-bred/25 bg-gradient-to-br from-bred-50 to-white p-4 flex items-start gap-3 animate-fade-up">
          <img src={settings.blindexLogo} alt="" className="w-10 h-10 rounded-md shadow" />
          <div className="flex-1 min-w-0">
            <div className="text-[13.5px] font-bold text-ink">Referência Blindex identificada</div>
            <p className="text-[12.5px] text-ink-soft mt-0.5">Para produtos Blindex, recomendamos o modelo <b>Destaque Blindex</b>, que valoriza a marca.</p>
            <div className="flex flex-wrap gap-2 mt-2.5">
              <button className="btn-blindex btn-sm" onClick={() => setD((p) => ({ ...p, templateId: 'blindex' }))}><Sparkles className="w-4 h-4" /> Aplicar Destaque Blindex</button>
              <button className="btn-ghost btn-sm" onClick={() => nav('/app/blindex')}>Ver todos os modelos Blindex</button>
            </div>
          </div>
        </div>
      ) : null}
      <div className="card p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-[13px] font-semibold text-ink-soft"><Eye className="w-4 h-4" /> Pré-visualização ao vivo</div>
          <Badge tone="gray">{FORMATS[d.format].hint.split(' · ')[0]}</Badge>
        </div>
        <div className="rounded-xl bg-surface bg-grid p-3 sm:p-5">
          <ArtPreview ctx={ctx} templateId={d.templateId} format={d.format} maxHeight={d.format === 'square' ? 560 : 620} />
        </div>
        <button onClick={generate} disabled={generating} className={`${kind === 'blindex' || d.templateId === 'blindex' ? 'btn-blindex' : 'btn-primary'} w-full h-14 mt-4 text-[15px] tracking-wide uppercase`}>
          {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />} {copy.cta}
        </button>
        <p className="text-[11.5px] text-ink-mute text-center mt-2.5">Textos e valores exatamente como digitados — composição programática, sem IA generativa.</p>
      </div>
    </div>
  );

  return (
    <div>
      <PageHeader
        eyebrow={copy.eyebrow}
        title={editing ? `Editando: ${editing.name}` : copy.title}
        subtitle={copy.subtitle}
        actions={<button className="btn-secondary btn-sm" onClick={reset}><RotateCcw className="w-4 h-4" /> Limpar</button>}
      />
      {kind === 'blindex' ? (
        <div className="mb-5"><DemoNotice tone="navy">Os logotipos utilizados são os arquivos fornecidos. Imagens de produtos da biblioteca são <b>ilustrações provisórias</b> — substitua por fotos oficiais/autorizadas Blindex em Biblioteca de imagens.</DemoNotice></div>
      ) : null}

      {/* abas no celular */}
      <div className="lg:hidden sticky top-14 z-20 -mx-4 px-4 py-2 bg-surface/95 backdrop-blur mb-4">
        <Segmented value={mobileTab} onChange={setMobileTab} options={[{ value: 'form', label: <span className="inline-flex items-center gap-1.5"><PenLine className="w-4 h-4" />Editar</span> }, { value: 'preview', label: <span className="inline-flex items-center gap-1.5"><Eye className="w-4 h-4" />Visualizar</span> }]} />
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,560px)_minmax(0,1fr)] gap-6 items-start">
        <div className={mobileTab === 'form' ? '' : 'hidden lg:block'}>{form}</div>
        <div className={`lg:sticky lg:top-6 ${mobileTab === 'preview' ? '' : 'hidden lg:block'}`}>{preview}</div>
      </div>

      {/* botão fixo no celular */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-20 p-3 bg-white/95 backdrop-blur border-t border-line flex gap-2">
        {mobileTab === 'form' ? <button className="btn-secondary flex-1" onClick={() => setMobileTab('preview')}><Eye className="w-4 h-4" /> Visualizar</button> : null}
        <button onClick={generate} disabled={generating} className={`${kind === 'blindex' ? 'btn-blindex' : 'btn-primary'} flex-[2]`}>
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} {copy.cta}
        </button>
      </div>
      <div className="lg:hidden h-20" />

      {/* nó oculto em tamanho real para miniaturas */}
      <div aria-hidden style={{ position: 'fixed', left: -10000, top: 0, pointerEvents: 'none', opacity: 0 }}>
        <ArtRenderer ref={exportRef} ctx={ctx} templateId={d.templateId} format={d.format} />
      </div>

      <ResultModal
        material={result}
        open={!!result}
        onClose={() => setResult(null)}
        onEdit={() => setResult(null)}
        onNew={() => { setResult(null); reset(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
      />
    </div>
  );
}

function StepTitle({ n, title, className = '' }: { n: number; title: string; className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 mb-4 ${className}`}>
      <span className="w-6 h-6 rounded-full bg-navy text-white text-[12px] font-bold flex items-center justify-center">{n}</span>
      <h2 className="font-display font-bold text-[16px] text-ink">{title}</h2>
    </div>
  );
}

function MoneyInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const n = parseBRL(value);
  return (
    <div className="relative">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-mute font-semibold text-sm">R$</span>
      <input className="input pl-10 font-semibold tabular-nums" inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value.replace(/[^\d,.]/g, ''))} onBlur={() => n != null && onChange(n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }))} placeholder={placeholder} />
    </div>
  );
}

function TemplateThumb({ id, name, active, blindex, ctx, onClick }: { id: string; name: string; active: boolean; blindex: boolean; ctx: ReturnType<typeof buildCtx>; onClick: () => void }) {
  const dctx = useDebounced(ctx, 450);
  const thumbCtx = useMemo(() => ({ ...dctx, format: 'square' as const, isSquare: true, isStory: false, isA4: false, settings: { ...dctx.settings, demoWatermark: false } }), [dctx]);
  return (
    <button type="button" onClick={onClick} className={`snap-start shrink-0 w-[132px] text-left rounded-xl p-1.5 border transition ${active ? 'border-navy ring-4 ring-navy/10 bg-navy-50' : 'border-line hover:border-navy/40 bg-white'}`}>
      <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-surface pointer-events-none">
        <div style={{ transform: `scale(${118 / 1080})`, transformOrigin: 'top left', width: 1080, height: 1080 }}>
          <ArtRenderer ctx={thumbCtx} templateId={id} format="square" />
        </div>
      </div>
      <div className="flex items-center gap-1 mt-1.5 px-0.5">
        <span className="text-[12px] font-semibold leading-tight text-ink flex-1">{name}</span>
        {blindex ? <span className="w-2 h-2 rounded-full bg-bred shrink-0" title="Blindex" /> : null}
      </div>
    </button>
  );
}
