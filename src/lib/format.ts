import type { UnitId } from './types';

export const UNITS: { id: UnitId; label: string; suffix: string }[] = [
  { id: 'un', label: 'Unidade', suffix: 'un.' },
  { id: 'm2', label: 'Metro quadrado (m²)', suffix: 'm²' },
  { id: 'ml', label: 'Metro linear', suffix: 'metro linear' },
  { id: 'cx', label: 'Caixa', suffix: 'caixa' },
  { id: 'custom', label: 'Outra (personalizada)', suffix: '' },
];

export function unitSuffix(unit: UnitId, custom: string): string {
  if (unit === 'custom') return custom.trim();
  return UNITS.find((u) => u.id === unit)?.suffix ?? '';
}

/** Converte texto digitado em pt-BR ("1.234,50", "1234.5", "R$ 99") para número. */
export function parseBRL(input: string): number | null {
  if (!input) return null;
  let s = input.replace(/[^\d,.-]/g, '');
  if (!s) return null;
  const lastComma = s.lastIndexOf(',');
  const lastDot = s.lastIndexOf('.');
  if (lastComma > -1 && lastComma > lastDot) {
    s = s.replace(/\./g, '').replace(',', '.');
  } else if (lastDot > -1 && lastComma > -1) {
    s = s.replace(/,/g, '');
  } else if (lastDot > -1) {
    // "1.234" (milhar) vs "12.5" (decimal)
    const decimals = s.length - lastDot - 1;
    if (decimals === 3 && s.split('.').length >= 2) s = s.replace(/\./g, '');
  }
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function splitPrice(n: number): { int: string; cents: string } {
  const fixed = n.toFixed(2);
  const [i, c] = fixed.split('.');
  return { int: Number(i).toLocaleString('pt-BR'), cents: c };
}

/** Desconto percentual entre preço anterior e novo preço (arredondado a 1 casa). */
export function discountPct(oldPrice: number | null, newPrice: number | null): number | null {
  if (!oldPrice || newPrice == null || oldPrice <= 0 || newPrice >= oldPrice) return null;
  return Math.round(((oldPrice - newPrice) / oldPrice) * 1000) / 10;
}

export function formatPct(n: number): string {
  return `${n.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;
}

export function formatDate(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

export function validityText(from: string, to: string): string {
  if (from && to) return `Válido de ${formatDate(from)} a ${formatDate(to)}`;
  if (to) return `Válido até ${formatDate(to)}`;
  if (from) return `Válido a partir de ${formatDate(from)}`;
  return '';
}

export function formatDateTime(ts: number): string {
  return new Date(ts).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export const uid = (p = 'id') => `${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

export function slugify(s: string): string {
  return normalize(s).replace(/\s+/g, '-').slice(0, 60) || 'material';
}

export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
