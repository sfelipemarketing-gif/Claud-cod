import type { FormatId } from '../config/brand';

export type Role = 'admin' | 'colaborador';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  /** Somente demonstração: senha em texto local. NÃO usar em produção. */
  password: string;
  active: boolean;
}

export type UnitId = 'un' | 'm2' | 'ml' | 'cx' | 'custom';

export interface Brand {
  id: string;
  name: string;
  logo?: string;
  isBlindex?: boolean;
  fictitious?: boolean;
}

export interface LibraryItem {
  id: string;
  name: string;
  brandId: string;
  category: string;
  keywords: string[];
  synonyms?: string[];
  image: string; // URL local ou dataURL
  source: 'demo' | 'upload' | 'pdf';
  note?: string;
  createdAt?: number;
}

export type MaterialKind = 'informativo' | 'promocao' | 'blindex';

export interface MaterialFields {
  title: string; // título do comunicado / kicker
  productName: string;
  brandId: string;
  brandCustom: string;
  price: string; // texto digitado pelo gestor (pt-BR)
  oldPrice: string;
  discountPct: string;
  unit: UnitId;
  unitCustom: string;
  description: string;
  highlights: string; // um por linha
  notes: string;
  validFrom: string;
  validTo: string;
  campaignName: string;
}

export interface MaterialShow {
  title: boolean;
  price: boolean;
  oldPrice: boolean;
  description: boolean;
  highlights: boolean;
  notes: boolean;
  validity: boolean;
  image: boolean;
  brandLogo: boolean;
}

export interface Material {
  id: string;
  kind: MaterialKind;
  templateId: string;
  format: FormatId;
  fields: MaterialFields;
  show: MaterialShow;
  imageId: string | null;
  imageData?: string; // imagem avulsa enviada pelo usuário
  name: string;
  thumb?: string;
  createdAt: number;
  updatedAt: number;
  createdBy?: string;
}
