import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useMedicineNotifications } from "@/hooks/useMedicineNotifications";
import AppLayout from "./components/AppLayout";
import HomePage from "./pages/HomePage";
import PrescriptionsPage from "./pages/PrescriptionsPage";
import MediLockerPage from "./pages/MediLockerPage";
import MealsPage from "./pages/MealsPage";
import InstallPage from "./pages/InstallPage";
import AppointmentPage from "./pages/AppointmentPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppInner() {
  useMedicineNotifications();
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/prescriptions" element={<PrescriptionsPage />} />
          <Route path="/medilocker" element={<MediLockerPage />} />
          <Route path="/meals" element={<MealsPage />} />
          <Route path="/appointment" element={<AppointmentPage />} />
          <Route path="/install" element={<InstallPage />} />
        </Route>
        <Route path="*" element={<NotFound />} />
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