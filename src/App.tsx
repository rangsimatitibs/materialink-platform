import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import About from "./pages/About";
import Auth from "./pages/Auth";
import SignUp from "./pages/SignUp";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import WaitlistAdmin from "./pages/admin/WaitlistAdmin";
import CrudResourcePage from "./pages/admin/CrudResourcePage";
import PlatformDashboard from "./pages/app/PlatformDashboard";
import Search from "./pages/app/Search";
import MaterialProfile from "./pages/app/MaterialProfile";
import MyRequests from "./pages/app/MyRequests";
import ProducerDashboard from "./pages/app/ProducerDashboard";
import BookDemo from "./pages/BookDemo";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/demo" element={<BookDemo />} />

            <Route path="/app" element={<ProtectedRoute><PlatformDashboard /></ProtectedRoute>} />
            <Route path="/app/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
            <Route path="/app/materials/:slug" element={<ProtectedRoute><MaterialProfile /></ProtectedRoute>} />
            <Route path="/app/requests" element={<ProtectedRoute><MyRequests /></ProtectedRoute>} />
            <Route path="/app/producer" element={<ProtectedRoute><ProducerDashboard /></ProtectedRoute>} />

            <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminLayout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="waitlist" element={<WaitlistAdmin />} />
              <Route path=":resource" element={<CrudResourcePage />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
