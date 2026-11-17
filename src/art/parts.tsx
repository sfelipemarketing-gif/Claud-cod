import type { CSSProperties, ReactNode } from 'react';
import { splitPrice } from '../lib/format';
import type { ArtCtx } from './types';

/** Assinatura institucional Guaporé: símbolo oficial + nome em texto. */
export function GuaporeSig({ ctx, tone = 'dark', size = 1, city = true }: { ctx: ArtCtx; tone?: 'dark' | 'light'; size?: number; city?: boolean }) {
  const color = tone === 'dark' ? ctx.navy : '#fff';
  const mark = tone === 'dark' ? ctx.settings.guaporeMarkNavy : ctx.settings.guaporeMarkWhite;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: `${1.3 * size}em` }}>
      <img src={mark} alt="" style={{ height: `${5.2 * size}em`, width: 'auto' }} />
      <div style={{ lineHeight: 1 }}>
        <div className="art-display" style={{ color, fontWeight: 800, fontSize: `${2.7 * size}em`, letterSpacing: '-0.01em' }}>Guaporé</div>
        <div className="art-display" style={{ color, fontWeight: 600, fontSize: `${1.25 * size}em`, letterSpacing: '0.42em', marginTop: '0.45em', opacity: 0.85 }}>
          VIDROS{city ? <span style={{ letterSpacing: '0.12em', fontWeight: 500 }}> · {ctx.settings.city.toUpperCase()}</span> : null}
        </div>
      </div>
    </div>
  );
}

export function BlindexLogo({ ctx, size = 10, style }: { ctx: ArtCtx; size?: number; style?: CSSProperties }) {
  return <img src={ctx.settings.blindexLogo} alt="Blindex" style={{ width: `${size}em`, height: `${size}em`, display: 'block', ...style }} />;
}

/** Logotipo da marca selecionada (Blindex prioriza o arquivo original). */
export function BrandLogo({ ctx, size = 9, style }: { ctx: ArtCtx; size?: number; style?: CSSProperties }) {
  if (!ctx.show.brandLogo || !ctx.brand || ctx.brand.id === 'guapore') return null;
  if (ctx.isBlindex) return <BlindexLogo ctx={ctx} size={size} style={style} />;
  if (ctx.brand.logo) return <img src={ctx.brand.logo} alt={ctx.brand.name} style={{ height: `${size * 0.7}em`, width: 'auto', ...style }} />;
  return (
    <div className="art-display" style={{ border: '0.15em solid currentColor', borderRadius: '0.6em', padding: '0.5em 0.9em', fontWeight: 800, fontSize: ctx.brandName.length > 10 ? '1.35em' : '1.7em', letterSpacing: '0.04em', whiteSpace: 'nowrap', ...style }}>
      {ctx.brandName.toUpperCase()}
    </div>
  );
}

export function Price({
  value, unit, color = '#fff', size = 1, label, align = 'left',
}: { value: number; unit?: string; color?: string; size?: number; label?: string; align?: 'left' | 'center' }) {
  const { int, cents } = splitPrice(value);
  return (
    <div style={{ color, textAlign: align }}>
      {label ? <div style={{ fontSize: `${1.5 * size}em`, fontWeight: 600, opacity: 0.85, marginBottom: '0.3em', letterSpacing: '0.04em' }}>{label}</div> : null}
      <div className="art-display" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: align === 'center' ? 'center' : 'flex-start', lineHeight: 0.9, fontWeight: 800 }}>
        <span style={{ fontSize: `${2.8 * size}em`, marginTop: '0.35em', marginRight: '0.25em', fontWeight: 700 }}>R$</span>
        <span style={{ fontSize: `${int.length > 6 ? 8.4 * size : 10 * size}em`, letterSpacing: '-0.035em' }}>{int}</span>
        <span style={{ display: 'flex', flexDirection: 'column', marginLeft: '0.25em', marginTop: '0.32em' }}>
          <span style={{ fontSize: `${3.6 * size}em` }}>,{cents}</span>
          {unit ? <span style={{ fontSize: `${1.65 * size}em`, fontWeight: 600, marginTop: '0.35em', opacity: 0.9, fontFamily: 'Inter Variable, Inter, sans-serif' }}>/{unit}</span> : null}
        </span>
      </div>
    </div>
  );
}

export function Kicker({ children, color, bg, size = 1, style }: { children: ReactNode; color: string; bg?: string; size?: number; style?: CSSProperties }) {
  return (
    <div
      className="art-display"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.6em', alignSelf: 'flex-start',
        color, background: bg, padding: bg ? '0.55em 1.1em' : 0, borderRadius: '10em',
        fontSize: `${1.55 * size}em`, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', ...style,
      }}
    >
      {children}
    </div>
  );
}

/** Tamanho do nome do produto conforme comprimento (evita estouro). */
export function fitSize(text: string, steps: [number, number][], fallback: number): number {
  const n = text.length;
  for (const [max, size] of steps) if (n <= max) return size;
  return fallback;
}

export function ProductImage({ ctx, style, imgStyle }: { ctx: ArtCtx; style?: CSSProperties; imgStyle?: CSSProperties }) {
  if (!ctx.image || !ctx.show.image) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0, minWidth: 0, ...style }}>
      <img src={ctx.image} alt="" style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto', objectFit: 'contain', display: 'block', ...imgStyle }} />
    </div>
  );
}

export function Check({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" style={{ width: '1.15em', height: '1.15em', flex: 'none', marginTop: '0.12em' }}>
      <circle cx="12" cy="12" r="12" fill={color} />
      <path d="M7 12.5l3.2 3.2L17 9" stroke="#fff" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CalendarIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" style={{ width: '1.1em', height: '1.1em', flex: 'none' }} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="5" width="18" height="16" rx="3" /><path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}

export function Highlights({ ctx, color, check, size = 1 }: { ctx: ArtCtx; color: string; check: string; size?: number }) {
  if (!ctx.show.highlights || !ctx.highlights.length) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75em', fontSize: `${2.1 * size}em`, color, fontWeight: 500, lineHeight: 1.3 }}>
      {ctx.highlights.map((h, i) => (
        <div key={i} style={{ display: 'flex', gap: '0.6em', alignItems: 'flex-start' }}>
          <Check color={check} />
          <span>{h}</span>
        </div>
      ))}
    </div>
  );
}
