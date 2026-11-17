/**
 * Exportação real das artes (PNG, JPG, PDF) e compartilhamento nativo.
 * A arte é composta em HTML/CSS e rasterizada no navegador — sem IA,
 * garantindo textos e valores exatamente como digitados.
 */
import { toBlob, toJpeg, toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import type { FormatId } from '../config/brand';
import { FORMATS } from '../config/brand';

type Opts = { pixelRatio?: number };

async function waitImages(node: HTMLElement) {
  const imgs = Array.from(node.querySelectorAll('img'));
  await Promise.all(imgs.map((img) => (img.complete && img.naturalWidth ? Promise.resolve() : img.decode().catch(() => undefined))));
  if ('fonts' in document) await document.fonts.ready;
}

function base(format: FormatId, o: Opts = {}) {
  const f = FORMATS[format];
  return {
    width: f.w,
    height: f.h,
    pixelRatio: o.pixelRatio ?? 1,
    cacheBust: false,
    style: { transform: 'none', margin: '0' },
    backgroundColor: '#ffffff',
    canvasWidth: f.w * (o.pixelRatio ?? 1),
    canvasHeight: f.h * (o.pixelRatio ?? 1),
    filter: (n: HTMLElement) => !(n.dataset && n.dataset.exportIgnore === 'true'),
  };
}

/** Primeira rasterização em alguns navegadores (Safari) sai sem imagens; aquecemos. */
const warmed = new WeakSet<HTMLElement>();
async function warm(node: HTMLElement, format: FormatId) {
  if (warmed.has(node)) return;
  const o = base(format, { pixelRatio: 0.1 });
  try { await toPng(node, o); } catch { /* ignore */ }
  warmed.add(node);
}

export async function renderPng(node: HTMLElement, format: FormatId, o?: Opts): Promise<string> {
  await waitImages(node);
  await warm(node, format);
  const opt = base(format, o);
  return toPng(node, opt);
}

export async function renderJpeg(node: HTMLElement, format: FormatId, o?: Opts & { quality?: number }): Promise<string> {
  await waitImages(node);
  await warm(node, format);
  const opt = base(format, o);
  return toJpeg(node, { ...opt, quality: o?.quality ?? 0.95 });
}

export async function renderBlob(node: HTMLElement, format: FormatId): Promise<Blob> {
  await waitImages(node);
  await warm(node, format);
  const opt = base(format);
  const b = await toBlob(node, opt);
  if (!b) throw new Error('Falha ao gerar imagem');
  return b;
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export async function exportPdf(node: HTMLElement, format: FormatId, filename: string) {
  const f = FORMATS[format];
  const img = await renderJpeg(node, format, { pixelRatio: format === 'a4' ? 2 : 1.5, quality: 0.92 });
  let pdf: jsPDF;
  if (format === 'a4') {
    pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    pdf.addImage(img, 'JPEG', 0, 0, 210, 297);
  } else {
    pdf = new jsPDF({ orientation: f.w > f.h ? 'landscape' : 'portrait', unit: 'px', format: [f.w, f.h], hotfixes: ['px_scaling'] });
    pdf.addImage(img, 'JPEG', 0, 0, f.w, f.h);
  }
  pdf.setProperties({ title: filename.replace(/\.pdf$/, ''), creator: 'Guaporé Studio IA (protótipo)' });
  pdf.save(filename);
}

export type ShareResult = 'shared' | 'cancelled' | 'unsupported';

/** Web Share API com arquivo (celulares: WhatsApp, e-mail etc., conforme o dispositivo). */
export async function shareImage(node: HTMLElement, format: FormatId, filename: string, text: string): Promise<ShareResult> {
  if (typeof navigator === 'undefined' || !navigator.share) return 'unsupported';
  const blob = await renderBlob(node, format);
  const file = new File([blob], filename, { type: 'image/png' });
  if (navigator.canShare && !navigator.canShare({ files: [file] })) return 'unsupported';
  try {
    await navigator.share({ files: [file], title: filename, text });
    return 'shared';
  } catch (e) {
    if ((e as DOMException)?.name === 'AbortError') return 'cancelled';
    return 'unsupported';
  }
}

export function canShareFiles(): boolean {
  try {
    if (!navigator.share || !navigator.canShare) return false;
    const f = new File([new Blob(['x'], { type: 'image/png' })], 'x.png', { type: 'image/png' });
    return navigator.canShare({ files: [f] });
  } catch {
    return false;
  }
}

/** Reduz uma imagem (arquivo enviado) para armazenar localmente sem estourar a cota. */
export function fileToDataUrl(file: File, maxSide = 1400): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const src = String(reader.result);
      if (file.type === 'image/svg+xml') return resolve(src);
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * scale);
        c.height = Math.round(img.height * scale);
        const ctx = c.getContext('2d')!;
        ctx.drawImage(img, 0, 0, c.width, c.height);
        const hasAlpha = file.type === 'image/png' || file.type === 'image/webp';
        resolve(c.toDataURL(hasAlpha ? 'image/png' : 'image/jpeg', 0.9));
      };
      img.onerror = () => reject(new Error('Imagem inválida'));
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
}
