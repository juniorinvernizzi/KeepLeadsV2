import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import LeadsMarketplace from "@/pages/LeadsMarketplace";
import MyLeads from "@/pages/MyLeads";
import Credits from "@/pages/Credits";
import AdminPanel from "@/pages/AdminPanel";
import ManageLeads from "@/pages/ManageLeads";
import PublicLeads from "@/pages/PublicLeads";

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
      
      {/* Authenticated routes */}
      {isAuthenticated ? (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/leads" component={LeadsMarketplace} />
          <Route path="/my-leads" component={MyLeads} />
          <Route path="/credits" component={Credits} />
          <Route path="/admin" component={AdminPanel} />
          <Route path="/admin/manage-leads" component={ManageLeads} />
        </>
      ) : (
        <>
          <Route path="/" component={Landing} />
          <Route path="/leads" component={Landing} />
          <Route path="/my-leads" component={Landing} />
          <Route path="/credits" component={Landing} />
          <Route path="/admin" component={Landing} />
          <Route path="/admin/manage-leads" component={Landing} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
