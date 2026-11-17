import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, UserRound, Info } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { BRAND } from '../config/brand';
import { DEMO_USERS } from '../lib/store';

export default function Login() {
  const { login, user } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/app" replace />;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    setTimeout(() => {
      const r = login(email, pass);
      setLoading(false);
      if (r.ok) nav('/app');
      else setErr(r.error);
    }, 450);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.08fr_1fr] bg-white">
      {/* Painel de marca */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-navy text-white p-12 xl:p-16">
        <div className="absolute inset-0 opacity-[.07]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.9) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.9) 1px,transparent 1px)', backgroundSize: '44px 44px' }} />
        <div className="absolute -right-40 -bottom-40 w-[620px] h-[620px] rounded-full bg-gradient-to-tr from-white/[.08] to-transparent" />
        <div className="absolute -right-24 top-16 w-[340px] h-[460px] rounded-[28px] border border-white/15 bg-gradient-to-br from-white/[.12] to-white/[.02] backdrop-blur-sm rotate-[8deg] shadow-2xl" />
        <div className="absolute right-6 top-48 w-[260px] h-[360px] rounded-[24px] border border-white/10 bg-gradient-to-br from-sky-200/[.10] to-transparent rotate-[-6deg]" />

        <div className="relative flex items-center gap-3">
          <img src={BRAND.assets.guaporeMarkWhite} alt="Guaporé" className="h-12 w-auto" />
          <div className="leading-tight">
            <div className="font-display font-extrabold text-xl">Guaporé Vidros</div>
            <div className="text-[12px] tracking-[.2em] uppercase text-white/60">{BRAND.city}</div>
          </div>
        </div>

        <div className="relative max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[12px] font-semibold tracking-wider uppercase mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Plataforma interna
          </div>
          <h1 className="font-display font-black text-[56px] xl:text-[64px] leading-[.98] tracking-tight">
            GUAPORÉ<br />STUDIO <span className="text-white/50">IA</span>
          </h1>
          <p className="mt-6 text-xl text-white/85 font-medium">{BRAND.tagline}</p>
          <p className="mt-3 text-white/60 leading-relaxed">Plataforma exclusiva de criação de materiais comerciais da Guaporé Vidros.</p>
        </div>

        <div className="relative flex items-center gap-4 text-[12.5px] text-white/50">
          <span>Informativos</span><span className="w-1 h-1 rounded-full bg-white/30" />
          <span>Promoções</span><span className="w-1 h-1 rounded-full bg-white/30" />
          <span className="inline-flex items-center gap-1.5"><img src={BRAND.assets.blindexLogo} className="w-4 h-4 rounded-sm" alt="" /> Materiais Blindex</span>
        </div>
      </div>

      {/* Formulário */}
      <div className="flex flex-col justify-center px-5 sm:px-10 py-10 lg:px-16">
        <div className="w-full max-w-[420px] mx-auto animate-fade-up">
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <img src={BRAND.assets.guaporeSquare} className="w-14 h-14 rounded-2xl" alt="Guaporé Vidros" />
            <div>
              <div className="font-display font-black text-[22px] text-navy leading-none">GUAPORÉ STUDIO IA</div>
              <div className="text-[13px] text-ink-mute mt-1">{BRAND.tagline}</div>
            </div>
          </div>

          <h2 className="font-display font-bold text-[28px] text-ink tracking-tight">Acesse sua conta</h2>
          <p className="text-ink-mute mt-1.5 flex items-center gap-1.5 text-[14px]"><Lock className="w-3.5 h-3.5" /> Acesso restrito a colaboradores autorizados.</p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div>
              <label className="label" htmlFor="email">Usuário ou e-mail</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-mute" />
                <input id="email" className="input pl-10 h-12" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu.email@guapore.demo" />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="pass">Senha</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-mute" />
                <input id="pass" className="input pl-10 pr-11 h-12" type={show ? 'text' : 'password'} autoComplete="current-password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="••••••••" />
                <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-ink-mute hover:text-navy" aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}>
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {err ? <div className="text-[13px] text-bred-700 bg-bred-50 rounded-lg px-3 py-2">{err}</div> : null}
            <button className="btn-primary w-full h-12 text-[15px]" disabled={loading || !email || !pass}>
              {loading ? 'Entrando…' : <>Entrar na plataforma <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="mt-8 rounded-2xl border border-dashed border-line p-4 bg-surface/60">
            <div className="text-[12px] font-bold tracking-[.12em] uppercase text-ink-mute mb-3">Perfis de demonstração</div>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_USERS.map((u) => (
                <button key={u.id} type="button" onClick={() => { setEmail(u.email); setPass(u.password); setErr(''); }} className="text-left rounded-xl border border-line bg-white px-3 py-2.5 hover:border-navy/40 hover:shadow-card transition">
                  <div className="flex items-center gap-1.5 text-[13px] font-semibold text-navy">
                    {u.role === 'admin' ? <ShieldCheck className="w-4 h-4" /> : <UserRound className="w-4 h-4" />}
                    {u.role === 'admin' ? 'Administrador' : 'Colaborador'}
                  </div>
                  <div className="text-[11.5px] text-ink-mute mt-0.5 truncate">{u.email}</div>
                </button>
              ))}
            </div>
            <p className="text-[11.5px] text-ink-mute mt-3 flex gap-1.5 leading-snug"><Info className="w-3.5 h-3.5 shrink-0 mt-0.5" /><span>Senha das contas fictícias: <b className="font-semibold text-ink-soft">demo123</b>. Autenticação simulada no navegador, apenas para demonstração — não é segura para uso corporativo real.</span></p>
          </div>
          <p className="text-center text-[12px] text-ink-mute mt-8">© {BRAND.company} · {BRAND.city}</p>
        </div>
      </div>
    </div>
  );
}
