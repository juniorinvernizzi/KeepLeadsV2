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
  CreditCard,
  FileText,
  Target,
  ArrowRight,
  DollarSign
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

  const totalSpent = transactions
    .filter((t) => t.type === 'purchase')
    .reduce((sum: number, t) => sum + Math.abs(parseFloat(t.amount)), 0);

  const recentPurchases = userPurchases.slice(0, 3);
  const userCredits = parseFloat(user?.credits || "0");

  const stats = [
    {
      title: "Saldo de Créditos",
      value: `R$ ${userCredits.toFixed(2)}`,
      icon: <CreditCard className="w-5 h-5" />,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Leads Comprados",
      value: userPurchases.length.toString(),
      icon: <ShoppingCart className="w-5 h-5" />,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Total Investido",
      value: `R$ ${totalSpent.toFixed(2)}`,
      icon: <DollarSign className="w-5 h-5" />,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Taxa Conversão",
      value: userPurchases.length > 0 ? "85%" : "0%",
      icon: <Target className="w-5 h-5" />,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ];

  const quickActions = [
    {
      title: "Explorar Marketplace",
      description: "Encontre novos leads qualificados",
      icon: <FileText className="w-5 h-5" />,
      href: "/leads",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Meus Leads",
      description: "Gerencie seus leads comprados",
      icon: <Users className="w-5 h-5" />,
      href: "/my-leads",
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Comprar Créditos",
      description: "Adicione saldo à sua conta",
      icon: <CreditCard className="w-5 h-5" />,
      href: "/credits",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Dashboard
          </h1>
          <p className="text-slate-600">
            Bem-vindo de volta! Aqui está um resumo da sua atividade.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-slate-800">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <div className={stat.color}>
                      {stat.icon}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Ações Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {quickActions.map((action, index) => (
                    <Link key={index} href={action.href}>
                      <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-4">
                          <div className={`p-3 rounded-full ${action.bgColor} w-fit mb-3`}>
                            <div className={action.color}>
                              {action.icon}
                            </div>
                          </div>
                          <h3 className="font-semibold text-slate-800 mb-2">
                            {action.title}
                          </h3>
                          <p className="text-sm text-slate-600 mb-3">
                            {action.description}
                          </p>
                          <div className="flex items-center text-sm text-primary font-medium">
                            Acessar
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
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
                  <div className="text-center py-6">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <ShoppingCart className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-slate-500 text-sm mb-4">
                      Nenhuma compra realizada ainda
                    </p>
                    <Link href="/leads">
                      <Button size="sm">
                        Explorar Leads
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentPurchases.map((purchase, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                            <Users className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-sm text-slate-800">
                              Lead Comprado
                            </p>
                            <p className="text-xs text-slate-500">
                              R$ {parseFloat(purchase.price).toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          Novo
                        </Badge>
                      </div>
                    ))}
                    
                    <Link href="/my-leads">
                      <Button variant="outline" size="sm" className="w-full">
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
        <Card className="mt-8">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-blue-50 rounded-full">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-800 mb-2">
                  Dicas para Maximizar suas Conversões
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span>Entre em contato com leads nas primeiras 24 horas</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span>Personalize sua abordagem baseada no perfil do lead</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span>Foque em leads de qualidade "A" para maior conversão</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
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