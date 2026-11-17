import { useMemo, useRef, useState } from 'react';
import { Download, FileImage, FileText, Share2, Plus, Loader2, Mail, MessageCircle, Pencil, Smartphone } from 'lucide-react';
import { ArtPreview } from './ArtPreview';
import { Modal, useToast } from './ui';
import { buildCtx, getTemplate } from '../art/registry';
import { useStore } from '../lib/store';
import type { Material } from '../lib/types';
import { canShareFiles, downloadDataUrl, exportPdf, renderJpeg, renderPng, shareImage } from '../lib/export';
import { FORMATS } from '../config/brand';
import { slugify } from '../lib/format';

export function resolveImage(m: Pick<Material, 'imageId' | 'imageData'>, library: { id: string; image: string }[]): string | null {
  if (m.imageData) return m.imageData;
  if (m.imageId) return library.find((l) => l.id === m.imageId)?.image ?? null;
  return null;
}

type Busy = null | 'png' | 'jpg' | 'pdf' | 'share';

export function ResultModal({ material, open, onClose, onNew, onEdit }: { material: Material | null; open: boolean; onClose: () => void; onNew?: () => void; onEdit?: () => void }) {
  const { brands, settings, library } = useStore();
  const ref = useRef<HTMLDivElement>(null);
  const toast = useToast();
  const [busy, setBusy] = useState<Busy>(null);
  const [fallback, setFallback] = useState(false);
  const ctx = useMemo(() => (material ? buildCtx(material, resolveImage(material, library), brands, settings) : null), [material, library, brands, settings]);
  if (!material || !ctx) return null;
  const file = `${slugify(material.name)}-${material.format}`;
  const shareText = `${material.name} — ${settings.companyName}`;

  const run = async (kind: Exclude<Busy, null>) => {
    if (!ref.current) return;
    setBusy(kind);
    try {
      if (kind === 'png') downloadDataUrl(await renderPng(ref.current, material.format), `${file}.png`);
      if (kind === 'jpg') downloadDataUrl(await renderJpeg(ref.current, material.format), `${file}.jpg`);
      if (kind === 'pdf') await exportPdf(ref.current, material.format, `${file}.pdf`);
      if (kind === 'share') {
        const r = await shareImage(ref.current, material.format, `${file}.png`, shareText);
        if (r === 'unsupported') setFallback(true);
        if (r === 'shared') toast({ kind: 'success', text: 'Material compartilhado.' });
      } else {
        toast({ kind: 'success', text: `Arquivo ${kind.toUpperCase()} gerado e baixado.` });
      }
    } catch (e) {
      console.error(e);
      toast({ kind: 'error', text: 'Não foi possível gerar o arquivo neste navegador. Tente novamente.' });
    } finally {
      setBusy(null);
    }
  };

  const Btn = ({ k, icon: Icon, label, primary }: { k: Exclude<Busy, null>; icon: typeof Download; label: string; primary?: boolean }) => (
    <button onClick={() => run(k)} disabled={!!busy} className={primary ? 'btn-primary w-full' : 'btn-secondary w-full'}>
      {busy === k ? <Loader2 className="w-4 h-4 animate-spin" /> : <Icon className="w-4 h-4" />} {label}
    </button>
  );

  return (
    <Modal open={open} onClose={() => { setFallback(false); onClose(); }} wide title="Material pronto" subtitle={`${getTemplate(material.templateId).name} · ${FORMATS[material.format].label} (${FORMATS[material.format].hint.split(' · ')[0]})`}>
      <div className="grid md:grid-cols-[1fr_300px] gap-6 items-start">
        <div className="bg-surface rounded-2xl p-4 sm:p-6 bg-grid">
          <ArtPreview ref={ref} ctx={ctx} templateId={material.templateId} format={material.format} maxHeight={Math.min(620, typeof window !== 'undefined' ? window.innerHeight * 0.58 : 600)} />
        </div>
        <div className="space-y-2.5">
          <div className="text-[12px] font-bold tracking-[.12em] uppercase text-ink-mute mb-1">Baixar</div>
          <Btn k="png" icon={FileImage} label="Baixar PNG" primary />
          <div className="grid grid-cols-2 gap-2.5">
            <Btn k="jpg" icon={Download} label="JPG" />
            <Btn k="pdf" icon={FileText} label="PDF" />
          </div>
          <div className="text-[12px] font-bold tracking-[.12em] uppercase text-ink-mute pt-3 mb-1">Enviar</div>
          <button onClick={() => run('share')} disabled={!!busy} className="btn-blindex w-full !bg-[#0f8a5f] hover:!bg-[#0b744f] !shadow-none">
            {busy === 'share' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />} Compartilhar
          </button>
          <p className="text-[11.5px] text-ink-mute leading-snug flex gap-1.5">
            <Smartphone className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            {canShareFiles() ? 'Abre o compartilhamento do dispositivo (WhatsApp, e-mail e outros apps compatíveis).' : 'Neste navegador o envio direto de arquivos pode não estar disponível; mostraremos alternativas.'}
          </p>
          {fallback ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-[12.5px] text-amber-900 space-y-2 animate-fade-up">
              <p><b>Compartilhamento de arquivo indisponível neste navegador.</b> Baixe a imagem e anexe no aplicativo desejado:</p>
              <div className="grid grid-cols-1 gap-1.5">
                <button className="btn-secondary btn-sm" onClick={() => run('png')}><FileImage className="w-4 h-4" /> 1. Baixar PNG</button>
                <a className="btn-secondary btn-sm" href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noreferrer"><MessageCircle className="w-4 h-4" /> 2. Abrir WhatsApp</a>
                <a className="btn-secondary btn-sm" href={`mailto:?subject=${encodeURIComponent(material.name)}&body=${encodeURIComponent(shareText + '\n\n(anexe o arquivo baixado)')}`}><Mail className="w-4 h-4" /> Enviar por e-mail</a>
              </div>
            </div>
          ) : null}
          <div className="pt-3 grid grid-cols-1 gap-2">
            {onEdit ? <button className="btn-ghost w-full" onClick={onEdit}><Pencil className="w-4 h-4" /> Continuar editando</button> : null}
            {onNew ? <button className="btn-ghost w-full" onClick={onNew}><Plus className="w-4 h-4" /> Criar outro informativo</button> : null}
          </div>
          <p className="text-[11px] text-ink-mute pt-2">Salvo no histórico deste navegador.</p>
        </div>
      </div>
    </Modal>
  );
}
