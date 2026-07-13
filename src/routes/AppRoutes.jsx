import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import MainLayout from "../components/layout/MainLayout/MainLayout";

// Pages publiques
import LoginPage from "../pages/LoginPage/LoginPage";
import RegisterPage from "../pages/RegisterPage/RegisterPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage/ForgotPasswordPage";
import UnauthorizedPage from "../pages/UnauthorizedPage";

// Pages par module (à créer au fur et à mesure)
import DashboardPage from "../pages/dashboard/DashboardPage";
import EmployesPage from "../pages/employes/EmployesPage";
import CongesPage from "../pages/conges/CongesPage";
import PerformancePage from "../pages/performance/PerformancePage";
import RecrutementPage from "../pages/recrutement/RecrutementPage";
import FormationPage from "../pages/formation/FormationPage";
import DocumentsPage from "../pages/documents/DocumentsPage";
import CarrierePage from "../pages/carriere/CarrierePage";
import PortailSalariePage from "../pages/portail/PortailSalariePage";
import RapportsPage from "../pages/rapports/RapportsPage";
import NotificationsPage from "../pages/notifications/NotificationsPage";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirection racine */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        {/* Publiques */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/inscription" element={<RegisterPage />} />
        <Route path="/mot-de-passe-oublie" element={<ForgotPasswordPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Tableau de bord — Admin RH et Manager */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin_rh", "manager"]}>
              <MainLayout>
                <DashboardPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Employés — Admin RH uniquement (création/modif), Manager en lecture seule géré dans la page */}
        <Route
          path="/employes"
          element={
            <ProtectedRoute allowedRoles={["admin_rh", "manager"]}>
              <MainLayout>
                <EmployesPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Congés & Absences — tous sauf candidat */}
        <Route
          path="/conges"
          element={
            <ProtectedRoute allowedRoles={["admin_rh", "manager", "salarie"]}>
              <MainLayout>
                <CongesPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Performance & objectifs */}
        <Route
          path="/performance"
          element={
            <ProtectedRoute allowedRoles={["admin_rh", "manager", "salarie"]}>
              <MainLayout>
                <PerformancePage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Recrutement — Admin RH gère, Manager consulte, Candidat postule */}
        <Route
          path="/recrutement"
          element={
            <ProtectedRoute allowedRoles={["admin_rh", "manager", "candidat"]}>
              <MainLayout>
                <RecrutementPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Formation */}
        <Route
          path="/formation"
          element={
            <ProtectedRoute allowedRoles={["admin_rh", "manager", "salarie"]}>
              <MainLayout>
                <FormationPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Documents RH */}
        <Route
          path="/documents"
          element={
            <ProtectedRoute allowedRoles={["admin_rh", "manager", "salarie"]}>
              <MainLayout>
                <DocumentsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Carrière */}
        <Route
          path="/carriere"
          element={
            <ProtectedRoute allowedRoles={["admin_rh", "manager", "salarie"]}>
              <MainLayout>
                <CarrierePage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Portail salarié — Salarié uniquement */}
        <Route
          path="/portail"
          element={
            <ProtectedRoute allowedRoles={["salarie"]}>
              <MainLayout>
                <PortailSalariePage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Rapports — Admin RH uniquement */}
        <Route
          path="/rapports"
          element={
            <ProtectedRoute allowedRoles={["admin_rh"]}>
              <MainLayout>
                <RapportsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Notifications — tous les rôles connectés */}
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <MainLayout>
                <NotificationsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
