
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { validateEnvironment } from "@/utils/security";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import LoginJTVox from "@/pages/LoginJTVox";
import DashboardModern from "@/pages/DashboardModern";
import MasterPanel from "@/pages/MasterPanelSimple";
import TenantAdminPanel from "@/pages/TenantAdminPanel";
import ClientsModern from "@/pages/ClientsModern";
import ClientDetail from "@/pages/ClientDetail";
import LeadsModern from "@/pages/LeadsModern";
import LeadDetail from "@/pages/LeadDetail";
import Contracts from "@/pages/Contracts";
import Proposals from "@/pages/Proposals";
import Tasks from "@/pages/Tasks";
import Pipelines from "@/pages/Pipelines";
import Telephony from "@/pages/Telephony";
import Chatbot from "@/pages/Chatbot";
import Automation from "@/pages/Automation";
import SmartbotPage from "@/pages/Smartbot";
import NotFound from "@/pages/NotFound";
import JTVoxAnalytics from "@/pages/JTVoxAnalytics";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";

const queryClient = new QueryClient();

// Validate environment variables on app startup
try {
  validateEnvironment();
} catch (error) {
  console.error('Environment validation failed:', error);
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginJTVox />} />
              <Route path="/" element={<Navigate to="/login" replace />} />
              
              {/* Rota Master - Admin Master JT Telecom */}
              <Route path="/master" element={
                <ProtectedRoute requiredLevel="master">
                  <MasterPanel />
                </ProtectedRoute>
              } />
              
              {/* Rota Admin - Admin da Tenant */}
              <Route path="/admin" element={
                <ProtectedRoute requiredLevel="admin">
                  <TenantAdminPanel />
                </ProtectedRoute>
              } />
              
              {/* Rota Admin Dashboard - Admin da Tenant com acesso ao CRM */}
              <Route path="/admin/dashboard" element={
                <ProtectedRoute requiredLevel="admin">
                  <Layout>
                    <DashboardModern />
                  </Layout>
                </ProtectedRoute>
              } />
              
              {/* JT VOX Analytics - Nova rota */}
              <Route path="/analytics" element={
                <ProtectedRoute>
                  <Layout>
                    <JTVoxAnalytics />
                  </Layout>
                </ProtectedRoute>
              } />
              
              {/* Rotas do CRM - Usuários finais */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Layout>
                    <DashboardModern />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/clients" element={
                <ProtectedRoute>
                  <Layout>
                    <ClientsModern />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/clients/:id" element={
                <ProtectedRoute>
                  <Layout>
                    <ClientDetail />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/leads" element={
                <ProtectedRoute>
                  <Layout>
                    <LeadsModern />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/leads/:id" element={
                <ProtectedRoute>
                  <Layout>
                    <LeadDetail />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/contracts" element={
                <ProtectedRoute>
                  <Layout>
                    <Contracts />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/proposals" element={
                <ProtectedRoute>
                  <Layout>
                    <Proposals />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/tasks" element={
                <ProtectedRoute>
                  <Layout>
                    <Tasks />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/pipelines" element={
                <ProtectedRoute>
                  <Layout>
                    <Pipelines />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/telephony" element={
                <ProtectedRoute>
                  <Layout>
                    <Telephony />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/chatbot" element={
                <ProtectedRoute>
                  <Layout>
                    <Chatbot />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/automation" element={
                <ProtectedRoute>
                  <Layout>
                    <Automation />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/smartbot" element={
                <ProtectedRoute>
                  <Layout>
                    <SmartbotPage />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/reports" element={
                <ProtectedRoute>
                  <Layout>
                    <Reports />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Layout>
                    <Settings />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
  </QueryClientProvider>
);

export default App;
