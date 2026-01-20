import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useStore } from "@/store/useStore";
import { useEffect } from "react";

// Pages
import Login from "./pages/Login";
import Home from "./pages/user/Home";
import MatchDetails from "./pages/user/MatchDetails";
import BetSlip from "./pages/user/BetSlip";
import LiveMatch from "./pages/user/LiveMatch";
import Wallet from "./pages/user/Wallet";
import Notifications from "./pages/user/Notifications";
import Settings from "./pages/user/Settings";

import Dashboard from "./pages/admin/Dashboard";
import UserManagement from "./pages/admin/UserManagement";
import MatchesManagement from "./pages/admin/MatchesManagement";
import TransactionManagement from "./pages/admin/TransactionManagement";
import Analytics from "./pages/admin/Analytics";
import SupportPortal from "./pages/admin/SupportPortal";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

/** ---------- Simple route guards ---------- **/
const RequireAuth = () => {
  const { session } = useStore();
  if (!session) return <Navigate to="/login" replace />;
  return <Outlet />;
};

const RequireRole = ({ role }: { role: "user" | "admin" }) => {
  const { session } = useStore();
  if (!session) return <Navigate to="/login" replace />;
  if (session.role !== role) {
    return <Navigate to={session.role === "admin" ? "/admin/dashboard" : "/user/home"} replace />;
  }
  return <Outlet />;
};

const AppContent = () => {
  const { session, theme } = useStore();

  useEffect(() => {
    if (theme === "light") document.documentElement.classList.add("light");
    else document.documentElement.classList.remove("light");
  }, [theme]);

  return (
    <Routes>
      {/* Public */}
      <Route
        path="/login"
        element={
          session ? (
            <Navigate to={session.role === "admin" ? "/admin/dashboard" : "/user/home"} replace />
          ) : (
            <Login />
          )
        }
      />

      {/* Everything below requires being logged in */}
      <Route element={<RequireAuth />}>
        {/* USER routes (role=user only) */}
        <Route element={<RequireRole role="user" />}>
          <Route path="/user/home" element={<Home />} />
          <Route path="/user/match/:id" element={<MatchDetails />} />
          <Route path="/user/slip" element={<BetSlip />} />
          <Route path="/user/live/:id" element={<LiveMatch />} />
          <Route path="/user/wallet" element={<Wallet />} />
          <Route path="/user/notifications" element={<Notifications />} />
          <Route path="/user/settings" element={<Settings />} />
        </Route>

        {/* ADMIN routes (role=admin only) */}
        <Route element={<RequireRole role="admin" />}>
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/matches" element={<MatchesManagement />} />
          <Route path="/admin/transactions" element={<TransactionManagement />} />
          <Route path="/admin/analytics" element={<Analytics />} />
          <Route path="/admin/support" element={<SupportPortal />} />
        </Route>
      </Route>

      {/* Redirect root */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
