import { forwardRef, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { FORMATS, type FormatId } from '../config/brand';
import { ArtRenderer } from '../art/registry';
import type { ArtCtx } from '../art/types';

/**
 * Exibe a arte em escala dentro do contêiner. O nó interno (ref) mantém o
 * tamanho real, por isso é ele que é exportado em alta resolução.
 */
export const ArtPreview = forwardRef<HTMLDivElement, { ctx: ArtCtx; templateId: string; format: FormatId; maxHeight?: number; className?: string; bare?: boolean }>(
  function ArtPreview({ ctx, templateId, format, maxHeight, className = '', bare }, ref) {
    const box = useRef<HTMLDivElement>(null);
    const [w, setW] = useState(0);
    const fmt = FORMATS[format];

    useLayoutEffect(() => {
      if (box.current) setW(box.current.clientWidth);
    }, []);
    useEffect(() => {
      const el = box.current;
      if (!el) return;
      const ro = new ResizeObserver(() => setW(el.clientWidth));
      ro.observe(el);
      return () => ro.disconnect();
    }, []);

    let scale = w / fmt.w;
    if (maxHeight && fmt.h * scale > maxHeight) scale = maxHeight / fmt.h;
    const width = fmt.w * scale;
    const height = fmt.h * scale;

    return (
      <div ref={box} className={`w-full ${className}`}>
        <div className={`mx-auto relative overflow-hidden bg-white ${bare ? '' : 'rounded-xl shadow-lift ring-1 ring-black/5'}`} style={{ width: width || '100%', height: height || 200 }}>
          {w > 0 ? (
            <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: fmt.w, height: fmt.h }}>
              <ArtRenderer ref={ref} ctx={ctx} templateId={templateId} format={format} />
            </div>
          ) : null}
        </div>
      </div>
    );
  },
);
