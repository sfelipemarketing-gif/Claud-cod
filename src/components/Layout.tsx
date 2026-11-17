import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FilePlus2, BadgePercent, Images, History, Settings, LogOut, Menu, X, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { BRAND } from '../config/brand';
import { GuaporeMark } from './ui';

const NAV = [
  { to: '/app', label: 'Visão geral', icon: LayoutDashboard, end: true },
  { to: '/app/informativo', label: 'Criar informativo', icon: FilePlus2 },
  { to: '/app/promocoes', label: 'Promoções internas', icon: BadgePercent },
  { to: '/app/blindex', label: 'Materiais Blindex', icon: null, blindex: true },
  { to: '/app/biblioteca', label: 'Biblioteca de imagens', icon: Images },
  { to: '/app/historico', label: 'Histórico de materiais', icon: History },
  { to: '/app/configuracoes', label: 'Configurações', icon: Settings },
];

function BlindexDot() {
  return <img src={BRAND.assets.blindexLogo} alt="" className="w-[18px] h-[18px] rounded-[3px]" />;
}

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { user, logout, isAdmin } = useAuth();
  const nav = useNavigate();
  return (
    <div className="h-full flex flex-col bg-navy text-white">
      <div className="px-5 pt-6 pb-5 flex items-center gap-3">
        <GuaporeMark className="w-11 h-11 ring-1 ring-white/10" />
        <div className="leading-tight">
          <div className="font-display font-extrabold text-[15px] tracking-tight">Guaporé Studio</div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-white/60 tracking-[.12em] uppercase">
            <Sparkles className="w-3 h-3" /> IA · Protótipo
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl px-3 h-11 text-[14px] font-medium transition ${
                isActive ? 'bg-white text-navy shadow-[0_8px_20px_-10px_rgba(0,0,0,.5)]' : 'text-white/75 hover:bg-white/[.07] hover:text-white'
              }`
            }
          >
            {n.icon ? <n.icon className="w-[18px] h-[18px]" /> : <BlindexDot />}
            <span className="flex-1">{n.label}</span>
            {n.blindex ? <span className="text-[10px] font-bold tracking-wider rounded px-1.5 py-0.5 bg-bred text-white">NOVO</span> : null}
          </NavLink>
        ))}
      </nav>
      <div className="m-3 rounded-2xl bg-white/[.06] p-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center font-bold text-sm">{user?.name.charAt(0)}</div>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-semibold truncate">{user?.name}</div>
            <div className="text-[11.5px] text-white/60 flex items-center gap-1">
              {isAdmin ? <ShieldCheck className="w-3 h-3" /> : null}
              {isAdmin ? 'Administrador' : 'Colaborador'}
            </div>
          </div>
          <button onClick={() => { logout(); nav('/login'); }} className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10" title="Sair">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="px-5 pb-4 text-[10.5px] text-white/40 leading-snug">© {BRAND.company} · {BRAND.city}<br />Versão demonstrativa</div>
    </div>
  );
}

export function Layout() {
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  useEffect(() => { setOpen(false); window.scrollTo(0, 0); }, [loc.pathname]);
  return (
    <div className="min-h-screen bg-surface lg:pl-[272px]">
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-[272px] z-30"><Sidebar /></aside>

      <header className="lg:hidden sticky top-0 z-30 bg-navy text-white flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2.5">
          <GuaporeMark className="w-8 h-8" />
          <span className="font-display font-extrabold text-[15px]">Guaporé Studio IA</span>
        </div>
        <button onClick={() => setOpen(true)} className="p-2 -mr-2 rounded-lg hover:bg-white/10" aria-label="Abrir menu"><Menu className="w-6 h-6" /></button>
      </header>

      {open ? (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[84%] max-w-[300px] animate-fade-up">
            <Sidebar onNavigate={() => setOpen(false)} />
            <button onClick={() => setOpen(false)} className="absolute top-4 -right-12 p-2 rounded-full bg-white text-navy" aria-label="Fechar menu"><X className="w-5 h-5" /></button>
          </div>
        </div>
      ) : null}

      <main className="px-4 sm:px-6 lg:px-10 py-6 sm:py-8 lg:py-10 max-w-[1440px] mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
