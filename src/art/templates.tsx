import type { CSSProperties } from 'react';
import { brl, formatPct } from '../lib/format';
import type { ArtCtx } from './types';
import { BlindexLogo, BrandLogo, CalendarIcon, fitSize, GuaporeSig, Highlights, Kicker, Price, ProductImage } from './parts';

const col: CSSProperties = { display: 'flex', flexDirection: 'column' };
const fill: CSSProperties = { flex: 1, minHeight: 0 };
const full: CSSProperties = { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' };

const nameSize = (c: ArtCtx, big = 7.6) =>
  fitSize(c.f.productName, [[14, big], [24, big * 0.84], [36, big * 0.7], [52, big * 0.58]], big * 0.48);

function Footer({ c, tone, children, style, sig = true }: { c: ArtCtx; tone: 'navy' | 'white'; children?: React.ReactNode; style?: CSSProperties; sig?: boolean }) {
  const dark = tone === 'navy';
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2em', padding: '2.6em 6em', background: dark ? c.navy : '#fff', color: dark ? '#fff' : c.navy, ...style }}>
      {sig ? <GuaporeSig ctx={c} tone={dark ? 'light' : 'dark'} size={0.82} /> : (
        <div className="art-display" style={{ fontSize: '1.6em', fontWeight: 700, letterSpacing: '0.02em' }}>{c.settings.companyName}<span style={{ fontWeight: 500, opacity: 0.75 }}> · {c.settings.city}</span></div>
      )}
      <div style={{ textAlign: 'right', fontSize: '1.45em', lineHeight: 1.45, opacity: 0.92, fontWeight: 500 }}>{children}</div>
    </div>
  );
}

function FooterInfo({ c }: { c: ArtCtx }) {
  const s = c.settings;
  const lines = [c.show.validity && c.validity ? <b key="v">{c.validity}</b> : null, s.phone || null, s.website || null].filter(Boolean);
  return <>{lines.map((l, i) => <div key={i}>{l}</div>)}</>;
}

/* ───────────────────────── 1. INFORMATIVO COMERCIAL ───────────────────────── */
export function Informativo({ c }: { c: ArtCtx }) {
  const side = c.isSquare;
  const hasImg = !!c.image && c.show.image;
  const priceCard = c.show.price && c.price != null ? (
    <div style={{ background: c.navy, borderRadius: '2.4em', padding: '2.6em 3.2em', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2em', boxShadow: '0 1.6em 3em -1.6em rgba(7,40,81,.55)' }}>
      <Price value={c.price} unit={c.unit} size={side ? 0.78 : 1} label={c.isBlindex ? 'Valor especial' : 'Preço'} />
      <BrandLogo ctx={c} size={side ? 8 : 10} style={{ color: '#fff', borderRadius: '0.4em' }} />
    </div>
  ) : null;
  const text = (
    <div style={{ ...col, gap: '2.2em', minWidth: 0, flex: side ? (hasImg ? '0 0 46%' : 1) : undefined }}>
      {c.show.title && c.f.title ? <Kicker color={c.navy} bg="#EAF0F7">{c.f.title}</Kicker> : null}
      <div className="art-display" style={{ fontSize: `${nameSize(c, side ? 6.4 : 8)}em`, fontWeight: 800, lineHeight: 1.02, color: c.navy, letterSpacing: '-0.02em' }}>
        {c.f.productName || 'Nome do produto'}
      </div>
      {c.show.description && c.f.description ? <div style={{ fontSize: side ? '2.1em' : '2.4em', lineHeight: 1.42, color: '#3f4a5c' }}>{c.f.description}</div> : null}
      <Highlights ctx={c} color="#1d2a3d" check={c.navy} size={side ? 0.92 : 1.05} />
      {side ? <div style={{ flex: 1 }} /> : null}
      {side ? priceCard : null}
      {side && c.show.notes && c.f.notes ? <div style={{ fontSize: '1.5em', color: '#6b7587', lineHeight: 1.45 }}>{c.f.notes}</div> : null}
    </div>
  );

  return (
    <div style={{ ...full, background: '#fff' }}>
      <div style={{ position: 'absolute', right: '-18em', top: '-22em', width: '58em', height: '58em', borderRadius: '50%', background: 'radial-gradient(circle, #EEF3F9 0%, #EEF3F9 60%, transparent 61%)' }} />
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5.5em 6em 0' }}>
        <GuaporeSig ctx={c} />
        <Kicker color="#fff" bg={c.navy} size={0.9}>Informativo</Kicker>
      </div>
      <div style={{ ...fill, position: 'relative', display: 'flex', flexDirection: side ? 'row' : 'column', gap: side ? '4em' : '3.4em', padding: side ? '4.5em 6em 4em' : '6em 6em 5em' }}>
        {text}
        {side ? (
          hasImg ? <ProductImage ctx={c} style={{ ...fill, flex: 1, background: '#F3F6FA', borderRadius: '2.6em', padding: '3em' }} /> : null
        ) : (
          <>
            {hasImg ? <ProductImage ctx={c} style={{ ...fill, background: 'linear-gradient(180deg,#F3F6FA,#E9EFF6)', borderRadius: '3em', padding: '4em' }} /> : <div style={fill} />}
            {priceCard}
          </>
        )}
        {!side && c.show.notes && c.f.notes ? <div style={{ fontSize: '1.55em', color: '#6b7587', lineHeight: 1.45 }}>{c.f.notes}</div> : null}
      </div>
      <Footer c={c} tone="navy" sig={false} style={{ padding: '2.2em 6em' }}><FooterInfo c={c} /></Footer>
    </div>
  );
}

/* ───────────────────────── 2. DESTAQUE BLINDEX ───────────────────────── */
export function DestaqueBlindex({ c }: { c: ArtCtx }) {
  const side = c.isSquare;
  const hasImg = !!c.image && c.show.image;
  const stripes = (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', right: 0, top: 0, width: '46em', height: '46em', opacity: 0.9 }}>
      <polygon points="58,0 74,0 100,26 100,42" fill={c.red} />
      <polygon points="80,0 86,0 100,14 100,20" fill={c.red} opacity=".55" />
    </svg>
  );
  const head = (
    <div style={{ ...col, gap: '2.4em', position: 'relative' }}>
      <BlindexLogo ctx={c} size={side ? 11 : 14} style={{ boxShadow: '0 1.4em 3em -1em rgba(0,0,0,.45)' }} />
      <Kicker color="#fff" size={side ? 0.95 : 1.1} style={{ letterSpacing: '0.22em' }}>
        <span style={{ width: '2.2em', height: '0.32em', background: c.red, display: 'inline-block' }} />
        {c.show.title && c.f.title ? c.f.title : 'Produto Blindex®'}
      </Kicker>
      <div className="art-display" style={{ color: '#fff', fontSize: `${nameSize(c, side ? 6.2 : 8)}em`, fontWeight: 800, lineHeight: 1.03, letterSpacing: '-0.02em' }}>
        {c.f.productName || 'Nome do produto'}
      </div>
      {c.show.description && c.f.description ? <div style={{ color: 'rgba(255,255,255,.86)', fontSize: side ? '1.95em' : '2.35em', lineHeight: 1.45 }}>{c.f.description}</div> : null}
      <Highlights ctx={c} color="#fff" check={c.red} size={side ? 0.85 : 1} />
    </div>
  );
  const price = c.show.price && c.price != null ? (
    <div style={{ background: c.red, color: '#fff', borderRadius: '2.2em', padding: '2.4em 3em', alignSelf: side ? 'stretch' : 'flex-start', boxShadow: '0 1.6em 3em -1.4em rgba(238,46,36,.65)' }}>
      <Price value={c.price} unit={c.unit} size={side ? 0.74 : 1} label={c.f.title && !c.show.title ? c.f.title : 'Condição especial'} />
    </div>
  ) : null;
  const legal = (
    <div style={{ fontSize: '1.15em', color: '#7a8496', padding: '0 6em 1.6em', background: '#fff' }}>
      {c.show.notes && c.f.notes ? <span style={{ color: '#3f4a5c' }}>{c.f.notes} · </span> : null}
      Produto da marca Blindex® comercializado pela {c.settings.companyName}. Blindex® é marca registrada de seu respectivo titular.
    </div>
  );

  if (side) {
    return (
      <div style={{ ...full, background: '#fff' }}>
        <div style={{ ...fill, display: 'flex' }}>
          <div style={{ flex: '0 0 52%', background: `linear-gradient(160deg, ${c.navy} 0%, #04182f 100%)`, padding: '5.5em 4.5em 4em 6em', position: 'relative', overflow: 'hidden', ...col, justifyContent: 'space-between' }}>
            {head}
          </div>
          <div style={{ ...col, flex: 1, padding: '5em 5em 4em', gap: '2.8em', position: 'relative', background: '#F4F6F9' }}>
            {stripes}
            {hasImg ? <ProductImage ctx={c} style={{ ...fill, position: 'relative' }} /> : <div style={fill} />}
            {price}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2.2em 6em 1.2em', background: '#fff' }}>
          <GuaporeSig ctx={c} size={0.76} />
          <div style={{ fontSize: '1.4em', color: c.navy, fontWeight: 600, textAlign: 'right' }}>{c.show.validity && c.validity ? c.validity : c.settings.website}</div>
        </div>
        {legal}
      </div>
    );
  }
  return (
    <div style={{ ...full, background: '#fff' }}>
      <div style={{ background: `linear-gradient(165deg, ${c.navy} 0%, #04182f 100%)`, padding: '6em 6em 16em', position: 'relative', overflow: 'hidden' }}>
        {stripes}
        {head}
      </div>
      <div style={{ ...fill, ...col, padding: '0 6em 3em', gap: '3.4em', marginTop: '-12em', position: 'relative' }}>
        {hasImg ? <ProductImage ctx={c} style={{ ...fill, background: '#fff', borderRadius: '3em', padding: '4em', boxShadow: '0 2.4em 5em -2em rgba(7,40,81,.35)' }} /> : <div style={fill} />}
        <div style={{ display: 'flex', alignItems: 'center', gap: '3em' }}>
          {price}
          <div style={{ flex: 1, borderLeft: price ? `0.3em solid ${c.red}` : 'none', paddingLeft: price ? '2.4em' : 0 }}>
            <div className="art-display" style={{ fontSize: '2.3em', fontWeight: 800, color: c.navy, lineHeight: 1.2 }}>Qualidade Blindex®</div>
            <div style={{ fontSize: '1.9em', color: '#3f4a5c', marginTop: '0.4em', lineHeight: 1.4 }}>Disponível na {c.settings.companyName} · {c.settings.city}</div>
            {c.show.validity && c.validity ? <div style={{ fontSize: '1.7em', color: c.red, fontWeight: 700, marginTop: '0.5em' }}>{c.validity}</div> : null}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2.6em 6em 1.4em', borderTop: '0.15em solid #E6EAF0' }}>
        <GuaporeSig ctx={c} size={0.85} />
        <div style={{ fontSize: '1.5em', color: c.navy, fontWeight: 600, textAlign: 'right', lineHeight: 1.45 }}><FooterInfo c={c} /></div>
      </div>
      {legal}
    </div>
  );
}

/* ───────────────────────── 3. PROMOÇÃO ───────────────────────── */
export function Promocao({ c }: { c: ArtCtx }) {
  const side = c.isSquare;
  const hasImg = !!c.image && c.show.image;
  const accent = c.isBlindex ? c.red : c.accent;
  const onAccent = c.isBlindex ? '#fff' : '#1b1300';
  const badge = c.pct != null ? (
    <div className="art-display" style={{ position: 'absolute', right: side ? '4em' : '6em', top: side ? '3.5em' : '5em', width: side ? '15em' : '19em', height: side ? '15em' : '19em', borderRadius: '50%', background: accent, color: onAccent, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transform: 'rotate(-10deg)', boxShadow: '0 1.6em 3em -1em rgba(0,0,0,.4)', zIndex: 2 }}>
      <div style={{ fontSize: `${(side ? 4.6 : 5.8) * (formatPct(c.pct).length > 3 ? 0.72 : 1)}em`, fontWeight: 900, lineHeight: 1, letterSpacing: '-0.03em' }}>-{formatPct(c.pct)}</div>
      <div style={{ fontSize: side ? '1.5em' : '1.9em', fontWeight: 800, letterSpacing: '0.2em', marginTop: '0.2em' }}>OFF</div>
    </div>
  ) : null;
  return (
    <div style={{ ...full, background: `radial-gradient(120% 80% at 80% 20%, #123d73 0%, ${c.navy} 45%, #03142b 100%)`, color: '#fff' }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, bottom: 0, width: '100%', height: '40%', opacity: 0.08 }}>
        <polygon points="0,100 0,30 100,85 100,100" fill="#fff" />
      </svg>
      {badge}
      <div style={{ ...fill, ...col, padding: side ? '5em 6em 3em' : '6.5em 6em 4em', gap: side ? '2em' : '3em', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2em' }}>
          {c.isBlindex && c.show.brandLogo ? <BlindexLogo ctx={c} size={side ? 8 : 10} /> : null}
          <Kicker color={onAccent} bg={accent} size={side ? 1 : 1.2}>{c.show.title && c.f.title ? c.f.title : 'Oferta especial'}</Kicker>
        </div>
        <div className="art-display" style={{ fontSize: `${nameSize(c, side ? 6.6 : 8.6)}em`, fontWeight: 900, lineHeight: 1, letterSpacing: '-0.025em', maxWidth: c.pct != null ? '72%' : '100%', textTransform: 'uppercase' }}>
          {c.f.productName || 'Nome do produto'}
        </div>
        {c.show.description && c.f.description ? <div style={{ fontSize: side ? '1.95em' : '2.4em', lineHeight: 1.4, color: 'rgba(255,255,255,.82)', maxWidth: '80%' }}>{c.f.description}</div> : null}
        <div style={{ ...fill, display: 'flex', flexDirection: side ? 'row' : 'column', gap: '3em', alignItems: side ? 'flex-end' : 'stretch' }}>
          {hasImg ? <ProductImage ctx={c} style={{ ...fill, flex: 1, filter: 'drop-shadow(0 2em 2.4em rgba(0,0,0,.45))' }} /> : <div style={{ flex: 1 }} />}
          {c.show.price && c.price != null ? (
            <div style={{ background: '#fff', color: c.navy, borderRadius: '2.4em', padding: side ? '2.4em 2.8em' : '3em 3.6em', flex: side ? '0 0 auto' : undefined, boxShadow: '0 2em 4em -1.6em rgba(0,0,0,.55)', position: 'relative' }}>
              {c.show.oldPrice && c.oldPrice != null ? (
                <div style={{ fontSize: side ? '1.8em' : '2.3em', color: '#6b7587', fontWeight: 600, marginBottom: '0.5em' }}>
                  De <span style={{ textDecoration: 'line-through', textDecorationColor: c.red, textDecorationThickness: '0.12em' }}>{brl(c.oldPrice)}</span> por
                </div>
              ) : <div style={{ fontSize: side ? '1.6em' : '2em', color: '#6b7587', fontWeight: 700, letterSpacing: '0.12em', marginBottom: '0.4em' }}>POR APENAS</div>}
              <Price value={c.price} unit={c.unit} color={c.navy} size={side ? 0.8 : 1.12} />
            </div>
          ) : null}
        </div>
        {c.show.notes && c.f.notes ? <div style={{ fontSize: '1.5em', color: 'rgba(255,255,255,.7)', lineHeight: 1.4 }}>{c.f.notes}</div> : null}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2em', padding: '2.4em 6em', background: '#fff', color: c.navy }}>
        <GuaporeSig ctx={c} size={0.8} />
        {c.show.validity && c.validity ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6em', fontSize: '1.6em', fontWeight: 700 }}><CalendarIcon color={c.navy} />{c.validity}</div>
        ) : <div style={{ fontSize: '1.5em', fontWeight: 600 }}>{c.settings.website}</div>}
      </div>
      {c.isBlindex ? <div style={{ background: '#fff', color: '#7a8496', fontSize: '1.1em', padding: '0 6em 1.4em' }}>Blindex® é marca registrada de seu respectivo titular. Condições sujeitas a disponibilidade de estoque.</div> : null}
    </div>
  );
}

/* ───────────────────────── 4. CAMPANHA INTERNA ───────────────────────── */
export function Campanha({ c }: { c: ArtCtx }) {
  const side = c.isSquare;
  const hasImg = !!c.image && c.show.image;
  const accent = c.isBlindex ? c.red : c.navy;
  const campaign = c.f.campaignName || c.f.title || 'Campanha';
  return (
    <div style={{ ...full, background: '#F3F6FA' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: side ? '58%' : '50%', background: `linear-gradient(135deg, ${c.navy} 0%, #0d3a70 100%)`, clipPath: 'polygon(0 0,100% 0,100% 78%,0 100%)' }} />
      <div style={{ position: 'absolute', right: '-10em', top: side ? '6em' : '10em', width: '40em', height: '40em', borderRadius: '50%', border: '5em solid rgba(255,255,255,.06)' }} />
      <div style={{ ...fill, ...col, position: 'relative', padding: side ? '5em 6em 3em' : '6em 6em 4em', gap: side ? '1.8em' : '2.6em' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <GuaporeSig ctx={c} tone="light" size={0.85} />
          {c.isBlindex && c.show.brandLogo ? <BlindexLogo ctx={c} size={side ? 7.5 : 9.5} /> : <Kicker color="#fff" bg="rgba(255,255,255,.14)" size={0.85}>Campanha</Kicker>}
        </div>
        <div className="art-display" style={{ color: '#fff', fontSize: `${fitSize(campaign, [[16, side ? 7.4 : 9], [28, side ? 6 : 7.4], [44, side ? 4.8 : 6]], side ? 4 : 5)}em`, fontWeight: 900, lineHeight: 0.98, letterSpacing: '-0.03em', marginTop: side ? '1em' : '2em' }}>
          {campaign}
        </div>
        {c.show.validity && c.validity ? (
          <div style={{ display: 'inline-flex', alignSelf: 'flex-start', alignItems: 'center', gap: '0.6em', color: '#fff', background: 'rgba(255,255,255,.12)', border: '0.1em solid rgba(255,255,255,.25)', borderRadius: '10em', padding: '0.6em 1.2em', fontSize: '1.7em', fontWeight: 600 }}>
            <CalendarIcon color="#fff" />{c.validity}
          </div>
        ) : null}
        <div style={{ ...fill, background: '#fff', borderRadius: '3em', boxShadow: '0 2.4em 5em -2.4em rgba(7,40,81,.4)', marginTop: side ? '1.4em' : '3em', display: 'flex', flexDirection: side ? 'row' : 'column', overflow: 'hidden' }}>
          {hasImg ? <ProductImage ctx={c} style={{ flex: side ? '0 0 42%' : 1, minHeight: 0, background: '#EEF3F9', padding: '3em' }} /> : null}
          <div style={{ ...col, flex: side || !hasImg ? 1 : '0 0 auto', padding: side ? '3em 3.4em' : '3.6em 4em', gap: '1.6em', justifyContent: 'center' }}>
            {c.pct != null ? (
              <div className="art-display" style={{ color: accent, fontWeight: 900, lineHeight: 0.9, letterSpacing: '-0.04em', fontSize: side ? '8em' : '11em' }}>
                {formatPct(c.pct)}<span style={{ fontSize: '0.38em', letterSpacing: '0.04em', marginLeft: '0.25em' }}>OFF</span>
              </div>
            ) : null}
            <div className="art-display" style={{ color: c.navy, fontWeight: 800, fontSize: side ? '3em' : '3.8em', lineHeight: 1.08 }}>{c.f.productName || 'Produto ou serviço'}</div>
            {c.show.description && c.f.description ? <div style={{ fontSize: side ? '1.75em' : '2.2em', lineHeight: 1.42, color: '#3f4a5c' }}>{c.f.description}</div> : null}
            {c.show.price && c.price != null ? (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1.6em', flexWrap: 'wrap' }}>
                <Price value={c.price} unit={c.unit} color={accent} size={side ? 0.62 : 0.86} />
                {c.show.oldPrice && c.oldPrice != null ? <div style={{ fontSize: side ? '1.7em' : '2.1em', color: '#8a93a3', textDecoration: 'line-through', marginBottom: '0.4em' }}>{brl(c.oldPrice)}</div> : null}
              </div>
            ) : null}
          </div>
        </div>
        {c.show.notes && c.f.notes ? <div style={{ fontSize: '1.5em', color: '#5d6879', lineHeight: 1.4 }}>{c.f.notes}</div> : null}
      </div>
      {c.isBlindex ? <div style={{ fontSize: '1.1em', color: '#7a8496', padding: '0 6em 1.6em' }}>Blindex® é marca registrada de seu respectivo titular.</div> : null}
      <div style={{ height: '1.2em', background: `linear-gradient(90deg, ${c.navy} 0 70%, ${c.isBlindex ? c.red : c.accent} 70% 100%)` }} />
    </div>
  );
}

/* ───────────────────────── 5. COMUNICADO COMERCIAL ───────────────────────── */
export function Comunicado({ c }: { c: ArtCtx }) {
  const side = c.isSquare;
  const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  const title = (c.show.title && c.f.title) || c.f.productName || 'Comunicado';
  const accent = c.isBlindex ? c.red : c.navy;
  return (
    <div style={{ ...full, background: '#fff' }}>
      <div style={{ height: '1.4em', background: `linear-gradient(90deg, ${c.navy} 0 75%, ${accent} 75% 100%)` }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: side ? '4em 6em 0' : '5.5em 6em 0' }}>
        <GuaporeSig ctx={c} />
        {c.isBlindex && c.show.brandLogo ? <BlindexLogo ctx={c} size={side ? 8 : 10} /> : null}
      </div>
      <div style={{ ...fill, ...col, padding: side ? '4em 6em 3em' : '7em 7em 5em', gap: side ? '2em' : '3em' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.4em' }}>
          <div style={{ width: '4em', height: '0.4em', background: accent }} />
          <Kicker color={accent} size={side ? 1 : 1.15}>Comunicado comercial</Kicker>
        </div>
        <div className="art-display" style={{ fontSize: `${fitSize(title, [[20, side ? 6 : 7.4], [36, side ? 4.8 : 6], [60, side ? 3.9 : 5]], side ? 3.4 : 4.2)}em`, fontWeight: 800, color: c.navy, lineHeight: 1.08, letterSpacing: '-0.02em' }}>{title}</div>
        {c.show.title && c.f.title && c.f.productName ? <div style={{ fontSize: side ? '2.2em' : '2.7em', fontWeight: 600, color: '#3f4a5c' }}>{c.f.productName}</div> : null}
        <div style={{ fontSize: '1.6em', color: '#7a8496', fontWeight: 500 }}>{c.settings.city} · {today}</div>
        {c.show.description && c.f.description ? <div style={{ fontSize: side ? '2.15em' : '2.6em', lineHeight: 1.55, color: '#1d2a3d', whiteSpace: 'pre-line' }}>{c.f.description}</div> : null}
        <Highlights ctx={c} color="#1d2a3d" check={accent} size={side ? 0.95 : 1.15} />
        <div style={{ ...fill, display: 'flex', gap: '3em', alignItems: 'flex-end' }}>
          {c.show.price && c.price != null ? (
            <div style={{ background: '#F3F6FA', borderLeft: `0.6em solid ${accent}`, borderRadius: '1.6em', padding: '2.2em 3em' }}>
              <Price value={c.price} unit={c.unit} color={c.navy} size={side ? 0.62 : 0.8} label="Novo valor" />
            </div>
          ) : null}
          {c.image && c.show.image ? <ProductImage ctx={c} style={{ ...fill, flex: 1, height: '100%', justifyContent: 'flex-end' }} /> : null}
        </div>
        {c.show.notes && c.f.notes ? <div style={{ fontSize: '1.65em', color: '#3f4a5c', background: '#FFF8E6', border: '0.1em solid #F3DFA6', borderRadius: '1.2em', padding: '1.2em 1.6em', lineHeight: 1.45 }}><b>Observação:</b> {c.f.notes}</div> : null}
        <div style={{ fontSize: '1.8em', color: c.navy, fontWeight: 700 }}>Equipe Comercial · {c.settings.companyName}</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1.8em 6em', borderTop: '0.15em solid #E6EAF0', fontSize: '1.35em', color: '#6b7587' }}>
        <span>{c.show.validity && c.validity ? c.validity : c.settings.website}</span>
        <span>{c.isBlindex ? 'Blindex® é marca registrada de seu respectivo titular.' : c.settings.companyName}</span>
      </div>
    </div>
  );
}

/* ───────────────────────── 6. MATERIAL PARA VENDEDORES ───────────────────────── */
export function Vendedor({ c }: { c: ArtCtx }) {
  const side = c.isSquare;
  const accent = c.isBlindex ? c.red : c.navy;
  const hasImg = !!c.image && c.show.image;
  return (
    <div style={{ ...full, background: '#fff', flexDirection: 'row' }}>
      <div style={{ width: '7em', background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
        <div className="art-display" style={{ transform: 'rotate(-90deg)', whiteSpace: 'nowrap', color: '#fff', fontWeight: 800, letterSpacing: '0.38em', fontSize: '1.5em' }}>
          MATERIAL DE APOIO · USO INTERNO DA EQUIPE DE VENDAS
        </div>
      </div>
      <div style={{ ...col, flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: side ? '4em 5em 0' : '5.5em 6em 0' }}>
          <GuaporeSig ctx={c} size={0.9} />
          {c.isBlindex && c.show.brandLogo ? <BlindexLogo ctx={c} size={side ? 8 : 10} /> : <BrandLogo ctx={c} size={8} style={{ color: c.navy }} />}
        </div>
        <div style={{ ...fill, ...col, padding: side ? '3.4em 5em 3em' : '5em 6em 4em', gap: side ? '2em' : '3em' }}>
          <Kicker color={accent} size={side ? 0.95 : 1.1}>{c.show.title && c.f.title ? c.f.title : 'Ficha do produto'}</Kicker>
          <div className="art-display" style={{ color: c.navy, fontSize: `${nameSize(c, side ? 5.6 : 7.4)}em`, fontWeight: 800, lineHeight: 1.04, letterSpacing: '-0.02em' }}>{c.f.productName || 'Nome do produto'}</div>
          <div style={{ ...fill, display: 'flex', flexDirection: side ? 'row' : 'column', gap: '3em' }}>
            {hasImg ? <ProductImage ctx={c} style={{ flex: side ? '0 0 40%' : 1, minHeight: 0, background: '#F3F6FA', borderRadius: '2.4em', padding: '2.6em' }} /> : null}
            <div style={{ ...col, flex: side ? 1 : '0 0 auto', gap: '2.2em', minWidth: 0 }}>
              {c.show.description && c.f.description ? (
                <div>
                  <div style={{ fontSize: '1.35em', fontWeight: 800, letterSpacing: '0.16em', color: accent, marginBottom: '0.7em' }}>ARGUMENTO DE VENDA</div>
                  <div style={{ fontSize: side ? '1.85em' : '2.3em', lineHeight: 1.5, color: '#1d2a3d' }}>{c.f.description}</div>
                </div>
              ) : null}
              {c.show.highlights && c.highlights.length ? (
                <div>
                  <div style={{ fontSize: '1.35em', fontWeight: 800, letterSpacing: '0.16em', color: accent, marginBottom: '1em' }}>DESTAQUES</div>
                  <Highlights ctx={c} color="#1d2a3d" check={accent} size={side ? 0.86 : 1.05} />
                </div>
              ) : null}
            </div>
          </div>
          {(c.show.price && c.price != null) || (c.show.notes && c.f.notes) ? (
            <div style={{ display: 'flex', gap: '2.4em', alignItems: 'stretch' }}>
              {c.show.price && c.price != null ? (
                <div style={{ background: c.navy, borderRadius: '2em', padding: '2em 2.8em' }}>
                  <Price value={c.price} unit={c.unit} size={side ? 0.6 : 0.78} label="Preço de referência" />
                </div>
              ) : null}
              {c.show.notes && c.f.notes ? <div style={{ flex: 1, border: '0.12em dashed #C9D3E0', borderRadius: '2em', padding: '1.6em 2em', fontSize: '1.6em', color: '#3f4a5c', lineHeight: 1.45, display: 'flex', alignItems: 'center' }}>{c.f.notes}</div> : null}
            </div>
          ) : null}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1.8em 6em 1.8em 5em', borderTop: '0.15em solid #E6EAF0', fontSize: '1.3em', color: '#6b7587' }}>
          <span>{c.show.validity && c.validity ? c.validity : `Material interno · ${c.settings.companyName}`}</span>
          <span>{c.isBlindex ? 'Blindex® é marca registrada de seu respectivo titular.' : c.settings.city}</span>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── 7. VITRINE DE PRODUTO ───────────────────────── */
export function Vitrine({ c }: { c: ArtCtx }) {
  const side = c.isSquare;
  const accent = c.isBlindex ? c.red : c.navy;
  return (
    <div style={{ ...full, background: 'radial-gradient(90% 60% at 50% 38%, #ffffff 0%, #EEF3F9 55%, #DCE5F0 100%)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: side ? '4.5em 5.5em 0' : '6em 6em 0' }}>
        {c.isBlindex && c.show.brandLogo ? <BlindexLogo ctx={c} size={side ? 9 : 12} /> : <GuaporeSig ctx={c} />}
        <Kicker color={accent} bg="#fff" size={side ? 0.9 : 1.05} style={{ boxShadow: '0 0.8em 2em -1em rgba(7,40,81,.35)' }}>{c.show.title && c.f.title ? c.f.title : 'Conheça'}</Kicker>
      </div>
      <ProductImage ctx={c} style={{ ...fill, padding: side ? '2em 10em 1em' : '4em 8em 2em', filter: 'drop-shadow(0 2.6em 2.6em rgba(7,40,81,.28))' }} />
      {!(c.image && c.show.image) ? <div style={fill} /> : null}
      <div style={{ ...col, alignItems: 'center', textAlign: 'center', padding: side ? '0 7em 3.4em' : '0 7em 5em', gap: side ? '1.4em' : '2.2em' }}>
        <div className="art-display" style={{ color: c.navy, fontSize: `${nameSize(c, side ? 6 : 8)}em`, fontWeight: 800, lineHeight: 1.02, letterSpacing: '-0.025em' }}>{c.f.productName || 'Nome do produto'}</div>
        {c.show.description && c.f.description ? <div style={{ fontSize: side ? '1.95em' : '2.5em', color: '#3f4a5c', lineHeight: 1.45, maxWidth: '86%' }}>{c.f.description}</div> : null}
        {c.show.price && c.price != null ? (
          <div style={{ background: accent, borderRadius: '10em', padding: side ? '1.2em 3.4em' : '1.6em 4.4em', marginTop: '0.6em' }}>
            <Price value={c.price} unit={c.unit} size={side ? 0.55 : 0.72} align="center" />
          </div>
        ) : null}
        {c.show.notes && c.f.notes ? <div style={{ fontSize: '1.5em', color: '#6b7587' }}>{c.f.notes}</div> : null}
      </div>
      <Footer c={c} tone="navy" style={{ padding: '2.2em 6em' }}>
        {c.isBlindex ? <div style={{ fontSize: '0.8em', opacity: 0.8, maxWidth: '30em' }}>Blindex® é marca registrada de seu respectivo titular.</div> : null}
        <FooterInfo c={c} />
      </Footer>
    </div>
  );
}
