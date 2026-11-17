import { useEffect, useMemo, useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Plus, FileUp, Pencil, Trash2, Sparkles, Upload, Loader2, CheckCircle2, Clock3, Crop, X, ImagePlus, RotateCcw, Wand2 } from 'lucide-react';
import { Badge, DemoNotice, Modal, PageHeader, useDebounced, useToast } from '../components/ui';
import { BrandBadge } from '../components/ImageFinder';
import { useStore } from '../lib/store';
import { useAuth } from '../lib/auth';
import { searchLibrary } from '../lib/search';
import { CATEGORIES } from '../data/library';
import type { LibraryItem } from '../lib/types';
import { fileToDataUrl } from '../lib/export';
import { uid } from '../lib/format';
import type { PdfPage } from '../lib/pdf';

type PdfMod = typeof import('../lib/pdf');

export default function Library() {
  const { library, brands, synonyms, removeLibraryItem, hiddenDemo, restoreDemoLibrary } = useStore();
  const { isAdmin } = useAuth();
  const [params] = useSearchParams();
  const nav = useNavigate();
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('');
  const [brand, setBrand] = useState(params.get('brand') ?? '');
  const [editing, setEditing] = useState<Partial<LibraryItem> | null>(null);
  const [detail, setDetail] = useState<LibraryItem | null>(null);
  const [pdfOpen, setPdfOpen] = useState(false);
  const q = useDebounced(query, 180);

  const outcome = useMemo(() => searchLibrary(q, library, brands, synonyms), [q, library, brands, synonyms]);
  const base = outcome.status === 'empty' ? library : outcome.hits.map((h) => h.item);
  const items = base.filter((i) => (!cat || i.category === cat) && (!brand || i.brandId === brand));
  const cats = [...new Set(library.map((l) => l.category))];

  return (
    <div>
      <PageHeader
        eyebrow="Biblioteca inteligente"
        title="Biblioteca de imagens"
        subtitle="Referências visuais, marcas e elementos gráficos utilizados na montagem das artes. Não é um cadastro de preços."
        actions={isAdmin ? (
          <>
            <button className="btn-secondary" onClick={() => setPdfOpen(true)}><FileUp className="w-4 h-4" /> Importar PDF</button>
            <button className="btn-primary" onClick={() => setEditing({})}><Plus className="w-4 h-4" /> Adicionar imagem</button>
          </>
        ) : undefined}
      />

      <div className="card p-4 sm:p-5 mb-5">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-ink-mute" />
          <input className="input h-14 pl-12 text-[16px]" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Digite um produto ou marca — ex.: “silicone marca demo a”, “box de canto”, “sacada”" />
        </div>
        <div className="mt-3 min-h-[24px] text-[13px]">
          {outcome.status === 'unique' ? (
            <span className="inline-flex items-center gap-1.5 text-emerald-700 font-medium"><Sparkles className="w-4 h-4" /> Correspondência inequívoca: <b>{outcome.hits[0].item.name}</b> — seria sugerida automaticamente no gerador.</span>
          ) : outcome.status === 'multiple' ? (
            <span className="text-navy font-medium">{outcome.hits.length} referências semelhantes — o gerador pedirá para o usuário escolher.</span>
          ) : outcome.status === 'none' ? (
            <span className="text-amber-700 font-medium">Nenhuma referência encontrada.</span>
          ) : (
            <span className="text-ink-mute">Busca por nome, marca, categoria, palavras-chave e sinônimos (ex.: “sacada” encontra guarda-corpo).</span>
          )}
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <select className="input !h-9 !w-auto text-[13px]" value={brand} onChange={(e) => setBrand(e.target.value)}>
            <option value="">Todas as marcas</option>
            {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <div className="flex gap-1.5 overflow-x-auto scrollbar-thin">
            <button onClick={() => setCat('')} className={`chip h-9 px-3.5 whitespace-nowrap ${!cat ? 'bg-navy text-white' : 'bg-surface text-ink-soft border border-line'}`}>Todas</button>
            {cats.map((c) => <button key={c} onClick={() => setCat(c === cat ? '' : c)} className={`chip h-9 px-3.5 whitespace-nowrap ${cat === c ? 'bg-navy text-white' : 'bg-surface text-ink-soft border border-line'}`}>{c}</button>)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4">
        {items.map((it) => (
          <div key={it.id} className="card overflow-hidden group">
            <button className="block w-full text-left" onClick={() => setDetail(it)}>
              <div className="aspect-square bg-surface bg-grid flex items-center justify-center p-4 relative">
                <img src={it.image} alt={it.name} className="max-w-full max-h-full object-contain group-hover:scale-[1.04] transition" loading="lazy" />
                <span className="absolute top-2 left-2">{it.source === 'demo' ? <Badge tone="amber">Ilustração demo</Badge> : it.source === 'pdf' ? <Badge tone="navy">Do PDF</Badge> : <Badge tone="green">Enviada</Badge>}</span>
              </div>
              <div className="p-3.5">
                <div className="font-semibold text-[14px] leading-snug line-clamp-2">{it.name}</div>
                <div className="flex flex-wrap items-center gap-1.5 mt-2"><BrandBadge brandId={it.brandId} /><span className="text-[11.5px] text-ink-mute">{it.category}</span></div>
                <div className="text-[11px] text-ink-mute mt-2 line-clamp-1">{it.keywords.join(' · ')}</div>
              </div>
            </button>
            {isAdmin ? (
              <div className="flex border-t border-line">
                <button className="flex-1 h-10 text-[12.5px] font-semibold text-ink-soft hover:bg-surface inline-flex items-center justify-center gap-1.5" onClick={() => setEditing(it)}><Pencil className="w-3.5 h-3.5" /> Editar</button>
                <button className="flex-1 h-10 text-[12.5px] font-semibold text-bred-700 hover:bg-bred-50 inline-flex items-center justify-center gap-1.5 border-l border-line" onClick={() => { if (confirm(`Remover “${it.name}” da biblioteca?`)) { removeLibraryItem(it.id); toast({ kind: 'info', text: 'Imagem removida da biblioteca.' }); } }}><Trash2 className="w-3.5 h-3.5" /> Remover</button>
              </div>
            ) : null}
          </div>
        ))}
      </div>
      {!items.length ? <p className="text-center text-ink-mute py-16">Nenhuma imagem para os filtros selecionados.</p> : null}
      {isAdmin && hiddenDemo.length ? <div className="text-center mt-6"><button className="btn-ghost btn-sm" onClick={restoreDemoLibrary}><RotateCcw className="w-4 h-4" /> Restaurar {hiddenDemo.length} imagem(ns) de demonstração removida(s)</button></div> : null}

      <div className="mt-10 grid md:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-2 font-display font-bold"><CheckCircle2 className="w-5 h-5 text-emerald-600" /> Funciona neste protótipo</div>
          <ul className="mt-3 text-[13.5px] text-ink-soft space-y-1.5 list-disc pl-5">
            <li>Busca local por nome, marca, categoria, palavras-chave e sinônimos</li>
            <li>Sugestão automática quando há correspondência inequívoca</li>
            <li>Envio de imagens e cadastro de palavras-chave (administrador)</li>
            <li>Importação de PDF: visualizar páginas, recortar região e extrair texto para sugerir palavras-chave</li>
          </ul>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 font-display font-bold"><Clock3 className="w-5 h-5 text-amber-600" /> Previsto para a versão definitiva</div>
          <ul className="mt-3 text-[13.5px] text-ink-soft space-y-1.5 list-disc pl-5">
            <li>Identificação de marcas e produtos por IA multimodal</li>
            <li>Extração automática das imagens embutidas nos PDFs</li>
            <li>Busca semântica e reconhecimento visual</li>
            <li>Biblioteca centralizada no servidor, com fluxo de aprovação</li>
          </ul>
        </div>
      </div>

      {editing ? <ItemForm initial={editing} onClose={() => setEditing(null)} /> : null}
      {pdfOpen ? <PdfImport onClose={() => setPdfOpen(false)} onAdd={(d) => { setPdfOpen(false); setEditing(d); }} /> : null}

      <Modal open={!!detail} onClose={() => setDetail(null)} title={detail?.name} subtitle={detail?.category} footer={<>
        <button className="btn-secondary" onClick={() => setDetail(null)}>Fechar</button>
        {detail?.brandId === 'blindex' ? <button className="btn-blindex" onClick={() => nav(`/app/blindex/criar?preset=precos&ref=${detail.id}`)}>Usar em material Blindex</button> : null}
        <button className="btn-primary" onClick={() => detail && nav(`/app/informativo?ref=${detail.id}`)}>Usar em informativo</button>
      </>}>
        {detail ? (
          <div className="space-y-4">
            <div className="aspect-[4/3] bg-surface bg-grid rounded-2xl flex items-center justify-center p-6"><img src={detail.image} alt="" className="max-w-full max-h-full object-contain" /></div>
            <div className="flex flex-wrap gap-1.5"><BrandBadge brandId={detail.brandId} />{detail.keywords.map((k) => <Badge key={k} tone="gray">{k}</Badge>)}</div>
            {detail.note ? <DemoNotice>{detail.note}</DemoNotice> : null}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

function ItemForm({ initial, onClose }: { initial: Partial<LibraryItem>; onClose: () => void }) {
  const { brands, upsertLibraryItem } = useStore();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [it, setIt] = useState<Partial<LibraryItem>>({ brandId: 'guapore', category: 'Outros', keywords: [], synonyms: [], ...initial });
  const [kw, setKw] = useState((initial.keywords ?? []).join(', '));
  const [syn, setSyn] = useState((initial.synonyms ?? []).join(', '));
  const isNew = !initial.id;

  const save = () => {
    if (!it.image) return toast({ kind: 'error', text: 'Selecione uma imagem.' });
    if (!it.name?.trim()) return toast({ kind: 'error', text: 'Informe o nome da imagem.' });
    const split = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean);
    upsertLibraryItem({
      id: it.id ?? uid('lib'), name: it.name.trim(), brandId: it.brandId ?? 'guapore', category: it.category ?? 'Outros',
      keywords: split(kw), synonyms: split(syn), image: it.image, source: it.source ?? 'upload', note: it.source === 'demo' ? it.note : undefined, createdAt: it.createdAt ?? Date.now(),
    });
    toast({ kind: 'success', text: isNew ? 'Imagem adicionada à biblioteca.' : 'Referência atualizada.' });
    onClose();
  };

  return (
    <Modal open onClose={onClose} title={isNew ? 'Adicionar imagem à biblioteca' : 'Editar referência'} subtitle="Armazenada localmente neste navegador (protótipo)." footer={<><button className="btn-secondary" onClick={onClose}>Cancelar</button><button className="btn-primary" onClick={save}>Salvar</button></>}>
      <div className="space-y-4">
        <button type="button" onClick={() => fileRef.current?.click()} className="w-full aspect-[16/9] rounded-2xl border-2 border-dashed border-line hover:border-navy/40 bg-surface flex items-center justify-center overflow-hidden">
          {it.image ? <img src={it.image} alt="" className="max-w-full max-h-full object-contain p-3" /> : <div className="text-center text-ink-mute"><ImagePlus className="w-8 h-8 mx-auto mb-2" /><div className="text-sm font-semibold">Clique para selecionar uma imagem</div><div className="text-xs">PNG, JPG, WEBP ou SVG</div></div>}
        </button>
        <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (f) { const data = await fileToDataUrl(f); setIt((p) => ({ ...p, image: data, name: p.name || f.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ') })); } }} />
        <div><label className="label">Nome</label><input className="input" value={it.name ?? ''} onChange={(e) => setIt((p) => ({ ...p, name: e.target.value }))} placeholder="Ex.: Silicone incolor 280 g" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Marca</label><select className="input" value={it.brandId} onChange={(e) => setIt((p) => ({ ...p, brandId: e.target.value }))}>{brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
          <div><label className="label">Categoria</label><select className="input" value={it.category} onChange={(e) => setIt((p) => ({ ...p, category: e.target.value }))}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></div>
        </div>
        <div><label className="label">Palavras-chave (separadas por vírgula)</label><input className="input" value={kw} onChange={(e) => setKw(e.target.value)} placeholder="silicone, vedação, incolor" /></div>
        <div><label className="label">Sinônimos (opcional)</label><input className="input" value={syn} onChange={(e) => setSyn(e.target.value)} placeholder="selante, vedante" /></div>
      </div>
    </Modal>
  );
}

function PdfImport({ onClose, onAdd }: { onClose: () => void; onAdd: (d: Partial<LibraryItem>) => void }) {
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState<null | [number, number]>(null);
  const [pages, setPages] = useState<PdfPage[]>([]);
  const [total, setTotal] = useState(0);
  const [fileName, setFileName] = useState('');
  const [sel, setSel] = useState<PdfPage | null>(null);
  const [rect, setRect] = useState({ x: 0, y: 0, w: 1, h: 1 });
  const drag = useRef<{ x: number; y: number } | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const [mod, setMod] = useState<PdfMod | null>(null);
  const kws = (t: string) => (mod ? mod.suggestKeywords(t, 8) : []);

  useEffect(() => setRect({ x: 0, y: 0, w: 1, h: 1 }), [sel]);

  const load = async (f: File) => {
    setFileName(f.name);
    setPages([]); setSel(null);
    setLoading([0, 1]);
    try {
      const m = mod ?? (await import('../lib/pdf'));
      setMod(m);
      const r = await m.readPdf(f, 12, (d, t) => setLoading([d, t]));
      setPages(r.pages); setTotal(r.total);
      setSel(r.pages[0] ?? null);
    } catch (e) {
      console.error(e);
      toast({ kind: 'error', text: 'Não foi possível ler este PDF.' });
    } finally { setLoading(null); }
  };

  const pos = (e: RPointerEvent) => {
    const b = box.current!.getBoundingClientRect();
    return { x: Math.min(1, Math.max(0, (e.clientX - b.left) / b.width)), y: Math.min(1, Math.max(0, (e.clientY - b.top) / b.height)) };
  };
  const down = (e: RPointerEvent) => { (e.target as HTMLElement).setPointerCapture(e.pointerId); const p = pos(e); drag.current = p; setRect({ x: p.x, y: p.y, w: 0, h: 0 }); };
  const move = (e: RPointerEvent) => { if (!drag.current) return; const p = pos(e); const s = drag.current; setRect({ x: Math.min(s.x, p.x), y: Math.min(s.y, p.y), w: Math.abs(p.x - s.x), h: Math.abs(p.y - s.y) }); };
  const up = () => { drag.current = null; setRect((r) => (r.w < 0.03 || r.h < 0.03 ? { x: 0, y: 0, w: 1, h: 1 } : r)); };

  const add = async () => {
    if (!sel || !mod) return;
    const image = rect.w >= 0.999 && rect.h >= 0.999 ? sel.image : await mod.cropDataUrl(sel.image, rect);
    onAdd({ image, source: 'pdf', name: `${fileName.replace(/\.pdf$/i, '')} — pág. ${sel.index}`, keywords: kws(sel.text), category: 'Outros' });
  };

  return (
    <Modal open onClose={onClose} wide title="Importar PDF de referência" subtitle="Catálogos, tabelas e materiais da marca — processados no próprio navegador.">
      <div className="space-y-4">
        <DemoNotice>
          <b>Real:</b> leitura do PDF, visualização das páginas, recorte de região e extração do texto para sugerir palavras-chave. <b>Não realizado nesta fase:</b> identificação automática por IA de marcas e produtos — o recorte e a classificação são feitos pelo administrador.
        </DemoNotice>
        {!pages.length ? (
          <button onClick={() => fileRef.current?.click()} disabled={!!loading} className="w-full rounded-2xl border-2 border-dashed border-line hover:border-navy/40 bg-surface py-14 flex flex-col items-center justify-center text-ink-mute">
            {loading ? <><Loader2 className="w-8 h-8 animate-spin text-navy" /><div className="mt-3 text-sm font-semibold text-ink">Lendo páginas… {loading[0]}/{loading[1]}</div></> : <><Upload className="w-8 h-8" /><div className="mt-3 text-sm font-semibold text-ink">Selecionar arquivo PDF</div><div className="text-xs mt-1">Até 12 páginas são processadas na demonstração</div></>}
          </button>
        ) : (
          <div className="grid md:grid-cols-[150px_1fr_240px] gap-4">
            <div className="flex md:flex-col gap-2 overflow-auto scrollbar-thin md:max-h-[520px]">
              {pages.map((p) => (
                <button key={p.index} onClick={() => setSel(p)} className={`shrink-0 w-24 md:w-full rounded-lg border p-1 ${sel?.index === p.index ? 'border-navy ring-2 ring-navy/20' : 'border-line'}`}>
                  <img src={p.image} alt="" className="w-full" /><div className="text-[11px] text-ink-mute mt-0.5">Pág. {p.index}</div>
                </button>
              ))}
            </div>
            <div>
              {sel ? (
                <div ref={box} className="relative select-none touch-none cursor-crosshair rounded-lg overflow-hidden border border-line" onPointerDown={down} onPointerMove={move} onPointerUp={up}>
                  <img src={sel.image} alt="" className="w-full pointer-events-none" draggable={false} />
                  <div className="absolute border-2 border-navy bg-navy/10 shadow-[0_0_0_9999px_rgba(3,20,43,.35)]" style={{ left: `${rect.x * 100}%`, top: `${rect.y * 100}%`, width: `${rect.w * 100}%`, height: `${rect.h * 100}%` }} />
                </div>
              ) : null}
              <p className="text-[12px] text-ink-mute mt-2 flex items-center gap-1.5"><Crop className="w-3.5 h-3.5" /> Arraste sobre a página para recortar a imagem do produto. Sem seleção, a página inteira é usada.</p>
            </div>
            <div className="space-y-3">
              <div className="text-[13px]"><b>{fileName}</b><div className="text-ink-mute">{total} página(s){total > pages.length ? ` · ${pages.length} processadas` : ''}</div></div>
              <div>
                <div className="text-[12px] font-bold uppercase tracking-wider text-ink-mute mb-1.5">Palavras-chave sugeridas do texto</div>
                <div className="flex flex-wrap gap-1">{sel && kws(sel.text).length ? kws(sel.text).map((k) => <Badge key={k} tone="gray">{k}</Badge>) : <span className="text-[12px] text-ink-mute">Sem texto extraível nesta página (ex.: PDF digitalizado).</span>}</div>
              </div>
              <div className="rounded-xl border border-line p-3 opacity-70">
                <div className="flex items-center gap-2 text-[13px] font-semibold"><Wand2 className="w-4 h-4" /> Identificar produtos com IA</div>
                <p className="text-[11.5px] text-ink-mute mt-1">Recurso reservado para a versão definitiva. Não executado nesta demonstração.</p>
                <Badge tone="amber">Em breve</Badge>
              </div>
              <button className="btn-primary w-full" onClick={add}><Plus className="w-4 h-4" /> Adicionar recorte à biblioteca</button>
              <button className="btn-ghost w-full btn-sm" onClick={() => { setPages([]); setSel(null); }}><X className="w-4 h-4" /> Outro arquivo</button>
            </div>
          </div>
        )}
        <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) load(f); e.target.value = ''; }} />
      </div>
    </Modal>
  );
}
