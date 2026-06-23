import { Routes, Route, Navigate } from "react-router-dom";

/* -------- LAYOUTS -------- */
import AuthLayout from "./components/layout/AuthLayout.jsx";
import MainLayout from "./components/layout/MainLayout.jsx";

/* -------- AUTH -------- */
import Login from "./pages/Auth/Login.jsx";
import Signup from "./pages/Auth/Signup.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

/* -------- DASHBOARD -------- */
import Dashboard from "./pages/Dashboard/Dashboard.jsx";

/* -------- EQUIPMENT -------- */
import EquipmentList from "./pages/Equipment/EquipmentList/EquipmentList.jsx";
import EquipmentDetails from "./pages/Equipment/EquipmentDetails/EquipmentDetails.jsx";
import EquipmentForm from "./pages/Equipment/EquipmentForm/EquipmentForm.jsx";

/* -------- MAINTENANCE -------- */
import MaintenanceList from "./pages/Maintenance/MaintenanceList.jsx";
import MaintenanceForm from "./pages/Maintenance/MaintenanceForm.jsx";
import MaintenanceDetails from "./pages/Maintenance/MaintenanceDetails.jsx";

/* -------- WORKFLOWS -------- */
import KanbanBoard from "./pages/Kanban/KanbanBoard.jsx";
import MaintenanceCalendar from "./pages/Calendar/MaintenanceCalendar.jsx";

/* -------- TEAMS -------- */
import TeamList from "./pages/Teams/TeamList.jsx";
import TeamForm from "./pages/Teams/TeamForm.jsx";
import TeamDetails from "./pages/Teams/TeamDetails.jsx";

import Reports from "./pages/Reports/Reports.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      {/* ---------- PUBLIC ROUTES (AUTH LAYOUT) ---------- */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>

      {/* ---------- PROTECTED ROUTES (MAIN LAYOUT) ---------- */}
      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        {/* 1. Dashboard */}
        <Route path="/" element={<Dashboard />} />

        {/* 2. Equipment Management */}
        <Route path="/equipment" element={<EquipmentList />} />
        <Route path="/equipment/add" element={<EquipmentForm />} />
        <Route path="/equipment/:id" element={<EquipmentDetails />} />
        <Route path="/equipment/:id/edit" element={<EquipmentForm />} />

        {/* 3. Maintenance Management */}
        <Route path="/maintenance" element={<MaintenanceList />} />
        <Route path="/maintenance/new" element={<MaintenanceForm />} />
        <Route path="/maintenance/:id" element={<MaintenanceDetails />} />

        {/* 4. Visual Workflows */}
        <Route path="/kanban" element={<KanbanBoard />} />
        <Route path="/calendar" element={<MaintenanceCalendar />} />

        {/* Teams Management */}
        <Route path="/teams/new" element={<TeamForm />} />
        <Route path="/teams" element={<TeamList />} />
        <Route path="/teams/:id" element={<TeamDetails />} />

        {/* Reports & Analytics */}
        <Route path="/reports" element={<Reports />} />
      </Route>

      {/* ---------- FALLBACK ---------- */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}