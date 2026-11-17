import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { buildCtx, DEFAULT_SHOW, EMPTY_FIELDS } from '../art/registry';
import { BLINDEX_PRESETS, EXAMPLES } from '../data/presets';
import { useStore } from '../lib/store';
import { DemoNotice } from '../components/ui';
import { ArtPreview } from '../components/ArtPreview';

function MiniArt({ templateId, imageId, extra }: { templateId: string; imageId: string; extra?: Record<string, unknown> }) {
  const { brands, settings, library } = useStore();
  const ex = EXAMPLES.blindex[0].fields;
  const ctx = useMemo(() => {
    const item = library.find((l) => l.id === imageId);
    return buildCtx(
      { format: 'square', fields: { ...EMPTY_FIELDS, ...ex, brandId: 'blindex', ...(extra as object) }, show: { ...DEFAULT_SHOW, oldPrice: true, ...(templateId === 'vitrine' ? { price: false } : {}) }, imageId },
      item?.image ?? null,
      brands,
      { ...settings, demoWatermark: false },
    );
  }, [brands, settings, library, imageId, templateId, ex, extra]);
  return (
    <div className="rounded-xl overflow-hidden pointer-events-none">
      <ArtPreview bare ctx={ctx} templateId={templateId} format="square" />
    </div>
  );
}

const PREVIEW_IMG: Record<string, string> = { precos: 'lib-box-canto', divulgacao: 'lib-porta', comunicado: 'lib-janela', promocao: 'lib-box-frontal', vendedores: 'lib-guarda-corpo' };
const PREVIEW_EXTRA: Record<string, Record<string, string>> = {
  divulgacao: { productName: 'Porta pivotante', title: 'Conheça', description: 'Elegância e segurança na entrada do seu imóvel.' },
  comunicado: { title: 'Atualização da linha Blindex', productName: 'Janelas de vidro temperado', description: 'Informamos à equipe e aos clientes os novos prazos e condições para a linha de janelas.' },
  promocao: { title: 'Oferta Blindex', productName: 'Box frontal', oldPrice: '1.490,00', price: '1.290,00' },
  vendedores: { productName: 'Guarda-corpo de vidro', title: 'Ficha do produto' },
};

export default function BlindexHub() {
  const { library, settings } = useStore();
  const nav = useNavigate();
  const refs = library.filter((l) => l.brandId === 'blindex');

  return (
    <div className="space-y-8">
      {/* Hero co-branding */}
      <section className="relative overflow-hidden rounded-3xl text-white animate-fade-up" style={{ background: 'linear-gradient(120deg, rgb(var(--navy)) 0%, rgb(var(--navy-900)) 58%, rgb(var(--navy-950)) 100%)' }}>
        <svg className="absolute right-0 top-0 h-full w-[55%] opacity-90" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polygon points="62,0 78,0 100,22 100,38" fill="rgb(var(--bred))" />
          <polygon points="84,0 90,0 100,10 100,16" fill="rgb(var(--bred))" opacity=".5" />
        </svg>
        <div className="relative p-6 sm:p-10 flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
          <img src={settings.blindexLogo} alt="Blindex" className="w-24 h-24 sm:w-32 sm:h-32 shadow-2xl shrink-0" />
          <div className="max-w-2xl">
            <div className="text-[12px] font-bold tracking-[.18em] uppercase text-white/70">Área especial</div>
            <h1 className="font-display font-extrabold text-[30px] sm:text-[40px] leading-[1.05] tracking-tight mt-1">MATERIAIS BLINDEX</h1>
            <p className="text-white/75 mt-3">Modelos que dão destaque à marca Blindex nos produtos correspondentes, sempre com a assinatura institucional da {settings.companyName}.</p>
            <div className="flex flex-wrap gap-3 mt-5">
              <button className="btn-blindex h-12 px-5" onClick={() => nav('/app/blindex/criar?preset=precos')}><Sparkles className="w-4 h-4" /> Criar material Blindex</button>
            </div>
          </div>
        </div>
      </section>

      <DemoNotice tone="navy">
        <b>Regras de aplicação adotadas:</b> logotipo Blindex utilizado a partir do arquivo original, sem distorção ou recolorização; vermelho Blindex reservado aos destaques da marca; Guaporé apresentada como empresa que comercializa os produtos (não como fabricante). Imagens de produto são ilustrações provisórias até o envio de fotos oficiais/autorizadas.
      </DemoNotice>

      <section>
        <h2 className="font-display font-bold text-lg mb-4">Modelos disponíveis</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {BLINDEX_PRESETS.map((p, i) => (
            <button key={p.id} onClick={() => nav(`/app/blindex/criar?preset=${p.id}`)} className="group card p-3 text-left hover:shadow-lift hover:-translate-y-0.5 transition-all animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
              <MiniArt templateId={p.templateId} imageId={PREVIEW_IMG[p.id]} extra={PREVIEW_EXTRA[p.id]} />
              <div className="px-2 pt-3 pb-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-display font-bold text-[15.5px]">{p.name}</div>
                  <ArrowRight className="w-4 h-4 text-bred opacity-0 group-hover:opacity-100 transition" />
                </div>
                <p className="text-[13px] text-ink-mute mt-0.5">{p.description}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-lg">Referências Blindex na biblioteca</h2>
          <Link to="/app/biblioteca?brand=blindex" className="text-sm font-semibold text-navy hover:underline">Abrir biblioteca</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {refs.map((r) => (
            <button key={r.id} onClick={() => nav(`/app/blindex/criar?preset=precos&ref=${r.id}`)} className="card p-2 text-left hover:shadow-lift transition group">
              <div className="aspect-square rounded-lg bg-surface flex items-center justify-center"><img src={r.image} className="max-w-full max-h-full object-contain p-2" alt="" /></div>
              <div className="text-[12.5px] font-semibold mt-2 px-1 leading-tight">{r.name}</div>
              <div className="text-[11px] text-bred-700 font-semibold px-1 mt-1 flex items-center gap-1 pb-1"><ShieldCheck className="w-3 h-3" /> Usar no modelo Blindex</div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
