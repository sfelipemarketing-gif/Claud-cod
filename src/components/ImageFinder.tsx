import { useRef } from 'react';
import { CheckCircle2, ImageOff, Search, Sparkles, Upload, X } from 'lucide-react';
import type { SearchOutcome } from '../lib/search';
import { useStore } from '../lib/store';
import type { LibraryItem } from '../lib/types';
import { Badge } from './ui';
import { fileToDataUrl } from '../lib/export';

export function BrandBadge({ brandId }: { brandId: string }) {
  const { brands } = useStore();
  const b = brands.find((x) => x.id === brandId);
  if (!b) return null;
  if (b.isBlindex) return <Badge tone="red">Blindex</Badge>;
  return <Badge tone={b.fictitious ? 'gray' : 'navy'}>{b.name}{b.fictitious ? ' (fictícia)' : ''}</Badge>;
}

export function ImageFinder({
  outcome, query, manualQuery, setManualQuery, selectedId, uploaded, onPick, onUpload, onClear, auto,
}: {
  outcome: SearchOutcome;
  query: string;
  manualQuery: string;
  setManualQuery: (s: string) => void;
  selectedId: string | null;
  uploaded: string | undefined;
  onPick: (item: LibraryItem) => void;
  onUpload: (dataUrl: string) => void;
  onClear: () => void;
  auto: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const { library } = useStore();
  const selected = library.find((l) => l.id === selectedId);
  const effective = manualQuery || query;

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-mute" />
        <input className="input pl-10 pr-9" value={manualQuery} onChange={(e) => setManualQuery(e.target.value)} placeholder={query ? `Buscando por: “${query}”` : 'Buscar na biblioteca (ex.: silicone marca demo a)'} />
        {manualQuery ? <button className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-ink-mute hover:text-ink" onClick={() => setManualQuery('')} aria-label="Limpar"><X className="w-4 h-4" /></button> : null}
      </div>

      {/* Status da busca */}
      {uploaded ? (
        <div className="flex items-center gap-3 rounded-xl bg-navy-50 border border-navy-100 p-3">
          <img src={uploaded} alt="" className="w-14 h-14 object-contain rounded-lg bg-white" />
          <div className="flex-1 text-sm"><b className="text-navy">Imagem enviada do dispositivo</b><div className="text-ink-mute text-xs">Usada somente neste material.</div></div>
          <button className="btn-ghost btn-sm" onClick={onClear}>Remover</button>
        </div>
      ) : outcome.status === 'empty' ? (
        <p className="text-sm text-ink-mute">Digite o nome do produto acima — a plataforma procura automaticamente uma referência na biblioteca.</p>
      ) : outcome.status === 'unique' && selected && auto ? (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2.5 text-[13px] text-emerald-800 animate-fade-up">
          <Sparkles className="w-4 h-4 shrink-0" />
          <span><b>Referência identificada automaticamente:</b> {selected.name}</span>
        </div>
      ) : outcome.status === 'multiple' ? (
        <div className="flex items-center gap-2 rounded-xl bg-navy-50 border border-navy-100 px-3 py-2.5 text-[13px] text-navy animate-fade-up">
          <Search className="w-4 h-4 shrink-0" />
          <span>Encontramos <b>{outcome.hits.length} referências</b> para “{effective}”. Selecione a correta:</span>
        </div>
      ) : outcome.status === 'none' ? (
        <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2.5 text-[13px] text-amber-900">
          <ImageOff className="w-4 h-4 shrink-0" />
          <span>Nenhuma imagem encontrada para “{effective}”. Envie uma imagem ou continue sem imagem — o layout se ajusta.</span>
        </div>
      ) : null}

      {!uploaded && outcome.hits.length ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
          {outcome.hits.slice(0, 8).map((h) => {
            const on = h.item.id === selectedId;
            return (
              <button
                key={h.item.id}
                type="button"
                onClick={() => onPick(h.item)}
                className={`group relative rounded-xl border p-1.5 text-left transition ${on ? 'border-navy ring-4 ring-navy/10 bg-navy-50' : 'border-line hover:border-navy/40 bg-white'}`}
              >
                <div className="aspect-square rounded-lg bg-surface flex items-center justify-center overflow-hidden">
                  <img src={h.item.image} alt="" className="max-w-full max-h-full object-contain p-1" loading="lazy" />
                </div>
                <div className="mt-1.5 px-0.5 text-[11.5px] font-semibold leading-tight line-clamp-2 text-ink">{h.item.name}</div>
                <div className="px-0.5 mt-1"><BrandBadge brandId={h.item.brandId} /></div>
                {on ? <CheckCircle2 className="absolute top-2 right-2 w-5 h-5 text-navy bg-white rounded-full" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn-secondary btn-sm" onClick={() => fileRef.current?.click()}><Upload className="w-4 h-4" /> Enviar imagem do dispositivo</button>
        {selectedId || uploaded ? <button type="button" className="btn-ghost btn-sm" onClick={onClear}><ImageOff className="w-4 h-4" /> Sem imagem</button> : null}
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="hidden"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (f) onUpload(await fileToDataUrl(f));
            e.target.value = '';
          }}
        />
      </div>
    </div>
  );
}
