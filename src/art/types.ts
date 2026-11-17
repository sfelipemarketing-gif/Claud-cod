import type { FormatId } from '../config/brand';
import type { Settings } from '../lib/store';
import type { Brand, MaterialFields, MaterialShow } from '../lib/types';

/** Contexto já calculado entregue a cada modelo de arte. */
export interface ArtCtx {
  format: FormatId;
  isSquare: boolean;
  isStory: boolean;
  isA4: boolean;
  /** altura em em (largura é sempre 108em) */
  H: number;
  f: MaterialFields;
  show: MaterialShow;
  image: string | null;
  brand?: Brand;
  brandName: string;
  isBlindex: boolean;
  settings: Settings;
  navy: string;
  red: string;
  accent: string;
  price: number | null;
  oldPrice: number | null;
  pct: number | null;
  unit: string;
  validity: string;
  highlights: string[];
}
