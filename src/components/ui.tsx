import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { CheckCircle2, Info, X, AlertTriangle } from 'lucide-react';
import { BRAND } from '../config/brand';

/* ───────── Toasts ───────── */
type Toast = { id: number; kind: 'success' | 'info' | 'error'; text: string };
const ToastCtx = createContext<(t: Omit<Toast, 'id'>) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [list, setList] = useState<Toast[]>([]);
  const push = useCallback((t: Omit<Toast, 'id'>) => {
    const id = Date.now() + Math.random();
    setList((l) => [...l, { ...t, id }]);
    setTimeout(() => setList((l) => l.filter((x) => x.id !== id)), 4200);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="fixed z-[100] bottom-24 lg:bottom-4 left-1/2 -translate-x-1/2 flex flex-col gap-2 w-[min(92vw,420px)] pointer-events-none">
        {list.map((t) => (
          <div key={t.id} className="pointer-events-auto animate-fade-up flex items-start gap-3 rounded-xl bg-ink text-white px-4 py-3 shadow-lift text-sm">
            {t.kind === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> : t.kind === 'error' ? <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" /> : <Info className="w-5 h-5 text-sky-300 shrink-0" />}
            <span className="leading-snug">{t.text}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/* ───────── Modal ───────── */
export function Modal({ open, onClose, title, subtitle, children, wide, footer }: { open: boolean; onClose: () => void; title: ReactNode; subtitle?: ReactNode; children: ReactNode; wide?: boolean; footer?: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', h); document.body.style.overflow = prev; };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div className="absolute inset-0 bg-navy-950/45 backdrop-blur-[2px]" onClick={onClose} />
      <div className={`relative bg-white w-full ${wide ? 'sm:max-w-5xl' : 'sm:max-w-lg'} max-h-[94vh] flex flex-col rounded-t-3xl sm:rounded-3xl shadow-lift animate-scale-in`}>
        <div className="flex items-start justify-between gap-4 px-5 sm:px-7 pt-5 sm:pt-6 pb-4 border-b border-line">
          <div>
            <h3 className="font-display font-bold text-lg text-ink">{title}</h3>
            {subtitle ? <p className="text-sm text-ink-mute mt-0.5">{subtitle}</p> : null}
          </div>
          <button onClick={onClose} className="btn-ghost btn-sm -mr-2 !px-2" aria-label="Fechar"><X className="w-5 h-5" /></button>
        </div>
        <div className="overflow-y-auto scrollbar-thin px-5 sm:px-7 py-5">{children}</div>
        {footer ? <div className="px-5 sm:px-7 py-4 border-t border-line flex flex-wrap justify-end gap-2">{footer}</div> : null}
      </div>
    </div>
  );
}

/* ───────── Form bits ───────── */
export function Toggle({ checked, onChange, label, hint, disabled }: { checked: boolean; onChange: (v: boolean) => void; label?: ReactNode; hint?: ReactNode; disabled?: boolean }) {
  return (
    <label className={`flex items-center gap-3 ${disabled ? 'opacity-50' : 'cursor-pointer'} select-none`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-6 rounded-full transition-colors shrink-0 ${checked ? 'bg-navy' : 'bg-line'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : ''}`} />
      </button>
      {label ? (
        <span className="min-w-0">
          <span className="block text-sm font-medium text-ink">{label}</span>
          {hint ? <span className="block text-xs text-ink-mute">{hint}</span> : null}
        </span>
      ) : null}
    </label>
  );
}

export function Field({ label, hint, children, toggle, className = '' }: { label: ReactNode; hint?: ReactNode; children: ReactNode; toggle?: { checked: boolean; onChange: (v: boolean) => void }; className?: string }) {
  const off = toggle && !toggle.checked;
  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-[13px] font-semibold text-ink-soft">{label}</span>
        {toggle ? (
          <button type="button" onClick={() => toggle.onChange(!toggle.checked)} className={`text-[11.5px] font-semibold rounded-full px-2 py-0.5 transition ${toggle.checked ? 'bg-navy-50 text-navy' : 'bg-surface text-ink-mute line-through'}`} title={toggle.checked ? 'Exibido na arte — clique para ocultar' : 'Oculto na arte — clique para exibir'}>
            {toggle.checked ? 'Exibir na arte' : 'Oculto'}
          </button>
        ) : null}
      </div>
      <div className={off ? 'opacity-45' : ''}>{children}</div>
      {hint ? <p className="text-xs text-ink-mute mt-1.5">{hint}</p> : null}
    </div>
  );
}

export function Segmented<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: ReactNode; hint?: string }[] }) {
  return (
    <div className="grid gap-1.5 p-1 bg-surface rounded-xl border border-line" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0,1fr))` }}>
      {options.map((o) => (
        <button key={o.value} type="button" onClick={() => onChange(o.value)} className={`rounded-lg px-2 py-2 text-[13px] font-semibold transition ${value === o.value ? 'bg-white text-navy shadow-card' : 'text-ink-mute hover:text-ink'}`}>
          {o.label}
          {o.hint ? <span className="block text-[10.5px] font-medium opacity-70 mt-0.5">{o.hint}</span> : null}
        </button>
      ))}
    </div>
  );
}

export function Badge({ tone = 'navy', children }: { tone?: 'navy' | 'red' | 'gray' | 'amber' | 'green'; children: ReactNode }) {
  const map = {
    navy: 'bg-navy-50 text-navy',
    red: 'bg-bred-50 text-bred-700',
    gray: 'bg-surface text-ink-mute border border-line',
    amber: 'bg-amber-50 text-amber-800 border border-amber-200',
    green: 'bg-emerald-50 text-emerald-700',
  };
  return <span className={`chip ${map[tone]}`}>{children}</span>;
}

export function PageHeader({ title, subtitle, actions, eyebrow }: { title: ReactNode; subtitle?: ReactNode; actions?: ReactNode; eyebrow?: ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8 animate-fade-up">
      <div>
        {eyebrow ? <div className="text-[12px] font-bold tracking-[.14em] uppercase text-navy/70 mb-1.5">{eyebrow}</div> : null}
        <h1 className="section-title">{title}</h1>
        {subtitle ? <p className="text-ink-mute mt-1.5 max-w-2xl text-[15px]">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function DemoNotice({ children, tone = 'amber' }: { children: ReactNode; tone?: 'amber' | 'navy' }) {
  return (
    <div className={`flex gap-3 rounded-xl px-4 py-3 text-[13px] leading-relaxed ${tone === 'amber' ? 'bg-amber-50 text-amber-900 border border-amber-200' : 'bg-navy-50 text-navy border border-navy-100'}`}>
      <Info className="w-4 h-4 mt-0.5 shrink-0" />
      <div>{children}</div>
    </div>
  );
}

export function EmptyState({ icon, title, text, action }: { icon: ReactNode; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="card p-10 text-center flex flex-col items-center">
      <div className="w-14 h-14 rounded-2xl bg-navy-50 text-navy flex items-center justify-center mb-4">{icon}</div>
      <h3 className="font-display font-bold text-lg">{title}</h3>
      <p className="text-ink-mute text-sm mt-1 max-w-sm">{text}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function GuaporeMark({ className = 'w-10 h-10' }: { className?: string }) {
  return <img src={BRAND.assets.guaporeSquare} alt="Guaporé Vidros" className={`${className} rounded-xl object-cover`} />;
}

export function useDebounced<T>(value: T, ms = 250): T {
  const [v, setV] = useState(value);
  const t = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    clearTimeout(t.current);
    t.current = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t.current);
  }, [value, ms]);
  return v;
}
