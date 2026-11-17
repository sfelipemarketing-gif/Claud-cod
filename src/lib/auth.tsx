/**
 * AUTENTICAÇÃO SIMULADA — APENAS PARA DEMONSTRAÇÃO.
 * Não é segura: credenciais ficam no navegador e não há servidor.
 * A versão de produção deve implementar autenticação no servidor, sessões seguras
 * (cookies HttpOnly), hash de senhas (ex.: Argon2/bcrypt) e controle de permissões no backend.
 */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useStore } from './store';
import type { User } from './types';

interface Auth {
  user: User | null;
  login: (email: string, password: string) => { ok: true } | { ok: false; error: string };
  logout: () => void;
  isAdmin: boolean;
}

const Ctx = createContext<Auth | null>(null);
const SESSION_KEY = 'gs:session';

export function AuthProvider({ children }: { children: ReactNode }) {
  const { users, ready } = useStore();
  const [userId, setUserId] = useState<string | null>(() => {
    try { return localStorage.getItem(SESSION_KEY); } catch { return null; }
  });
  const user = ready ? users.find((u) => u.id === userId && u.active) ?? null : null;

  useEffect(() => {
    try {
      if (userId) localStorage.setItem(SESSION_KEY, userId);
      else localStorage.removeItem(SESSION_KEY);
    } catch { /* armazenamento indisponível */ }
  }, [userId]);

  const login: Auth['login'] = (email, password) => {
    const e = email.trim().toLowerCase();
    const u = users.find((x) => x.email.toLowerCase() === e || x.name.toLowerCase() === e);
    if (!u || u.password !== password) return { ok: false, error: 'Usuário ou senha incorretos.' };
    if (!u.active) return { ok: false, error: 'Este acesso está desativado.' };
    setUserId(u.id);
    return { ok: true };
  };

  return (
    <Ctx.Provider value={{ user, login, logout: () => setUserId(null), isAdmin: user?.role === 'admin' }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error('AuthProvider ausente');
  return c;
}
