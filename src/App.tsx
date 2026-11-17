import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { StoreProvider, useStore } from './lib/store';
import { AuthProvider, useAuth } from './lib/auth';
import { ToastProvider } from './components/ui';
import { Layout } from './components/Layout';
import Login from './pages/Login';
import Overview from './pages/Overview';
import Editor from './pages/Editor';
import BlindexHub from './pages/BlindexHub';
import Library from './pages/Library';
import History from './pages/History';
import Settings from './pages/Settings';

function Guard({ children }: { children: ReactNode }) {
  const { ready } = useStore();
  const { user } = useAuth();
  const loc = useLocation();
  if (!ready) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 rounded-full border-4 border-navy/20 border-t-navy animate-spin" /></div>;
  if (!user) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  return <>{children}</>;
}

/** Usa a chave da URL para remontar o editor ao trocar de material. */
function EditorRoute({ kind }: { kind: 'informativo' | 'promocao' | 'blindex' }) {
  const loc = useLocation();
  return <Editor key={`${kind}${loc.search}`} kind={kind} />;
}

export default function App() {
  return (
    <StoreProvider>
      <AuthProvider>
        <ToastProvider>
          {/* HashRouter: funciona em qualquer hospedagem estática, sem configuração de servidor */}
          <HashRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/app" element={<Guard><Layout /></Guard>}>
                <Route index element={<Overview />} />
                <Route path="informativo" element={<EditorRoute kind="informativo" />} />
                <Route path="promocoes" element={<EditorRoute kind="promocao" />} />
                <Route path="blindex" element={<BlindexHub />} />
                <Route path="blindex/criar" element={<EditorRoute kind="blindex" />} />
                <Route path="biblioteca" element={<Library />} />
                <Route path="historico" element={<History />} />
                <Route path="configuracoes" element={<Settings />} />
              </Route>
              <Route path="*" element={<Navigate to="/app" replace />} />
            </Routes>
          </HashRouter>
        </ToastProvider>
      </AuthProvider>
    </StoreProvider>
  );
}
