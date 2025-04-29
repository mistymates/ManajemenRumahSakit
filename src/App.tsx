
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { EquipmentProvider } from "./contexts/EquipmentContext";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import EquipmentList from "./pages/EquipmentList";
import EquipmentDetail from "./pages/EquipmentDetail";
import AddEquipment from "./pages/AddEquipment";
import Categories from "./pages/Categories";
import Reports from "./pages/Reports";
import NewReport from "./pages/NewReport";
import Requests from "./pages/Requests";
import NewRequest from "./pages/NewRequest";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";

// Check if user is authenticated
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = sessionStorage.getItem('authenticated') === 'true';
  
  if (!isAuthenticated) {
    return <Login />;
  }
  
  return <>{children}</>;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <EquipmentProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/equipment" element={<ProtectedRoute><EquipmentList /></ProtectedRoute>} />
              <Route path="/equipment/add" element={<ProtectedRoute><AddEquipment /></ProtectedRoute>} />
              <Route path="/equipment/:id" element={<ProtectedRoute><EquipmentDetail /></ProtectedRoute>} />
              <Route path="/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
              <Route path="/reports/new" element={<ProtectedRoute><NewReport /></ProtectedRoute>} />
              <Route path="/requests" element={<ProtectedRoute><Requests /></ProtectedRoute>} />
              <Route path="/requests/new" element={<ProtectedRoute><NewRequest /></ProtectedRoute>} />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </EquipmentProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
