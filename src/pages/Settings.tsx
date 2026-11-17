import { useMemo, useRef, useState } from 'react';
import { Palette, LayoutTemplate, Users, Tags, Info, UserRound, Upload, RotateCcw, Plus, Trash2, ShieldCheck, Lock } from 'lucide-react';
import { Badge, DemoNotice, Modal, PageHeader, Toggle, useToast } from '../components/ui';
import { ArtPreview } from '../components/ArtPreview';
import { useStore, DEFAULT_SETTINGS, type Settings as S } from '../lib/store';
import { useAuth } from '../lib/auth';
import { buildCtx, DEFAULT_SHOW, EMPTY_FIELDS, TEMPLATES } from '../art/registry';
import { fileToDataUrl } from '../lib/export';
import { uid } from '../lib/format';
import type { Role, User } from '../lib/types';

type Tab = 'perfil' | 'identidade' | 'modelos' | 'usuarios' | 'marcas' | 'sobre';

export default function Settings() {
  const { isAdmin } = useAuth();
  const [tab, setTab] = useState<Tab>('perfil');
  const tabs: { id: Tab; label: string; icon: typeof Palette; admin?: boolean }[] = [
    { id: 'perfil', label: 'Perfil', icon: UserRound },
    { id: 'identidade', label: 'Identidade visual', icon: Palette, admin: true },
    { id: 'modelos', label: 'Modelos', icon: LayoutTemplate, admin: true },
    { id: 'usuarios', label: 'Usuários', icon: Users, admin: true },
    { id: 'marcas', label: 'Marcas e sinônimos', icon: Tags, admin: true },
    { id: 'sobre', label: 'Sobre o protótipo', icon: Info },
  ];
  return (
    <div>
      <PageHeader eyebrow={isAdmin ? 'Painel administrativo' : 'Configurações'} title="Configurações" subtitle={isAdmin ? 'Identidade visual, modelos, usuários e biblioteca — perfil administrador.' : 'Seu perfil e informações sobre a plataforma.'} />
      <div className="flex gap-1.5 overflow-x-auto scrollbar-thin pb-2 mb-6 -mx-1 px-1">
        {tabs.filter((t) => !t.admin || isAdmin).map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`shrink-0 inline-flex items-center gap-2 h-10 px-4 rounded-xl text-[13.5px] font-semibold transition ${tab === t.id ? 'bg-navy text-white shadow-card' : 'bg-white border border-line text-ink-soft hover:text-ink'}`}>
            <t.icon className="w-4 h-4" />{t.label}{t.admin ? <ShieldCheck className="w-3.5 h-3.5 opacity-60" /> : null}
          </button>
        ))}
      </div>
      {tab === 'perfil' && <Perfil />}
      {tab === 'identidade' && isAdmin && <Identidade />}
      {tab === 'modelos' && isAdmin && <Modelos />}
      {tab === 'usuarios' && isAdmin && <Usuarios />}
      {tab === 'marcas' && isAdmin && <Marcas />}
      {tab === 'sobre' && <Sobre />}
    </div>
  );
}

function Perfil() {
  const { user, isAdmin } = useAuth();
  const { clearAll, history } = useStore();
  const toast = useToast();
  return (
    <div className="grid lg:grid-cols-2 gap-5">
      <div className="card p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-navy text-white flex items-center justify-center text-xl font-bold">{user?.name.charAt(0)}</div>
          <div>
            <div className="font-display font-bold text-lg">{user?.name}</div>
            <div className="text-sm text-ink-mute">{user?.email}</div>
            <div className="mt-1"><Badge tone={isAdmin ? 'navy' : 'gray'}>{isAdmin ? 'Administrador' : 'Colaborador'}</Badge></div>
          </div>
        </div>
        <div className="mt-6 text-[13.5px] text-ink-soft space-y-1.5">
          <div className="font-semibold text-ink">Permissões deste perfil</div>
          {(isAdmin
            ? ['Painel completo', 'Gerenciamento da biblioteca', 'Configuração da identidade visual', 'Visualização dos modelos', 'Gerenciamento de usuários (simulado)']
            : ['Criação de informativos', 'Criação de promoções', 'Consulta ao histórico', 'Download e compartilhamento']
          ).map((p) => <div key={p} className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-navy" />{p}</div>)}
        </div>
      </div>
      <div className="card p-6">
        <div className="font-display font-bold">Dados locais deste navegador</div>
        <p className="text-sm text-ink-mute mt-1">{history.length} material(is) no histórico. Nenhum dado é enviado a servidores.</p>
        {isAdmin ? (
          <button className="btn-secondary mt-4 hover:!border-bred/40 hover:!text-bred-700" onClick={async () => { if (confirm('Apagar histórico, imagens enviadas, usuários e configurações deste navegador?')) { await clearAll(); toast({ kind: 'info', text: 'Dados locais restaurados ao padrão da demonstração.' }); } }}>
            <RotateCcw className="w-4 h-4" /> Restaurar demonstração
          </button>
        ) : <p className="text-xs text-ink-mute mt-4 flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> Somente o administrador pode restaurar os dados.</p>}
      </div>
    </div>
  );
}

function Identidade() {
  const { settings, updateSettings, brands } = useStore();
  const toast = useToast();
  const set = (p: Partial<S>) => updateSettings(p);
  const ctx = useMemo(() => buildCtx({ format: 'square', fields: { ...EMPTY_FIELDS, title: 'Informativo', productName: 'Vidro temperado 8 mm', price: '265,00', unit: 'm2', description: 'Exemplo de aplicação das cores e logotipos.' }, show: DEFAULT_SHOW, imageId: 'lib-chapa' }, './library/chapa.svg', brands, settings), [brands, settings]);
  const ctxB = useMemo(() => ({ ...ctx, isBlindex: true, brand: brands.find((b) => b.isBlindex), f: { ...ctx.f, productName: 'Box de banheiro', brandId: 'blindex' }, image: './library/box-frontal.svg' }), [ctx, brands]);

  const Color = ({ k, label, hint }: { k: 'navy' | 'blindexRed' | 'promoAccent'; label: string; hint: string }) => (
    <div className="flex items-center gap-3">
      <input type="color" value={settings[k]} onChange={(e) => set({ [k]: e.target.value } as Partial<S>)} className="w-12 h-12 rounded-xl border border-line cursor-pointer p-1 bg-white" />
      <div className="flex-1">
        <div className="text-sm font-semibold">{label}</div>
        <div className="text-xs text-ink-mute">{hint}</div>
      </div>
      <input className="input !w-28 !h-9 text-[13px] font-mono uppercase" value={settings[k]} onChange={(e) => /^#[0-9a-f]{0,6}$/i.test(e.target.value) && set({ [k]: e.target.value } as Partial<S>)} />
    </div>
  );

  const Logo = ({ k, label, dark }: { k: 'guaporeMarkWhite' | 'guaporeMarkNavy' | 'blindexLogo'; label: string; dark?: boolean }) => {
    const ref = useRef<HTMLInputElement>(null);
    return (
      <div className="flex items-center gap-3">
        <div className={`w-16 h-16 rounded-xl border border-line flex items-center justify-center p-2 ${dark ? 'bg-navy' : 'bg-surface'}`}><img src={settings[k]} alt="" className="max-w-full max-h-full object-contain" /></div>
        <div className="flex-1 min-w-0"><div className="text-sm font-semibold">{label}</div><div className="text-xs text-ink-mute truncate">{settings[k] === DEFAULT_SETTINGS[k] ? 'Arquivo fornecido' : 'Substituído localmente'}</div></div>
        <button className="btn-secondary btn-sm" onClick={() => ref.current?.click()}><Upload className="w-4 h-4" /> Trocar</button>
        {settings[k] !== DEFAULT_SETTINGS[k] ? <button className="btn-ghost btn-sm !px-2" title="Restaurar" onClick={() => set({ [k]: DEFAULT_SETTINGS[k] } as Partial<S>)}><RotateCcw className="w-4 h-4" /></button> : null}
        <input ref={ref} type="file" accept="image/png,image/svg+xml,image/jpeg,image/webp" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (f) { set({ [k]: await fileToDataUrl(f, 1200) } as Partial<S>); toast({ kind: 'success', text: 'Logotipo atualizado.' }); } }} />
      </div>
    );
  };

  return (
    <div className="grid xl:grid-cols-[1fr_520px] gap-5 items-start">
      <div className="space-y-5">
        <DemoNotice tone="navy">As cores abaixo foram <b>amostradas dos arquivos de logotipo fornecidos</b> (#072851 e #EE2E24). Substitua pelos códigos oficiais do manual de marca quando disponíveis — o sistema todo é atualizado automaticamente.</DemoNotice>
        <div className="card p-6 space-y-4">
          <div className="font-display font-bold">Cores</div>
          {Color({ k: "navy", label: "Azul institucional Guaporé", hint: "Interface, informativos e assinaturas" })}
          {Color({ k: "blindexRed", label: "Vermelho Blindex", hint: "Somente em destaques da marca Blindex" })}
          {Color({ k: "promoAccent", label: "Acento promocional", hint: "Selos de oferta em promoções não-Blindex (provisório)" })}
          <button className="btn-ghost btn-sm" onClick={() => set({ navy: DEFAULT_SETTINGS.navy, blindexRed: DEFAULT_SETTINGS.blindexRed, promoAccent: DEFAULT_SETTINGS.promoAccent })}><RotateCcw className="w-4 h-4" /> Restaurar cores</button>
        </div>
        <div className="card p-6 space-y-4">
          <div className="font-display font-bold">Logotipos</div>
          {Logo({ k: "guaporeMarkNavy", label: "Símbolo Guaporé (azul)" })}
          {Logo({ k: "guaporeMarkWhite", label: "Símbolo Guaporé (branco)", dark: true })}
          {Logo({ k: "blindexLogo", label: "Logotipo Blindex" })}
          <p className="text-xs text-ink-mute">Os símbolos sem fundo foram derivados do arquivo fornecido. O nome “Guaporé Vidros” nas artes é composto em texto (Montserrat) até o envio do logotipo completo oficial em vetor.</p>
        </div>
        <div className="card p-6 space-y-4">
          <div className="font-display font-bold">Informações nas artes</div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div><label className="label">Empresa</label><input className="input" value={settings.companyName} onChange={(e) => set({ companyName: e.target.value })} /></div>
            <div><label className="label">Cidade</label><input className="input" value={settings.city} onChange={(e) => set({ city: e.target.value })} /></div>
            <div><label className="label">Telefone / WhatsApp</label><input className="input" value={settings.phone} onChange={(e) => set({ phone: e.target.value })} placeholder="Informar número oficial" /></div>
            <div><label className="label">Site</label><input className="input" value={settings.website} onChange={(e) => set({ website: e.target.value })} /></div>
          </div>
          <Toggle checked={settings.demoWatermark} onChange={(v) => set({ demoWatermark: v })} label="Faixa “Material demonstrativo” nas artes" hint="Recomendado durante a apresentação, pois os preços e produtos são fictícios." />
        </div>
      </div>
      <div className="card p-5 xl:sticky xl:top-6 space-y-4">
        <div className="text-sm font-semibold text-ink-soft">Pré-visualização</div>
        <div className="grid grid-cols-2 gap-3">
          <ArtPreview ctx={ctx} templateId="informativo" format="square" />
          <ArtPreview ctx={ctxB} templateId="blindex" format="square" />
        </div>
      </div>
    </div>
  );
}

function Modelos() {
  const { brands, settings, library } = useStore();
  const [fmt, setFmt] = useState<'square' | 'story' | 'a4'>('square');
  const sample = (blindex: boolean, img: string) =>
    buildCtx({ format: fmt, fields: { ...EMPTY_FIELDS, title: blindex ? 'Produto Blindex®' : 'Informativo', campaignName: 'Semana do Box', productName: blindex ? 'Box de banheiro frontal' : 'Espelho lapidado', brandId: blindex ? 'blindex' : 'guapore', price: '1.290,00', oldPrice: '1.490,00', unit: 'un', description: 'Texto de exemplo para visualizar a composição do modelo.', highlights: 'Vidro temperado\nSob medida\nInstalação inclusa', notes: 'Valores fictícios.', validTo: new Date(Date.now() + 864e6).toISOString().slice(0, 10) }, show: DEFAULT_SHOW, imageId: img }, library.find((l) => l.id === img)?.image ?? null, brands, settings);
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <p className="text-sm text-ink-mute">{TEMPLATES.length} modelos disponíveis, cada um em 3 formatos. Composição programática (HTML/CSS) — textos e valores sempre corretos.</p>
        <select className="input !w-auto !h-10" value={fmt} onChange={(e) => setFmt(e.target.value as typeof fmt)}><option value="square">Quadrado 1080×1080</option><option value="story">Story 1080×1920</option><option value="a4">A4</option></select>
      </div>
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {TEMPLATES.map((t) => (
          <div key={t.id} className="card p-3">
            <ArtPreview ctx={sample(t.id === 'blindex', t.id === 'blindex' || t.id === 'vitrine' ? 'lib-box-frontal' : 'lib-espelho')} templateId={t.id} format={fmt} maxHeight={fmt === 'square' ? undefined : 420} />
            <div className="px-1 pt-3">
              <div className="flex items-center gap-2 font-display font-bold text-[15px]">{t.name}{t.id === 'blindex' ? <Badge tone="red">Blindex</Badge> : null}</div>
              <p className="text-[12.5px] text-ink-mute mt-0.5">{t.description}</p>
              <div className="flex flex-wrap gap-1 mt-2">{t.kinds.map((k) => <Badge key={k} tone="gray">{k}</Badge>)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Usuarios() {
  const { users, saveUsers } = useStore();
  const { user: me } = useAuth();
  const toast = useToast();
  const [adding, setAdding] = useState(false);
  const [nu, setNu] = useState<{ name: string; email: string; role: Role }>({ name: '', email: '', role: 'colaborador' });
  const update = (id: string, p: Partial<User>) => saveUsers(users.map((u) => (u.id === id ? { ...u, ...p } : u)));
  return (
    <div className="space-y-5">
      <DemoNotice><b>Gerenciamento simulado.</b> Os usuários ficam apenas neste navegador e as senhas não são protegidas. Na versão definitiva: autenticação no servidor, senhas com hash, convites por e-mail e permissões verificadas no backend.</DemoNotice>
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-line">
          <div className="font-display font-bold">Usuários ({users.length})</div>
          <button className="btn-primary btn-sm" onClick={() => setAdding(true)}><Plus className="w-4 h-4" /> Novo usuário</button>
        </div>
        <div className="divide-y divide-line">
          {users.map((u) => (
            <div key={u.id} className="flex flex-wrap items-center gap-3 p-4">
              <div className="w-10 h-10 rounded-full bg-navy-50 text-navy flex items-center justify-center font-bold">{u.name.charAt(0)}</div>
              <div className="flex-1 min-w-[180px]"><div className="font-semibold text-[14px]">{u.name}{u.id === me?.id ? <span className="text-ink-mute font-normal"> (você)</span> : null}</div><div className="text-[12.5px] text-ink-mute">{u.email}</div></div>
              <select className="input !w-auto !h-9 text-[13px]" value={u.role} disabled={u.id === me?.id} onChange={(e) => update(u.id, { role: e.target.value as Role })}><option value="admin">Administrador</option><option value="colaborador">Colaborador</option></select>
              <Toggle checked={u.active} disabled={u.id === me?.id} onChange={(v) => update(u.id, { active: v })} label={u.active ? 'Ativo' : 'Inativo'} />
              <button className="btn-ghost btn-sm !px-2 hover:!text-bred-700" disabled={u.id === me?.id || u.id.startsWith('u-')} title={u.id.startsWith('u-') ? 'Conta de demonstração' : 'Remover'} onClick={() => saveUsers(users.filter((x) => x.id !== u.id))}><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      </div>
      <Modal open={adding} onClose={() => setAdding(false)} title="Novo usuário (simulação)" footer={<><button className="btn-secondary" onClick={() => setAdding(false)}>Cancelar</button><button className="btn-primary" onClick={() => {
        if (!nu.name.trim() || !/^\S+@\S+$/.test(nu.email)) return toast({ kind: 'error', text: 'Informe nome e e-mail válidos.' });
        if (users.some((u) => u.email.toLowerCase() === nu.email.toLowerCase())) return toast({ kind: 'error', text: 'E-mail já cadastrado.' });
        saveUsers([...users, { id: uid('usr'), name: nu.name.trim(), email: nu.email.trim(), role: nu.role, password: 'demo123', active: true }]);
        setAdding(false); setNu({ name: '', email: '', role: 'colaborador' });
        toast({ kind: 'success', text: 'Usuário criado. Senha provisória: demo123' });
      }}>Criar</button></>}>
        <div className="space-y-3">
          <div><label className="label">Nome</label><input className="input" value={nu.name} onChange={(e) => setNu({ ...nu, name: e.target.value })} placeholder="Nome fictício" /></div>
          <div><label className="label">E-mail</label><input className="input" value={nu.email} onChange={(e) => setNu({ ...nu, email: e.target.value })} placeholder="nome@guapore.demo" /></div>
          <div><label className="label">Perfil</label><select className="input" value={nu.role} onChange={(e) => setNu({ ...nu, role: e.target.value as Role })}><option value="colaborador">Colaborador</option><option value="admin">Administrador</option></select></div>
          <p className="text-xs text-ink-mute">Senha provisória da demonstração: demo123</p>
        </div>
      </Modal>
    </div>
  );
}

function Marcas() {
  const { brands, saveBrands, synonyms, saveSynonyms } = useStore();
  const toast = useToast();
  const [name, setName] = useState('');
  const [syn, setSyn] = useState(synonyms.map((g) => g.join(', ')).join('\n'));
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});
  return (
    <div className="grid lg:grid-cols-2 gap-5 items-start">
      <div className="card p-6">
        <div className="font-display font-bold mb-4">Marcas visuais</div>
        <div className="space-y-3">
          {brands.map((b) => (
            <div key={b.id} className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl border border-line bg-surface flex items-center justify-center p-1.5">{b.logo ? <img src={b.logo} alt="" className="max-w-full max-h-full object-contain" /> : <span className="text-[10px] font-bold text-ink-mute">SEM LOGO</span>}</div>
              <div className="flex-1"><div className="text-sm font-semibold">{b.name}</div><div className="text-xs text-ink-mute">{b.isBlindex ? 'Usa modelos e regras Blindex' : b.fictitious ? 'Marca fictícia (demonstração)' : 'Marca'}</div></div>
              {!b.isBlindex && b.id !== 'guapore' ? (
                <>
                  <button className="btn-secondary btn-sm" onClick={() => fileRefs.current[b.id]?.click()}><Upload className="w-4 h-4" /> Logo</button>
                  <input ref={(el) => (fileRefs.current[b.id] = el)} type="file" accept="image/*" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (f) { const logo = await fileToDataUrl(f, 800); saveBrands(brands.map((x) => (x.id === b.id ? { ...x, logo } : x))); } }} />
                </>
              ) : <Badge tone={b.isBlindex ? 'red' : 'navy'}>Fixa</Badge>}
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-5">
          <input className="input" placeholder="Nova marca" value={name} onChange={(e) => setName(e.target.value)} />
          <button className="btn-primary" onClick={() => { if (!name.trim()) return; saveBrands([...brands, { id: uid('brand'), name: name.trim() }]); setName(''); toast({ kind: 'success', text: 'Marca adicionada.' }); }}><Plus className="w-4 h-4" /></button>
        </div>
      </div>
      <div className="card p-6">
        <div className="font-display font-bold">Sinônimos da busca</div>
        <p className="text-sm text-ink-mute mt-1 mb-3">Um grupo por linha, termos separados por vírgula. Ex.: “sacada” encontra “guarda-corpo”.</p>
        <textarea className="input font-mono text-[13px]" rows={12} value={syn} onChange={(e) => setSyn(e.target.value)} />
        <button className="btn-primary mt-3" onClick={() => { saveSynonyms(syn.split('\n').map((l) => l.split(',').map((x) => x.trim().toLowerCase()).filter(Boolean)).filter((g) => g.length > 1)); toast({ kind: 'success', text: 'Sinônimos salvos.' }); }}>Salvar sinônimos</button>
      </div>
    </div>
  );
}

function Sobre() {
  const real = ['Login com perfis Administrador e Colaborador (simulado no navegador)', 'Dashboard e navegação completa, responsiva', 'Gerador de informativos com campos opcionais e layout que se reorganiza', '7 modelos de arte × 3 formatos (1080×1080, 1080×1920, A4)', 'Busca na biblioteca por nome, marca, categoria, palavras-chave e sinônimos', 'Sugestão automática de imagem e de modelos Blindex', 'Cálculo automático de desconto', 'Exportação real em PNG, JPG e PDF', 'Compartilhamento nativo (Web Share API) com alternativas', 'Histórico com editar, duplicar e baixar (armazenamento local)', 'Upload de imagens e logotipos; importação de PDF com recorte e extração de texto', 'Sem dependência de serviços externos: fontes, logotipos e bibliotecas são locais'];
  const sim = ['Autenticação (sem servidor; não é segura)', 'Gerenciamento de usuários (somente local)', 'Armazenamento (navegador, não é banco de dados corporativo)', 'Preços, produtos e marcas “Demo A/B” (fictícios)', 'Imagens de produtos (ilustrações provisórias)'];
  const future = ['Autenticação no servidor, sessões seguras e senhas com hash', 'Banco de dados e armazenamento de arquivos centralizados', 'IA multimodal para identificar marcas e produtos em PDFs', 'Busca semântica e reconhecimento visual', 'Fluxo de aprovação de referências e de materiais', 'Registro de auditoria e relatórios de uso'];
  const Col = ({ title, items, tone }: { title: string; items: string[]; tone: string }) => (
    <div className="card p-6"><div className="font-display font-bold flex items-center gap-2"><span className={`w-2.5 h-2.5 rounded-full ${tone}`} />{title}</div><ul className="mt-3 space-y-2 text-[13.5px] text-ink-soft">{items.map((i) => <li key={i} className="flex gap-2"><span className="text-ink-mute">•</span>{i}</li>)}</ul></div>
  );
  return (
    <div className="grid lg:grid-cols-3 gap-5 items-start">
      <Col title="Implementado e funcional" items={real} tone="bg-emerald-500" />
      <Col title="Simulado nesta demonstração" items={sim} tone="bg-amber-500" />
      <Col title="Reservado para a versão definitiva" items={future} tone="bg-navy" />
    </div>
  );
}
