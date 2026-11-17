/**
 * Busca da Biblioteca Inteligente — implementação LOCAL (sem IA).
 * Pontua por nome, marca, categoria, palavras-chave e sinônimos configurados.
 *
 * Ponto de extensão para a versão definitiva: substituir `searchLibrary`
 * por um serviço de busca semântica / embeddings / reconhecimento visual,
 * mantendo o mesmo contrato `SearchOutcome`.
 */
import { normalize } from './format';
import type { Brand, LibraryItem } from './types';

const STOPWORDS = new Set(['de', 'da', 'do', 'das', 'dos', 'e', 'a', 'o', 'para', 'com', 'em', 'marca', 'mm', 'g']);

export interface SearchHit {
  item: LibraryItem;
  score: number;
  coverage: number; // fração dos termos da busca encontrados
  matched: string[];
}

export interface SearchOutcome {
  status: 'empty' | 'unique' | 'multiple' | 'none';
  hits: SearchHit[];
  terms: string[];
}

function expand(token: string, synonyms: string[][]): string[] {
  const set = new Set([token]);
  for (const group of synonyms) {
    const g = group.map(normalize);
    if (g.some((w) => w === token || w.split(' ').includes(token))) g.forEach((w) => w.split(' ').forEach((x) => set.add(x)));
  }
  return [...set];
}

export function searchLibrary(query: string, items: LibraryItem[], brands: Brand[], synonyms: string[][]): SearchOutcome {
  const raw = normalize(query).split(' ').filter((t) => t && !STOPWORDS.has(t));
  const terms = [...new Set(raw)];
  if (!terms.length) return { status: 'empty', hits: [], terms };

  // Detecta nomes de marca completos na frase (ex.: "silicone marca demo a")
  const q = ` ${normalize(query)} `;
  const brandInQuery = new Set(brands.filter((b) => q.includes(` ${normalize(b.name)} `)).map((b) => b.id));

  const hits: SearchHit[] = [];
  for (const item of items) {
    const brand = brands.find((b) => b.id === item.brandId);
    const fields: [string[], number][] = [
      [normalize(item.name).split(' '), 3],
      [normalize(brand?.name ?? '').split(' '), 3],
      [normalize(item.category).split(' '), 2],
      [item.keywords.flatMap((k) => normalize(k).split(' ')), 2],
      [(item.synonyms ?? []).flatMap((k) => normalize(k).split(' ')), 1.5],
    ];
    let score = 0;
    const matched: string[] = [];
    for (const term of terms) {
      const variants = expand(term, synonyms);
      let best = 0;
      for (const [words, w] of fields) {
        for (const word of words) {
          if (!word) continue;
          for (const v of variants) {
            let s = 0;
            if (word === v) s = v === term ? w : w * 0.85;
            else if (v.length >= 3 && word.startsWith(v)) s = w * 0.7;
            else if (word.length >= 4 && v.length >= 4 && v.startsWith(word)) s = w * 0.6;
            if (s > best) best = s;
          }
        }
      }
      if (best > 0) {
        score += best;
        matched.push(term);
      }
    }
    if (score > 0 && brandInQuery.has(item.brandId)) score += 4;
    if (score > 0) hits.push({ item, score, coverage: matched.length / terms.length, matched });
  }

  hits.sort((a, b) => b.coverage - a.coverage || b.score - a.score);
  if (!hits.length) return { status: 'none', hits, terms };

  const full = hits.filter((h) => h.coverage === 1);
  const top = hits[0];
  const second = hits[1];
  // Correspondência inequívoca: só um resultado cobre todos os termos,
  // ou o primeiro supera claramente o segundo.
  const unique =
    top.coverage === 1 &&
    (full.length === 1 || (second && top.score >= second.score * 1.35 && top.score - second.score >= 1.5));
  return { status: unique ? 'unique' : 'multiple', hits: hits.slice(0, 12), terms };
}
