import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Copy, Download, Pencil, Trash2, History as HistoryIcon, LayoutTemplate, Search } from 'lucide-react';
import { Badge, DemoNotice, EmptyState, PageHeader, useToast } from '../components/ui';
import { ResultModal } from '../components/ExportPanel';
import { useStore } from '../lib/store';
import { getTemplate } from '../art/registry';
import { FORMATS } from '../config/brand';
import { formatDateTime, normalize, uid } from '../lib/format';
import type { Material, MaterialKind } from '../lib/types';

const KIND: Record<MaterialKind, { label: string; tone: 'navy' | 'red' | 'amber'; route: string }> = {
  informativo: { label: 'Informativo', tone: 'navy', route: '/app/informativo' },
  promocao: { label: 'Promoção', tone: 'amber', route: '/app/promocoes' },
  blindex: { label: 'Blindex', tone: 'red', route: '/app/blindex/criar' },
};

export default function History() {
  const { history, saveMaterial, removeMaterial } = useStore();
  const [params, setParams] = useSearchParams();
  const nav = useNavigate();
  const toast = useToast();
  const [open, setOpen] = useState<Material | null>(null);
  const [filter, setFilter] = useState<'' | MaterialKind>('');
  const [q, setQ] = useState('');

  useEffect(() => {
    const id = params.get('open');
    if (id) {
      const m = history.find((h) => h.id === id);
      if (m) setOpen(m);
      setParams({}, { replace: true });
    }
  }, [params, history, setParams]);

  const list = history.filter((h) => (!filter || h.kind === filter) && (!q || normalize(h.name).includes(normalize(q))));

  const duplicate = (m: Material) => {
    const now = Date.now();
    saveMaterial({ ...m, id: uid('mat'), name: `${m.name} (cópia)`, createdAt: now, updatedAt: now });
    toast({ kind: 'success', text: 'Material duplicado.' });
  };

  return (
    <div>
      <PageHeader eyebrow="Histórico" title="Histórico de materiais" subtitle="Últimos materiais gerados neste navegador. Edite, duplique ou baixe novamente." />
      <div className="mb-5">
        <DemoNotice>No protótipo, o histórico fica salvo <b>apenas neste navegador</b> (armazenamento local) e pode ser perdido se os dados do navegador forem apagados. Na versão definitiva, os materiais ficarão em um banco de dados corporativo.</DemoNotice>
      </div>

      {history.length ? (
        <>
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1"><Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-mute" /><input className="input pl-10" placeholder="Buscar pelo nome" value={q} onChange={(e) => setQ(e.target.value)} /></div>
            <div className="flex gap-1.5">
              {(['', 'informativo', 'promocao', 'blindex'] as const).map((k) => (
                <button key={k} onClick={() => setFilter(k)} className={`chip h-11 px-4 ${filter === k ? 'bg-navy text-white' : 'bg-white border border-line text-ink-soft'}`}>{k ? KIND[k].label : 'Todos'}</button>
              ))}
            </div>
          </div>
          <div className="card divide-y divide-line overflow-hidden">
            {list.map((m) => (
              <div key={m.id} className="flex items-center gap-4 p-3 sm:p-4 hover:bg-surface/60 transition">
                <button onClick={() => setOpen(m)} className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-surface border border-line flex items-center justify-center overflow-hidden shrink-0">
                  {m.thumb ? <img src={m.thumb} alt="" className="max-w-full max-h-full object-contain" /> : <LayoutTemplate className="w-6 h-6 text-ink-mute" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[15px] truncate">{m.name}</div>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    <Badge tone={KIND[m.kind].tone}>{KIND[m.kind].label}</Badge>
                    <span className="text-[12px] text-ink-mute">{getTemplate(m.templateId).name} · {FORMATS[m.format].label}</span>
                  </div>
                  <div className="text-[12px] text-ink-mute mt-1">{formatDateTime(m.createdAt)}{m.updatedAt !== m.createdAt ? ` · editado ${formatDateTime(m.updatedAt)}` : ''}{m.createdBy ? ` · ${m.createdBy}` : ''}</div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button className="btn-ghost btn-sm !px-2.5" title="Editar" onClick={() => nav(`${KIND[m.kind].route}?id=${m.id}`)}><Pencil className="w-4 h-4" /><span className="hidden md:inline">Editar</span></button>
                  <button className="btn-ghost btn-sm !px-2.5" title="Duplicar" onClick={() => duplicate(m)}><Copy className="w-4 h-4" /><span className="hidden md:inline">Duplicar</span></button>
                  <button className="btn-ghost btn-sm !px-2.5 text-navy" title="Baixar" onClick={() => setOpen(m)}><Download className="w-4 h-4" /><span className="hidden md:inline">Baixar</span></button>
                  <button className="btn-ghost btn-sm !px-2.5 hover:!text-bred-700 hover:!bg-bred-50" title="Excluir" onClick={() => { if (confirm('Excluir este material do histórico?')) removeMaterial(m.id); }}><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
            {!list.length ? <p className="p-8 text-center text-ink-mute text-sm">Nenhum material encontrado.</p> : null}
          </div>
        </>
      ) : (
        <EmptyState icon={<HistoryIcon className="w-6 h-6" />} title="Histórico vazio" text="Gere um informativo, promoção ou material Blindex e ele aparecerá aqui." action={<button className="btn-primary" onClick={() => nav('/app/informativo')}>Criar informativo</button>} />
      )}

      <ResultModal material={open} open={!!open} onClose={() => setOpen(null)} onEdit={open ? () => nav(`${KIND[open.kind].route}?id=${open.id}`) : undefined} />
    </div>
  );
}
