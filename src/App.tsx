import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Onboarding from "./pages/Onboarding";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import WorkerDashboard from "./pages/WorkerDashboard";
import CompanyDashboard from "./pages/CompanyDashboard";
import GigFeed from "./pages/GigFeed";
import GigCheckIn from "./pages/GigCheckIn";
import Matches from "./pages/Matches";
import Profile from "./pages/Profile";
import WorkerPublicProfile from "./pages/WorkerPublicProfile";
import Training from "./pages/Training";
import TrainingFeed from "./pages/TrainingFeed";
import Wallet from "./pages/Wallet";
import AdminPanel from "./pages/AdminPanel";
import FinancialHistory from "./pages/FinancialHistory";
import CompanyWallet from "./pages/CompanyWallet";
import CompanyProfile from "./pages/CompanyProfile";
import CompanyGigFeed from "./pages/CompanyGigFeed";
import CreateFlink from "./pages/CreateFlink";
import VerificationSubscription from "./pages/VerificationSubscription";
import Schedule from "./pages/Schedule";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Onboarding />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={<ProtectedRoute allowedRoles={["worker"]}><WorkerDashboard /></ProtectedRoute>} />
            <Route path="/company-dashboard" element={<ProtectedRoute allowedRoles={["company"]}><CompanyDashboard /></ProtectedRoute>} />
            <Route path="/gigs" element={<ProtectedRoute allowedRoles={["worker"]}><GigFeed /></ProtectedRoute>} />
            <Route path="/company-gigs" element={<ProtectedRoute allowedRoles={["company"]}><CompanyGigFeed /></ProtectedRoute>} />
            <Route path="/company-flinks/new" element={<ProtectedRoute allowedRoles={["company"]}><CreateFlink /></ProtectedRoute>} />
            <Route path="/gig-checkin/:matchId" element={<ProtectedRoute><GigCheckIn /></ProtectedRoute>} />
            <Route path="/matches" element={<ProtectedRoute><Matches /></ProtectedRoute>} />
            <Route path="/chat" element={<Navigate to="/schedule" replace />} />
            <Route path="/profile" element={<ProtectedRoute allowedRoles={["worker"]}><Profile /></ProtectedRoute>} />
            <Route path="/worker/:id" element={<WorkerPublicProfile />} />
            <Route path="/training" element={<ProtectedRoute><Training /></ProtectedRoute>} />
            <Route path="/training/feed" element={<ProtectedRoute><TrainingFeed /></ProtectedRoute>} />
            <Route path="/wallet" element={<ProtectedRoute allowedRoles={["worker"]}><Wallet /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminPanel /></ProtectedRoute>} />
            <Route path="/financial-history" element={<ProtectedRoute><FinancialHistory /></ProtectedRoute>} />
            <Route path="/company-wallet" element={<ProtectedRoute allowedRoles={["company"]}><CompanyWallet /></ProtectedRoute>} />
            <Route path="/company-profile" element={<ProtectedRoute allowedRoles={["company"]}><CompanyProfile /></ProtectedRoute>} />
            <Route path="/verification" element={<ProtectedRoute><VerificationSubscription /></ProtectedRoute>} />
            <Route path="/schedule" element={<ProtectedRoute><Schedule /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
