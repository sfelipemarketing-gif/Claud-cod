/**
 * Importação REAL de PDF (no navegador, via pdf.js):
 *  - renderiza as páginas como imagens;
 *  - extrai o texto e sugere palavras-chave por frequência (sem IA).
 * Recortar uma região da página também é real (feito na tela de importação).
 *
 * NÃO implementado nesta fase (reservado para a versão definitiva):
 *  - identificação automática de marcas/produtos por IA multimodal;
 *  - extração das imagens embutidas como objetos separados;
 *  - busca semântica sobre o conteúdo.
 */
import * as pdfjs from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { normalize } from './format';

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

export interface PdfPage {
  index: number;
  image: string; // dataURL
  width: number;
  height: number;
  text: string;
}

const STOP = new Set('a o e de da do das dos em no na nos nas para por com sem um uma uns umas que se ao aos as os ou mais menos como sua seu suas seus este esta isso pelo pela ate sobre entre www com br http https mm cm kg pag pagina'.split(' '));

export async function readPdf(file: File, maxPages = 12, onProgress?: (done: number, total: number) => void): Promise<{ pages: PdfPage[]; total: number }> {
  const data = new Uint8Array(await file.arrayBuffer());
  const doc = await pdfjs.getDocument({ data }).promise;
  const total = doc.numPages;
  const n = Math.min(total, maxPages);
  const pages: PdfPage[] = [];
  for (let i = 1; i <= n; i++) {
    const page = await doc.getPage(i);
    const vp0 = page.getViewport({ scale: 1 });
    const scale = Math.min(2, 1400 / Math.max(vp0.width, vp0.height));
    const vp = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(vp.width);
    canvas.height = Math.round(vp.height);
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport: vp }).promise;
    const tc = await page.getTextContent();
    const text = tc.items.map((it) => ('str' in it ? it.str : '')).join(' ');
    pages.push({ index: i, image: canvas.toDataURL('image/jpeg', 0.88), width: canvas.width, height: canvas.height, text });
    onProgress?.(i, n);
  }
  return { pages, total };
}

export function suggestKeywords(text: string, max = 10): string[] {
  const freq = new Map<string, number>();
  for (const w of normalize(text).split(' ')) {
    if (w.length < 4 || STOP.has(w) || /^\d+$/.test(w)) continue;
    freq.set(w, (freq.get(w) ?? 0) + 1);
  }
  return [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, max).map(([w]) => w);
}

/** Recorta uma região (em fração 0–1) de uma imagem dataURL. */
export function cropDataUrl(src: string, r: { x: number; y: number; w: number; h: number }): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(img.width * r.w));
      c.height = Math.max(1, Math.round(img.height * r.h));
      c.getContext('2d')!.drawImage(img, img.width * r.x, img.height * r.y, c.width, c.height, 0, 0, c.width, c.height);
      resolve(c.toDataURL('image/jpeg', 0.9));
    };
    img.onerror = reject;
    img.src = src;
  });
}
