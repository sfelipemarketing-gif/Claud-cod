/**
 * Estado da aplicação persistido NO NAVEGADOR (IndexedDB via idb-keyval).
 * Protótipo: não é banco de dados corporativo. Os dados podem ser perdidos se
 * o armazenamento local do navegador for limpo.
 *
 * Versão definitiva: substituir as funções de persistência por chamadas a uma
 * API (ex.: REST/GraphQL) com banco de dados e armazenamento de arquivos.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { get, set, del } from 'idb-keyval';
import { BRAND } from '../config/brand';
import { DEFAULT_BRANDS, DEFAULT_SYNONYMS, DEMO_LIBRARY } from '../data/library';
import type { Brand, LibraryItem, Material, User } from './types';

export interface Settings {
  navy: string;
  blindexRed: string;
  promoAccent: string;
  demoWatermark: boolean;
  companyName: string;
  city: string;
  phone: string;
  website: string;
  instagram: string;
  guaporeMarkWhite: string;
  guaporeMarkNavy: string;
  blindexLogo: string;
}

export const DEFAULT_SETTINGS: Settings = {
  navy: BRAND.colors.navy,
  blindexRed: BRAND.colors.blindexRed,
  promoAccent: BRAND.colors.promoAccent,
  demoWatermark: true,
  companyName: BRAND.company,
  city: BRAND.city,
  phone: '',
  website: 'guaporevidros.com.br',
  instagram: '',
  guaporeMarkWhite: BRAND.assets.guaporeMarkWhite,
  guaporeMarkNavy: BRAND.assets.guaporeMarkNavy,
  blindexLogo: BRAND.assets.blindexLogo,
};

/** Contas FICTÍCIAS de demonstração. Autenticação simulada — não é segura. */
export const DEMO_USERS: User[] = [
  { id: 'u-admin', name: 'Admin Demonstração', email: 'admin@guapore.demo', role: 'admin', password: 'demo123', active: true },
  { id: 'u-colab', name: 'Colaborador Demonstração', email: 'colaborador@guapore.demo', role: 'colaborador', password: 'demo123', active: true },
];

interface Store {
  ready: boolean;
  settings: Settings;
  updateSettings: (p: Partial<Settings>) => void;
  users: User[];
  saveUsers: (u: User[]) => void;
  brands: Brand[];
  saveBrands: (b: Brand[]) => void;
  library: LibraryItem[];
  customLibrary: LibraryItem[];
  hiddenDemo: string[];
  upsertLibraryItem: (i: LibraryItem) => void;
  removeLibraryItem: (id: string) => void;
  restoreDemoLibrary: () => void;
  synonyms: string[][];
  saveSynonyms: (s: string[][]) => void;
  history: Material[];
  saveMaterial: (m: Material) => void;
  removeMaterial: (id: string) => void;
  clearAll: () => Promise<void>;
}

const Ctx = createContext<Store | null>(null);
const K = {
  settings: 'gs:settings',
  users: 'gs:users',
  brands: 'gs:brands',
  library: 'gs:library',
  hidden: 'gs:hiddenDemo',
  synonyms: 'gs:synonyms',
  history: 'gs:history',
};

function hexToRgb(hex: string): string | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [users, setUsers] = useState<User[]>(DEMO_USERS);
  const [brands, setBrands] = useState<Brand[]>(DEFAULT_BRANDS);
  const [customLibrary, setCustomLibrary] = useState<LibraryItem[]>([]);
  const [hiddenDemo, setHiddenDemo] = useState<string[]>([]);
  const [synonyms, setSynonyms] = useState<string[][]>(DEFAULT_SYNONYMS);
  const [history, setHistory] = useState<Material[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [s, u, b, l, h, sy, hi] = await Promise.all([get(K.settings), get(K.users), get(K.brands), get(K.library), get(K.history), get(K.synonyms), get(K.hidden)]);
        if (s) setSettings({ ...DEFAULT_SETTINGS, ...s });
        if (u) setUsers(u);
        if (b) setBrands(b);
        if (l) setCustomLibrary(l);
        if (h) setHistory(h);
        if (sy) setSynonyms(sy);
        if (hi) setHiddenDemo(hi);
      } catch (e) {
        console.warn('Armazenamento local indisponível', e);
      }
      setReady(true);
    })();
  }, []);

  // Aplica cores configuradas à interface (variáveis CSS)
  useEffect(() => {
    const root = document.documentElement;
    const n = hexToRgb(settings.navy);
    const r = hexToRgb(settings.blindexRed);
    if (n) root.style.setProperty('--navy', n);
    if (r) root.style.setProperty('--bred', r);
  }, [settings.navy, settings.blindexRed]);

  const persist = useCallback((key: string, value: unknown) => {
    set(key, value).catch((e) => console.warn('Falha ao salvar localmente', e));
  }, []);

  const updateSettings = useCallback((p: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...p };
      persist(K.settings, next);
      return next;
    });
  }, [persist]);

  const saveUsers = useCallback((u: User[]) => { setUsers(u); persist(K.users, u); }, [persist]);
  const saveBrands = useCallback((b: Brand[]) => { setBrands(b); persist(K.brands, b); }, [persist]);
  const saveSynonyms = useCallback((s: string[][]) => { setSynonyms(s); persist(K.synonyms, s); }, [persist]);

  const upsertLibraryItem = useCallback((item: LibraryItem) => {
    if (item.source === 'demo') {
      // edição de item demo: salva cópia customizada e oculta o original
      setHiddenDemo((prev) => { const next = [...new Set([...prev, item.id])]; persist(K.hidden, next); return next; });
      item = { ...item, id: `${item.id}-edit`, source: 'upload' };
    }
    setCustomLibrary((prev) => {
      const next = prev.some((p) => p.id === item.id) ? prev.map((p) => (p.id === item.id ? item : p)) : [item, ...prev];
      persist(K.library, next);
      return next;
    });
  }, [persist]);

  const removeLibraryItem = useCallback((id: string) => {
    if (DEMO_LIBRARY.some((d) => d.id === id)) {
      setHiddenDemo((prev) => { const next = [...new Set([...prev, id])]; persist(K.hidden, next); return next; });
      return;
    }
    setCustomLibrary((prev) => { const next = prev.filter((p) => p.id !== id); persist(K.library, next); return next; });
  }, [persist]);

  const restoreDemoLibrary = useCallback(() => { setHiddenDemo([]); persist(K.hidden, []); }, [persist]);

  const saveMaterial = useCallback((m: Material) => {
    setHistory((prev) => {
      const next = [m, ...prev.filter((p) => p.id !== m.id)].slice(0, 60);
      persist(K.history, next);
      return next;
    });
  }, [persist]);

  const removeMaterial = useCallback((id: string) => {
    setHistory((prev) => { const next = prev.filter((p) => p.id !== id); persist(K.history, next); return next; });
  }, [persist]);

  const clearAll = useCallback(async () => {
    await Promise.all(Object.values(K).map((k) => del(k)));
    setSettings(DEFAULT_SETTINGS); setUsers(DEMO_USERS); setBrands(DEFAULT_BRANDS);
    setCustomLibrary([]); setHiddenDemo([]); setSynonyms(DEFAULT_SYNONYMS); setHistory([]);
  }, []);

  const library = useMemo(() => [...customLibrary, ...DEMO_LIBRARY.filter((d) => !hiddenDemo.includes(d.id))], [customLibrary, hiddenDemo]);

  const value: Store = {
    ready, settings, updateSettings, users, saveUsers, brands, saveBrands, library, customLibrary, hiddenDemo,
    upsertLibraryItem, removeLibraryItem, restoreDemoLibrary, synonyms, saveSynonyms, history, saveMaterial, removeMaterial, clearAll,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const c = useContext(Ctx);
  if (!c) throw new Error('StoreProvider ausente');
  return c;
}

export function useBrand(id: string | undefined) {
  const { brands } = useStore();
  return brands.find((b) => b.id === id);
}
