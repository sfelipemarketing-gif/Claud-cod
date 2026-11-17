import { BRAND } from '../config/brand';
import type { Brand, LibraryItem } from '../lib/types';

/**
 * Marcas visuais. "Marca Demo A/B" são FICTÍCIAS, criadas apenas para demonstrar
 * a busca com várias marcas do mesmo produto (ex.: "silicone marca X").
 */
export const DEFAULT_BRANDS: Brand[] = [
  { id: 'guapore', name: 'Guaporé Vidros', logo: BRAND.assets.guaporeMarkNavy },
  { id: 'blindex', name: 'Blindex', logo: BRAND.assets.blindexLogo, isBlindex: true },
  { id: 'demo-a', name: 'Marca Demo A', fictitious: true },
  { id: 'demo-b', name: 'Marca Demo B', fictitious: true },
];

const L = (f: string) => `./library/${f}.svg`;
const NOTE = 'Ilustração demonstrativa — substituir por imagem oficial/autorizada.';

export const DEMO_LIBRARY: LibraryItem[] = [
  { id: 'lib-box-frontal', name: 'Box de banheiro frontal', brandId: 'blindex', category: 'Box de banheiro', keywords: ['box', 'banheiro', 'frontal', 'correr', 'temperado', 'incolor'], image: L('box-frontal'), source: 'demo', note: NOTE },
  { id: 'lib-box-canto', name: 'Box de banheiro de canto', brandId: 'blindex', category: 'Box de banheiro', keywords: ['box', 'banheiro', 'canto', 'l', 'temperado'], image: L('box-canto'), source: 'demo', note: NOTE },
  { id: 'lib-porta', name: 'Porta de vidro temperado pivotante', brandId: 'blindex', category: 'Portas', keywords: ['porta', 'pivotante', 'temperado', 'entrada', 'puxador'], image: L('porta'), source: 'demo', note: NOTE },
  { id: 'lib-guarda-corpo', name: 'Guarda-corpo de vidro', brandId: 'blindex', category: 'Guarda-corpo', keywords: ['guarda', 'corpo', 'guardacorpo', 'sacada', 'escada', 'corrimao', 'laminado'], image: L('guarda-corpo'), source: 'demo', note: NOTE },
  { id: 'lib-janela', name: 'Janela de vidro temperado de correr', brandId: 'blindex', category: 'Janelas', keywords: ['janela', 'correr', 'temperado', 'quatro', 'folhas'], image: L('janela'), source: 'demo', note: NOTE },
  { id: 'lib-fachada', name: 'Fachada de vidro', brandId: 'blindex', category: 'Fachadas', keywords: ['fachada', 'pele', 'vidro', 'comercial', 'vitrine', 'loja'], image: L('fachada'), source: 'demo', note: NOTE },
  { id: 'lib-espelho', name: 'Espelho lapidado', brandId: 'guapore', category: 'Espelhos', keywords: ['espelho', 'lapidado', 'bisote', 'decorativo', 'redondo'], image: L('espelho'), source: 'demo', note: NOTE },
  { id: 'lib-chapa', name: 'Vidro temperado incolor 8 mm', brandId: 'guapore', category: 'Vidros', keywords: ['vidro', 'chapa', 'temperado', 'incolor', '8mm', 'placa'], image: L('chapa'), source: 'demo', note: NOTE },
  { id: 'lib-laminado', name: 'Vidro laminado de segurança', brandId: 'guapore', category: 'Vidros', keywords: ['vidro', 'laminado', 'seguranca', 'pvb', 'chapa'], image: L('laminado'), source: 'demo', note: NOTE },
  { id: 'lib-tampo', name: 'Tampo de vidro para mesa', brandId: 'guapore', category: 'Móveis', keywords: ['tampo', 'mesa', 'vidro', 'jantar', 'temperado'], image: L('tampo'), source: 'demo', note: NOTE },
  { id: 'lib-ferragens', name: 'Kit de ferragens para box', brandId: 'guapore', category: 'Ferragens e acessórios', keywords: ['kit', 'ferragem', 'ferragens', 'roldana', 'trilho', 'box', 'acessorio'], image: L('ferragens'), source: 'demo', note: NOTE },
  { id: 'lib-silicone-a', name: 'Silicone incolor 280 g', brandId: 'demo-a', category: 'Vedação', keywords: ['silicone', 'incolor', 'vedacao', 'bisnaga', 'tubo', 'cartucho'], image: L('silicone-a'), source: 'demo', note: NOTE + ' Marca fictícia.' },
  { id: 'lib-silicone-b', name: 'Silicone acético 280 g', brandId: 'demo-b', category: 'Vedação', keywords: ['silicone', 'acetico', 'vedacao', 'bisnaga', 'tubo', 'cartucho', 'branco'], image: L('silicone-b'), source: 'demo', note: NOTE + ' Marca fictícia.' },
];

/** Grupos de sinônimos configuráveis para a busca (sem acentos, minúsculas). */
export const DEFAULT_SYNONYMS: string[][] = [
  ['box', 'boxe', 'blindex box', 'cabine'],
  ['silicone', 'selante', 'vedante', 'veda'],
  ['espelho', 'espelhos', 'bisote'],
  ['guarda corpo', 'guardacorpo', 'parapeito', 'sacada', 'corrimao'],
  ['porta', 'portas', 'pivotante'],
  ['janela', 'janelas', 'basculante'],
  ['temperado', 'temperados', 'temperada'],
  ['laminado', 'laminados', 'seguranca'],
  ['ferragem', 'ferragens', 'kit', 'acessorio', 'acessorios'],
  ['tampo', 'mesa', 'tampos'],
  ['fachada', 'fachadas', 'pele de vidro', 'vitrine'],
  ['vidro', 'vidros', 'chapa'],
];

export const CATEGORIES = ['Box de banheiro', 'Portas', 'Janelas', 'Guarda-corpo', 'Fachadas', 'Espelhos', 'Vidros', 'Móveis', 'Ferragens e acessórios', 'Vedação', 'Outros'];
