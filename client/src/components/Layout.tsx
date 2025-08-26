import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useEffect } from "react";
import { 
  LayoutDashboard,
  ShoppingBag, 
  Users, 
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  Target
} from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [user, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  const navigationItems = [
    { 
      path: "/", 
      label: "Dashboard", 
      icon: <LayoutDashboard className="w-5 h-5" />
    },
    { 
      path: "/leads", 
      label: "Leads", 
      icon: <ShoppingBag className="w-5 h-5" />
    },
    { 
      path: "/my-leads", 
      label: "Meus Leads", 
      icon: <Users className="w-5 h-5" />
    },
    { 
      path: "/credits", 
      label: "Adicionar Crédito", 
      icon: <CreditCard className="w-5 h-5" />
    },
    ...(user.role === "admin" ? [{
      path: "/admin", 
      label: "Configurações", 
      icon: <Settings className="w-5 h-5" />
    }] : []),
  ];

  const getSidebarItemClass = (path: string) => {
    const isActive = location === path;
    return `flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
      isActive 
        ? "bg-purple-50 text-purple-700 border border-purple-200" 
        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
    }`;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-lg transform lg:translate-x-0 lg:static lg:inset-0 transition duration-200 ease-in-out lg:transition-none`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900">Keep</span>
              <span className="text-xl font-bold text-purple-600">Leads</span>
            </div>
          </div>
          
          {/* Close button for mobile */}
          <button 
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Navigation Header */}
        <div className="px-6 py-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">GERAL</p>
        </div>

        {/* Navigation */}
        <nav className="px-4 space-y-1">
          {navigationItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <button 
                className={getSidebarItemClass(item.path)} 
                data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => setSidebarOpen(false)}
              >
                {item.icon}
                <span className="ml-3 font-medium">{item.label}</span>
              </button>
            </Link>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
          <div className="bg-gray-50 rounded-xl p-4 mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-purple-600">
                  {user.firstName ? user.firstName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate" data-testid="text-user-name">
                  {user.firstName && user.lastName 
                    ? `${user.firstName} ${user.lastName}`
                    : user.email || "Usuário"
                  }
                </div>
                <div className="text-xs text-gray-500">
                  Saldo: <span className="font-semibold text-green-600" data-testid="text-user-balance">
                    R$ {parseFloat(user.credits || "0").toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.href = "/api/logout"}
            className="w-full justify-start text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Fazer Logout
          </Button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header for mobile */}
        <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <Menu className="w-5 h-5 text-gray-500" />
            </button>
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold text-gray-900">Keep</span>
                <span className="text-lg font-bold text-purple-600">Leads</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content with full width and padding */}
        <main className="flex-1 overflow-auto">
          <div className="px-4 sm:px-8 lg:px-[60px] py-8 max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}