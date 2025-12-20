import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  Target,
  FolderOpen,
  ChevronDown,
  TestTube,
  BarChart2,
} from "lucide-react";
import { Link as LinkIcon } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const navigationItems = [
    {
      path: "/",
      label: "Dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      path: "/leads",
      label: "Marketplace",
      icon: <ShoppingBag className="w-5 h-5" />,
    },
    {
      path: "/my-leads",
      label: "Meus Leads",
      icon: <Users className="w-5 h-5" />,
    },
    {
      path: "/credits",
      label: "Adicionar Crédito",
      icon: <CreditCard className="w-5 h-5" />,
    },
    ...(user.role === "admin"
      ? [
          {
            path: "/admin/manage-leads",
            label: "Gerenciar Leads",
            icon: <FolderOpen className="w-5 h-5" />,
          },
          {
            path: "/admin/reports",
            label: "Relatórios",
            icon: <BarChart2 className="w-5 h-5" />,
          },
          {
            path: "/admin",
            label: "Configurações",
            icon: <Settings className="w-5 h-5" />,
          },
        ]
      : []),
  ];

  const getSidebarItemClass = (path: string) => {
    const isActive = location === path;
    return `flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
      isActive
        ? "bg-primary text-white border border-primary"
        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
    }`;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-lg transform lg:translate-x-0 lg:static lg:inset-0 transition duration-200 ease-in-out lg:transition-none`}
        data-testid="sidebar"
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-light rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900">Keep</span>
              <span className="text-xl font-bold text-gray-600">Leads</span>
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
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            {user.role === "admin" ? "ADMINISTRAÇÃO" : "GERAL"}
          </p>
        </div>

        {/* Navigation */}
        <nav className="px-4 space-y-1">
          {navigationItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <button
                className={getSidebarItemClass(item.path)}
                data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                onClick={() => setSidebarOpen(false)}
              >
                {item.icon}
                <span className="ml-3 font-medium">{item.label}</span>
              </button>
            </Link>
          ))}
        </nav>

        {/* User Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.profileImageUrl} alt={user.firstName || "User"} />
                <AvatarFallback className="bg-purple-100 text-purple-600 font-semibold">
                  {user.firstName
                    ? user.firstName.charAt(0).toUpperCase()
                    : user.email?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div
                  className="text-sm font-medium text-gray-900 truncate"
                  data-testid="text-user-name"
                >
                  {user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user.email || "Usuário"}
                </div>
                <div className="text-xs text-gray-500">
                  Saldo:{" "}
                  <span
                    className="font-semibold text-green-600"
                    data-testid="text-user-balance"
                  >
                    R$ {parseFloat(user.credits || "0").toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
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
        {/* Fixed Header for content area only */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-end px-6 sticky top-0 z-40">
          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 p-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.profileImageUrl} alt={user?.firstName || "User"} />
                  <AvatarFallback
                    className={`${user?.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"} font-semibold`}
                  >
                    {(
                      user?.firstName?.charAt(0) ||
                      user?.email?.charAt(0) ||
                      "U"
                    ).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden md:block">
                  {user?.firstName || user?.email?.split("@")[0] || "Usuário"}
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-3 py-2">
                <p className="text-sm font-medium">
                  {user?.firstName || "Usuário"}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
                <p className="text-xs text-green-600 font-medium mt-1">
                  Saldo: R$ {parseFloat(user?.credits || "0").toFixed(2)}
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => (window.location.href = "/profile/edit")}
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Editar Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-red-600 hover:bg-red-50"
                onClick={async () => {
                  try {
                    await fetch("/api/simple-logout", {
                      method: "POST",
                      credentials: "include",
                    });
                    window.location.href = "/login";
                  } catch (error) {
                    window.location.href = "/login";
                  }
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Mobile menu button */}
        <div className="lg:hidden fixed top-4 left-4 z-50">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 bg-white shadow-sm border"
            data-testid="button-menu"
          >
            <Menu className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Page content with full width and padding */}
        <main className="flex-1 overflow-auto">
          <div className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-4 sm:py-6 lg:py-8 w-full max-w-[1920px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
