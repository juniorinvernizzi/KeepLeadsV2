import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  ShoppingBag,
  CreditCard,
  FileText,
  Target,
  ArrowRight,
  DollarSign,
  Filter,
  Star,
  BarChart3,
  Eye
} from "lucide-react";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  credits: string;
  role: string;
}

interface Purchase {
  id: string;
  price: string;
  purchasedAt: string;
}

interface Transaction {
  id: string;
  type: string;
  amount: string;
  description: string;
  createdAt: string;
}

interface AdminStats {
  totalUsers: string;
  activeUsers: string;
  totalLeads: string;
  soldLeads: string;
  totalRevenue: string;
}

interface Lead {
  id: string;
  name: string;
  age: number;
  city: string;
  state: string;
  insuranceCompanyId: string;
  planType: string;
  budgetMin: string;
  budgetMax: string;
  quality: string;
  price: string;
  createdAt: string;
}

interface Company {
  id: string;
  name: string;
  color: string;
  logo?: string;
}

export default function Dashboard() {
  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/user"],
  });

  const { data: userPurchases = [] } = useQuery<Purchase[]>({
    queryKey: ["/api/my-leads"],
  });

  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const { data: adminStats } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    enabled: user?.role === "admin",
  });

  const { data: leads = [] } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
    enabled: user?.role === "admin",
  });

  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ["/api/insurance-companies"],
  });

  const totalSpent = transactions
    .filter((t) => t.type === 'purchase')
    .reduce((sum: number, t) => sum + Math.abs(parseFloat(t.amount)), 0);

  const recentPurchases = userPurchases.slice(0, 3);
  const userCredits = parseFloat(user?.credits || "0");

  // Admin dashboard
  if (user?.role === "admin") {
    const recentLeads = leads.slice(0, 6);
    
    return (
      <Layout>
        <div className="w-9/10 mx-auto py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Meu Dashboard
            </h1>
            <p className="text-gray-600">
              Acompanhe suas compras, saldo e atividades na plataforma
            </p>
          </div>

          {/* User Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Leads Comprados</p>
                    <p className="text-3xl font-bold">{userPurchases.length}</p>
                  </div>
                  <ShoppingCart className="w-8 h-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Saldo Atual</p>
                    <p className="text-3xl font-bold">R$ {userCredits.toFixed(0)}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Total Investido</p>
                    <p className="text-3xl font-bold">R$ {totalSpent.toFixed(0)}</p>
                  </div>
                  <Target className="w-8 h-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">Transações</p>
                    <p className="text-3xl font-bold">{transactions.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Purchases Section */}
          <Card className="mb-8">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold">Compras Recentes</CardTitle>
                <p className="text-gray-600 text-sm">Seus últimos leads comprados</p>
              </div>
              <Link href="/my-leads">
                <Button variant="outline" size="sm">
                  Ver todos
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-6">
              {recentPurchases.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                    <ShoppingCart className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">Nenhuma compra ainda</h3>
                  <p className="text-slate-500 mb-4">Comece comprando leads no marketplace</p>
                  <Button onClick={() => window.location.href = "/leads"}>
                    Ver Marketplace
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentPurchases.map((purchase) => {
                    const company = companies.find(c => c.id === purchase.lead?.insuranceCompanyId);
                    return (
                      <div key={purchase.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <Users className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{purchase.lead?.name}</h3>
                            <p className="text-sm text-gray-500">
                              {purchase.lead?.city}/{purchase.lead?.state} • {company?.name || 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">R$ {parseFloat(purchase.price).toFixed(2)}</p>
                          <p className="text-sm text-gray-500">
                            {formatDistanceToNow(new Date(purchase.purchasedAt), { addSuffix: true, locale: ptBR })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // Client dashboard
  const clientStats = [
    {
      title: "Saldo de Créditos",
      value: `R$ ${userCredits.toFixed(2)}`,
      icon: <CreditCard className="w-5 h-5" />,
      color: "text-green-600",
      bgColor: "bg-gradient-to-br from-green-500 to-green-600"
    },
    {
      title: "Leads Comprados",
      value: userPurchases.length.toString(),
      icon: <ShoppingCart className="w-5 h-5" />,
      color: "text-blue-600",
      bgColor: "bg-gradient-to-br from-blue-500 to-blue-600"
    },
    {
      title: "Total Investido",
      value: `R$ ${totalSpent.toFixed(2)}`,
      icon: <DollarSign className="w-5 h-5" />,
      color: "text-purple-600",
      bgColor: "bg-gradient-to-br from-purple-500 to-purple-600"
    },
    {
      title: "Taxa Conversão",
      value: userPurchases.length > 0 ? "85%" : "0%",
      icon: <TrendingUp className="w-5 h-5" />,
      color: "text-orange-600",
      bgColor: "bg-gradient-to-br from-orange-500 to-orange-600"
    }
  ];

  return (
    <Layout>
      <div className="w-9/10 mx-auto py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Dashboard
            </h1>
            <p className="text-gray-600">
              Bem-vindo de volta, {user?.firstName || user?.email?.split('@')[0] || 'usuário'}! Aqui está um resumo da sua atividade.
            </p>
          </div>
          
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Filter className="w-4 h-4 mr-2" />
            Filtrar
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {clientStats.map((stat, index) => (
            <Card key={index} className={`${stat.bgColor} text-white border-0 overflow-hidden`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm font-medium mb-1">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold">
                      {stat.value}
                    </p>
                  </div>
                  <div className="text-white/60">
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Ações Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Link href="/leads">
                    <Card className="h-full hover:shadow-md transition-all duration-200 cursor-pointer group border-2 hover:border-purple-200">
                      <CardContent className="p-6 text-center">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                          <ShoppingBag className="w-6 h-6 text-purple-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">
                          Explorar Leads
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Encontre novos leads qualificados
                        </p>
                        <div className="flex items-center justify-center text-sm text-purple-600 font-medium">
                          <span>Acessar</span>
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>

                  <Link href="/my-leads">
                    <Card className="h-full hover:shadow-md transition-all duration-200 cursor-pointer group border-2 hover:border-green-200">
                      <CardContent className="p-6 text-center">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                          <Users className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">
                          Meus Leads
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Gerencie seus leads comprados
                        </p>
                        <div className="flex items-center justify-center text-sm text-green-600 font-medium">
                          <span>Acessar</span>
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>

                  <Link href="/credits">
                    <Card className="h-full hover:shadow-md transition-all duration-200 cursor-pointer group border-2 hover:border-blue-200">
                      <CardContent className="p-6 text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                          <CreditCard className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">
                          Comprar Créditos
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Adicione saldo à sua conta
                        </p>
                        <div className="flex items-center justify-center text-sm text-blue-600 font-medium">
                          <span>Acessar</span>
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Atividade Recente
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentPurchases.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShoppingCart className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-sm mb-4">
                      Nenhuma compra realizada ainda
                    </p>
                    <Link href="/leads">
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                        Explorar Leads
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentPurchases.map((purchase, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-sm text-gray-900">
                              Lead Comprado
                            </p>
                            <p className="text-xs text-gray-500">
                              R$ {parseFloat(purchase.price).toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                          Sucesso
                        </Badge>
                      </div>
                    ))}
                    
                    <Link href="/my-leads">
                      <Button variant="outline" size="sm" className="w-full mt-4">
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Todos os Leads
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tips Section */}
        <Card className="mt-8 border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Dicas para Maximizar suas Conversões
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="flex items-start space-x-3">
                    <Star className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    <span>Entre em contato com leads nas primeiras 24 horas</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Star className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    <span>Personalize sua abordagem baseada no perfil do lead</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Star className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    <span>Foque em leads de qualidade "A" para maior conversão</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Star className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    <span>Monitore suas métricas e ajuste sua estratégia</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}