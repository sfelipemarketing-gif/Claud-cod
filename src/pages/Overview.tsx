import { Link, useNavigate } from 'react-router-dom';
import { FilePlus2, BadgePercent, Images, ArrowRight, Sparkles, PenLine, ImageIcon, Share2, LayoutTemplate, PlayCircle, Clock } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { useStore } from '../lib/store';
import { BRAND, FORMATS } from '../config/brand';
import { getTemplate } from '../art/registry';
import { formatDateTime } from '../lib/format';
import { EmptyState } from '../components/ui';

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
}

export default function Overview() {
  const { user, isAdmin } = useAuth();
  const { history, settings } = useStore();
  const nav = useNavigate();
  const recent = history.slice(0, 6);

  const quick = [
    { to: '/app/informativo', title: 'Novo informativo', text: 'Preço e informações de produto em uma arte pronta.', icon: FilePlus2, tone: 'navy' },
    { to: '/app/promocoes', title: 'Criar promoção', text: 'Ofertas e campanhas com desconto calculado.', icon: BadgePercent, tone: 'navy' },
    { to: '/app/blindex', title: 'Materiais Blindex', text: 'Modelos com a identidade Blindex em destaque.', icon: null, tone: 'red' },
    { to: '/app/biblioteca', title: 'Biblioteca visual', text: 'Imagens, marcas e referências para as artes.', icon: Images, tone: 'navy' },
  ];

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-navy text-white p-6 sm:p-10 animate-fade-up">
        <div className="absolute inset-0 opacity-[.06]" style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '36px 36px' }} />
        <div className="absolute -right-24 -top-24 w-[420px] h-[420px] rounded-full bg-white/[.06]" />
        <img src={BRAND.assets.guaporeMarkWhite} alt="" className="absolute right-8 sm:right-14 bottom-0 h-[78%] opacity-[.07] hidden sm:block" />
        <div className="relative max-w-2xl">
          <div className="text-white/70 font-medium">{greeting()}, {user?.name.split(' ')[0]} 👋</div>
          <h1 className="font-display font-extrabold text-[30px] sm:text-[42px] leading-[1.05] tracking-tight mt-2">Crie materiais profissionais em poucos segundos.</h1>
          <p className="text-white/70 mt-3 text-[15px] sm:text-base">Informe o produto e o valor, confirme a imagem e baixe ou compartilhe a arte — com a identidade da {settings.companyName}.</p>
          <div className="flex flex-wrap gap-3 mt-6">
            <button className="btn bg-white text-navy hover:bg-white/90 h-12 px-5" onClick={() => nav('/app/informativo')}><Sparkles className="w-4 h-4" /> Criar agora</button>
            <button className="btn h-12 px-5 border border-white/25 text-white hover:bg-white/10" onClick={() => nav('/app/blindex')}><img src={settings.blindexLogo} className="w-5 h-5 rounded-sm" alt="" /> Materiais Blindex</button>
          </div>
        </div>
      </section>

      {/* Acesso rápido */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {quick.map((q, i) => (
          <Link key={q.to} to={q.to} className="group card p-5 hover:shadow-lift hover:-translate-y-0.5 transition-all animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${q.tone === 'red' ? 'bg-bred-50' : 'bg-navy-50 text-navy'}`}>
              {q.icon ? <q.icon className="w-5 h-5" /> : <img src={settings.blindexLogo} alt="" className="w-7 h-7 rounded" />}
            </div>
            <div className="font-display font-bold text-[16px] mt-4 flex items-center gap-1.5">{q.title}<ArrowRight className="w-4 h-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition" /></div>
            <p className="text-[13.5px] text-ink-mute mt-1 leading-snug">{q.text}</p>
          </Link>
        ))}
      </section>

      <div className="grid xl:grid-cols-[1fr_380px] gap-6 items-start">
        {/* Recentes */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-lg">Últimos materiais criados</h2>
            {history.length ? <Link to="/app/historico" className="text-sm font-semibold text-navy hover:underline">Ver histórico</Link> : null}
          </div>
          {recent.length ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {recent.map((m) => (
                <Link key={m.id} to={`/app/historico?open=${m.id}`} className="card overflow-hidden group hover:shadow-lift transition">
                  <div className="aspect-square bg-surface flex items-center justify-center overflow-hidden">
                    {m.thumb ? <img src={m.thumb} alt="" className="max-w-full max-h-full object-contain group-hover:scale-[1.03] transition" /> : <LayoutTemplate className="w-8 h-8 text-ink-mute" />}
                  </div>
                  <div className="p-3">
                    <div className="text-[13.5px] font-semibold truncate">{m.name}</div>
                    <div className="text-[11.5px] text-ink-mute mt-0.5 truncate">{getTemplate(m.templateId).name} · {FORMATS[m.format].label}</div>
                    <div className="text-[11px] text-ink-mute mt-1 flex items-center gap-1"><Clock className="w-3 h-3" />{formatDateTime(m.updatedAt)}</div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState icon={<Sparkles className="w-6 h-6" />} title="Nenhum material criado ainda" text="Os materiais que você gerar aparecerão aqui para baixar, duplicar ou editar." action={<Link to="/app/informativo" className="btn-primary">Criar primeiro informativo</Link>} />
          )}
        </section>

        {/* Como funciona */}
        <aside className="space-y-4">
          <div className="card p-5">
            <h2 className="font-display font-bold text-lg">Como funciona</h2>
            <ol className="mt-4 space-y-4">
              {[
                { icon: LayoutTemplate, t: 'Escolha o modelo', d: 'Informativo, promoção, campanha ou Blindex.' },
                { icon: PenLine, t: 'Digite as informações', d: 'Produto, valor e textos — exiba só o que quiser.' },
                { icon: ImageIcon, t: 'Confirme a imagem', d: 'A biblioteca sugere a referência correspondente.' },
                { icon: Share2, t: 'Baixe ou compartilhe', d: 'PNG, JPG, PDF ou envio direto pelo celular.' },
              ].map((s, i) => (
                <li key={i} className="flex gap-3">
                  <div className="w-9 h-9 rounded-xl bg-navy-50 text-navy flex items-center justify-center shrink-0"><s.icon className="w-4 h-4" /></div>
                  <div><div className="text-[14px] font-semibold">{s.t}</div><div className="text-[13px] text-ink-mute">{s.d}</div></div>
                </li>
              ))}
            </ol>
          </div>
          {isAdmin ? (
            <div className="card p-5 border-navy/15">
              <div className="flex items-center gap-2"><PlayCircle className="w-5 h-5 text-navy" /><h2 className="font-display font-bold text-[16px]">Roteiro da demonstração</h2></div>
              <ol className="mt-3 space-y-2 text-[13px] text-ink-soft list-decimal pl-5">
                <li>Tela de login exclusiva</li>
                <li>Este painel</li>
                <li><Link className="text-navy font-semibold hover:underline" to="/app/informativo">Informativo</Link>: digite “Silicone” e um preço fictício</li>
                <li>Veja as opções da biblioteca; escolha a marca “Marca Demo A” e a imagem é identificada</li>
                <li>Clique em <b>Gerar informativo</b></li>
                <li><Link className="text-bred-700 font-semibold hover:underline" to="/app/blindex">Materiais Blindex</Link>: modelo Destaque Blindex</li>
                <li>Baixar PNG/PDF ou Compartilhar</li>
              </ol>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
