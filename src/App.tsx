import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ClerkProvider } from "@clerk/react";
import LandingPage from "./pages/LandingPage";
import Auth from "./pages/Auth";
import SignUpPage from "./pages/SignUp";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Generator from "./pages/Generator";
import Templates from "./pages/Templates";
import DesignSystemBuilder from "./pages/DesignSystemBuilder";
import MyDesigns from "./pages/MyDesigns";
import History from "./pages/History";
import AdminPanel from "./pages/AdminPanel";
import Pricing from "./pages/Pricing";
import ImageToDesign from "./pages/ImageToDesign";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <ClerkProvider publishableKey={publishableKey}>
          <BrowserRouter>
            <AuthProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/auth/signup" element={<SignUpPage />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/generator" element={<ProtectedRoute><Generator /></ProtectedRoute>} />
                  <Route path="/templates" element={<ProtectedRoute><Templates /></ProtectedRoute>} />
                  <Route path="/design-system" element={<ProtectedRoute><DesignSystemBuilder /></ProtectedRoute>} />
                  <Route path="/my-designs" element={<ProtectedRoute><MyDesigns /></ProtectedRoute>} />
                  <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
                  <Route path="/image-to-design" element={<ProtectedRoute><ImageToDesign /></ProtectedRoute>} />
                  <Route path="/pricing" element={<ProtectedRoute><Pricing /></ProtectedRoute>} />
                  <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </TooltipProvider>
            </AuthProvider>
          </BrowserRouter>
        </ClerkProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
