import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { CookieConsentProvider } from "@/hooks/useCookieConsent";
import { CookieBanner } from "@/components/cookies/CookieBanner";
import { CookieSettings } from "@/components/cookies/CookieSettings";
import { AnalyticsInitializer } from "@/components/cookies/AnalyticsInitializer";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import LeadsMarketplace from "@/pages/LeadsMarketplace";
import MyLeads from "@/pages/MyLeads";
import Credits from "@/pages/Credits";
import AdminPanel from "@/pages/AdminPanel";
import ManageLeads from "@/pages/ManageLeads";
import Integrations from "@/pages/Integrations";
import TestImport from "@/pages/TestImport";
import EditProfile from "@/pages/EditProfile";
import PublicLeads from "@/pages/PublicLeads";
import PrivacyPolicy from "@/pages/PrivacyPolicy";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading during auth check
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Public routes - always accessible */}
      <Route path="/leads-publicos" component={PublicLeads} />
      <Route path="/public-leads" component={PublicLeads} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/login" component={Login} />
      
      {/* Authenticated routes */}
      {isAuthenticated ? (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/leads" component={LeadsMarketplace} />
          <Route path="/my-leads" component={MyLeads} />
          <Route path="/credits" component={Credits} />
          <Route path="/admin" component={AdminPanel} />
          <Route path="/admin/manage-leads" component={ManageLeads} />
          <Route path="/admin/test-import" component={TestImport} />
          <Route path="/integrations" component={Integrations} />
          <Route path="/profile/edit" component={EditProfile} />
        </>
      ) : (
        <>
          <Route path="/" component={PublicLeads} />
          <Route path="/leads" component={PublicLeads} />
          <Route path="/my-leads" component={Login} />
          <Route path="/credits" component={Login} />
          <Route path="/admin" component={Login} />
          <Route path="/admin/manage-leads" component={Login} />
          <Route path="/admin/test-import" component={Login} />
          <Route path="/integrations" component={Login} />
          <Route path="/profile/edit" component={Login} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CookieConsentProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
          <CookieBanner />
          <CookieSettings />
          <AnalyticsInitializer />
        </TooltipProvider>
      </CookieConsentProvider>
    </QueryClientProvider>
  );
}

export default App;
