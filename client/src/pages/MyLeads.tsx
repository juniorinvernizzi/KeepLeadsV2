import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PurchasedLead {
  id: string;
  leadId: string;
  userId: string;
  price: string;
  status: string;
  purchasedAt: string;
  lead: {
    id: string;
    name: string;
    email: string;
    phone: string;
    age: number;
    city: string;
    state: string;
    insuranceCompanyId: string;
    source: string;
    campaign: string;
  };
}

export default function MyLeads() {
  const { user } = useAuth();
  
  const { data: purchases = [], isLoading } = useQuery<PurchasedLead[]>({
    queryKey: ["/api/my-leads"],
    enabled: !!user,
  });

  const stats = {
    totalPurchased: purchases.length,
    totalInvested: purchases.reduce((sum, p) => sum + parseFloat(p.price), 0).toFixed(2),
    thisMonth: purchases.filter(p => {
      const purchaseDate = new Date(p.purchasedAt);
      const now = new Date();
      return purchaseDate.getMonth() === now.getMonth() && 
             purchaseDate.getFullYear() === now.getFullYear();
    }).length,
    conversionRate: "32", // Mock data - would be calculated based on actual conversions
  };

  const getCompanyName = (companyId: string) => {
    const companies: Record<string, string> = {
      "amil": "Amil",
      "bradesco": "Bradesco", 
      "sulamérica": "SulAmérica",
      "unimed": "Unimed",
      "porto-seguro": "Porto Seguro",
    };
    return companies[companyId] || "Desconhecida";
  };

  const getCompanyColor = (companyId: string) => {
    const colors: Record<string, string> = {
      "amil": "bg-blue-100 text-blue-800",
      "bradesco": "bg-red-100 text-red-800",
      "sulamérica": "bg-gray-100 text-gray-800",
      "unimed": "bg-orange-100 text-orange-800",
      "porto-seguro": "bg-blue-100 text-blue-800",
    };
    return colors[companyId] || "bg-gray-100 text-gray-800";
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      active: { label: "Ativo", className: "bg-green-100 text-green-800" },
      contacted: { label: "Contatado", className: "bg-yellow-100 text-yellow-800" },
      converted: { label: "Convertido", className: "bg-blue-100 text-blue-800" },
      expired: { label: "Expirado", className: "bg-gray-100 text-gray-800" },
    };
    return statusMap[status] || { label: status, className: "bg-gray-100 text-gray-800" };
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="w-9/10 mx-auto py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-slate-200 rounded-xl h-24"></div>
              ))}
            </div>
            <div className="bg-slate-200 rounded-xl h-96"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2" data-testid="text-page-title">
            Meus Leads
          </h1>
          <p className="text-slate-600">Leads que você já comprou e seus detalhes completos</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Comprados</p>
                  <p className="text-2xl font-bold text-slate-800" data-testid="text-total-purchased">
                    {stats.totalPurchased}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Valor Investido</p>
                  <p className="text-2xl font-bold text-slate-800" data-testid="text-total-invested">
                    R$ {stats.totalInvested}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Este Mês</p>
                  <p className="text-2xl font-bold text-slate-800" data-testid="text-this-month">
                    {stats.thisMonth}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Taxa Conversão</p>
                  <p className="text-2xl font-bold text-slate-800" data-testid="text-conversion-rate">
                    {stats.conversionRate}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Purchased Leads Table */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Compras</CardTitle>
          </CardHeader>
          <CardContent>
            {purchases.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2" data-testid="text-no-purchases">
                  Nenhum lead comprado ainda
                </h3>
                <p className="text-slate-500 mb-4">
                  Vá para o marketplace e comece a comprar leads qualificados.
                </p>
                <Button 
                  onClick={() => window.location.href = "/leads"}
                  data-testid="button-go-marketplace"
                >
                  Ver Marketplace
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Lead
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Operadora
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Contato
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Preço
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Data Compra
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {purchases.map((purchase) => {
                      const statusBadge = getStatusBadge(purchase.status);
                      return (
                        <tr key={purchase.id} className="hover:bg-slate-50" data-testid={`row-purchase-${purchase.id}`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-slate-900" data-testid={`text-lead-name-${purchase.id}`}>
                                  {purchase.lead.name}
                                </div>
                                <div className="text-sm text-slate-500">
                                  {purchase.lead.age} anos • {purchase.lead.city}, {purchase.lead.state}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={getCompanyColor(purchase.lead.insuranceCompanyId)}>
                              {getCompanyName(purchase.lead.insuranceCompanyId)}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-900" data-testid={`text-phone-${purchase.id}`}>
                              {purchase.lead.phone}
                            </div>
                            <div className="text-sm text-slate-500" data-testid={`text-email-${purchase.id}`}>
                              {purchase.lead.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900" data-testid={`text-price-${purchase.id}`}>
                            R$ {purchase.price}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500" data-testid={`text-date-${purchase.id}`}>
                            {formatDistanceToNow(new Date(purchase.purchasedAt), { addSuffix: true, locale: ptBR })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={statusBadge.className} data-testid={`text-status-${purchase.id}`}>
                              {statusBadge.label}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
