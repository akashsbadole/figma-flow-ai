import { Suspense, lazy } from 'react';
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
import { Loader2 } from "lucide-react";

const LandingPage = lazy(() => import("./pages/LandingPage"));
const Auth = lazy(() => import("./pages/Auth"));
const SignUpPage = lazy(() => import("./pages/SignUp"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ForgotUsername = lazy(() => import("./pages/ForgotUsername"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Generator = lazy(() => import("./pages/Generator"));
const Templates = lazy(() => import("./pages/Templates"));
const DesignSystemBuilder = lazy(() => import("./pages/DesignSystemBuilder"));
const MyDesigns = lazy(() => import("./pages/MyDesigns"));
const History = lazy(() => import("./pages/History"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const Pricing = lazy(() => import("./pages/Pricing"));
const ImageToDesign = lazy(() => import("./pages/ImageToDesign"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

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
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/auth/signup" element={<SignUpPage />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/forgot-username" element={<ForgotUsername />} />
                    <Route path="/verify-email" element={<VerifyEmail />} />
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
                </Suspense>
              </TooltipProvider>
            </AuthProvider>
          </BrowserRouter>
        </ClerkProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
