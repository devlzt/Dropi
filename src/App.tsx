import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/app-shell";
import { LoadingState } from "@/components/loading-state";
import { useAuth } from "@/providers/auth-provider";
import { ChargesPage } from "@/pages/charges";
import { ClientsPage } from "@/pages/clients";
import { DashboardPage } from "@/pages/dashboard";
import { DelinquencyPage } from "@/pages/delinquency";
import { LandingPage } from "@/pages/landing";
import { LoginPage } from "@/pages/login";
import { MessagesPage } from "@/pages/messages";
import { SettingsPage } from "@/pages/settings";

function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingState fullScreen label="Carregando Dropi" />;
  if (!user) return <Navigate to="/login" replace />;
  return <AppShell />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingState fullScreen label="Carregando Dropi" />;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/clientes" element={<ClientsPage />} />
        <Route path="/cobrancas" element={<ChargesPage />} />
        <Route path="/inadimplencia" element={<DelinquencyPage />} />
        <Route path="/mensagens" element={<MessagesPage />} />
        <Route path="/configuracoes" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
