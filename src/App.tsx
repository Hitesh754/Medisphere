import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useMedicineNotifications } from "@/hooks/useMedicineNotifications";
import { observeAuthState, type User } from "@/auth";
import AppLayout from "./components/AppLayout";
import HomePage from "./pages/HomePage";
import PrescriptionsPage from "./pages/PrescriptionsPage";
import MediLockerPage from "./pages/MediLockerPage";
import MealsPage from "./pages/MealsPage";
import InstallPage from "./pages/InstallPage";
import AppointmentPage from "./pages/AppointmentPage";
import NotFound from "./pages/NotFound";
import SignInPage from "./pages/SignInPage.tsx";
import SignUpPage from "./pages/SignUpPage.tsx";

const queryClient = new QueryClient();

function AuthenticatedLayout() {
  useMedicineNotifications();

  return <AppLayout />;
}

function AppInner() {
  const [user, setUser] = useState<User | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = observeAuthState((nextUser) => {
      setUser(nextUser);
      setIsCheckingAuth(false);
    });

    return unsubscribe;
  }, []);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">
        Checking session...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/signin"
          element={user ? <Navigate to="/" replace /> : <SignInPage />}
        />
        <Route
          path="/signup"
          element={user ? <Navigate to="/" replace /> : <SignUpPage />}
        />

        <Route element={user ? <AuthenticatedLayout /> : <Navigate to="/signin" replace />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/prescriptions" element={<PrescriptionsPage />} />
          <Route path="/medilocker" element={<MediLockerPage />} />
          <Route path="/meals" element={<MealsPage />} />
          <Route path="/appointment" element={<AppointmentPage />} />
          <Route path="/install" element={<InstallPage />} />
        </Route>
        <Route path="*" element={user ? <NotFound /> : <Navigate to="/signin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppInner />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;