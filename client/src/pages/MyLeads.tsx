import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Star, MapPin, Phone, Mail, Users, TrendingUp, Calendar, DollarSign, Building, Eye, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";

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
    planType: string;
    budgetMin: string;
    budgetMax: string;
    availableLives: number;
    source: string;
    campaign: string;
    quality: string;
    notes: string;
    createdAt: string;
  };
}

export default function MyLeads() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [expandedLead, setExpandedLead] = useState<string | null>(null);
  
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

  const getQualityColor = (quality: string) => {
    const colors: Record<string, string> = {
      "high": "bg-green-100 text-green-800 border-green-200",
      "medium": "bg-yellow-100 text-yellow-800 border-yellow-200", 
      "low": "bg-red-100 text-red-800 border-red-200",
    };
    return colors[quality] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const formatBudgetRange = (min: string, max: string) => {
    if (!min || !max) return "Não informado";
    return `R$ ${parseFloat(min).toFixed(2)} - R$ ${parseFloat(max).toFixed(2)}`;
  };

  const maskSensitiveInfo = (text: string, type: 'email' | 'phone' | 'name'): string => {
    switch (type) {
      case 'email':
        const [name, domain] = text.split('@');
        return `${name.slice(0, 2)}***@${domain}`;
      case 'phone':
        return text.slice(0, 5) + '****-****';
      case 'name':
        const names = text.split(' ');
        return `${names[0]} ${'*'.repeat(names.slice(1).join(' ').length)}`;
      default:
        return text;
    }
  };

  const handleExportToExcel = async () => {
    try {
      const response = await apiRequest("GET", "/api/my-leads/export");
      
      // Create blob and download
      const blob = new Blob([response as string], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `meus-leads-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Exportação concluída",
        description: "Seus leads foram exportados com sucesso para Excel.",
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar os leads. Tente novamente.",
        variant: "destructive",
      });
    }
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
      <div className="w-9/10 mx-auto py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-slate-800" data-testid="text-page-title">
              Meus Leads
            </h1>
            <Button
              onClick={handleExportToExcel}
              variant="outline"
              className="flex items-center space-x-2"
              data-testid="button-export-excel"
            >
              <Download className="w-4 h-4" />
              <span>Exportar Excel</span>
            </Button>
          </div>
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

        {/* Purchased Leads Cards */}
        {purchases.length === 0 ? (
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
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
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-800">Detalhes Completos dos Leads</h2>
              <Badge className="bg-green-100 text-green-800 border-green-200">
                ✓ Informações Desbloqueadas
              </Badge>
            </div>
            
            <div className="grid gap-6">
              {purchases.map((purchase) => {
                const statusBadge = getStatusBadge(purchase.status);
                const daysSincePurchase = Math.floor((Date.now() - new Date(purchase.purchasedAt).getTime()) / (1000 * 60 * 60 * 24));
                
                return (
                  <Card key={purchase.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-green-500" data-testid={`card-purchase-${purchase.id}`}>
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <Users className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900" data-testid={`text-lead-name-${purchase.id}`}>
                              {expandedLead === purchase.id ? purchase.lead.name : maskSensitiveInfo(purchase.lead.name, 'name')}
                            </h3>
                            <div className="flex items-center space-x-3 text-sm text-slate-500">
                              <span>{purchase.lead.age} anos</span>
                              <span>•</span>
                              <span>{purchase.lead.city}, {purchase.lead.state}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <div className="text-lg font-bold text-green-600" data-testid={`text-price-${purchase.id}`}>
                            R$ {purchase.price}
                          </div>
                          <div className="text-sm text-slate-500" data-testid={`text-date-${purchase.id}`}>
                            Comprado {daysSincePurchase === 0 ? 'hoje' : `há ${daysSincePurchase} dias`}
                          </div>
                          <Button
                            size="sm"
                            variant={expandedLead === purchase.id ? "secondary" : "default"}
                            onClick={() => setExpandedLead(expandedLead === purchase.id ? null : purchase.id)}
                            data-testid={`button-toggle-details-${purchase.id}`}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            {expandedLead === purchase.id ? 'Ocultar' : 'Ver Detalhes'}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                      {/* Status and Quality */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Badge className={statusBadge.className} data-testid={`text-status-${purchase.id}`}>
                            {statusBadge.label}
                          </Badge>
                          <Badge className={getQualityColor(purchase.lead.quality)} data-testid={`text-quality-${purchase.id}`}>
                            <Star className="w-3 h-3 mr-1" />
                            {purchase.lead.quality === 'high' ? 'Alta Qualidade' :
                             purchase.lead.quality === 'medium' ? 'Qualidade Média' : 'Baixa Qualidade'}
                          </Badge>
                        </div>
                        <Badge className={getCompanyColor(purchase.lead.insuranceCompanyId)}>
                          <Building className="w-3 h-3 mr-1" />
                          {getCompanyName(purchase.lead.insuranceCompanyId)}
                        </Badge>
                      </div>

                      {/* Contact Information */}
                      {expandedLead === purchase.id ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                          <div className="text-center">
                            <div className="flex items-center justify-center mb-2">
                              <Phone className="w-4 h-4 text-green-600 mr-2" />
                              <span className="text-sm font-medium text-green-800">Telefone</span>
                            </div>
                            <p className="font-semibold text-slate-900" data-testid={`text-phone-${purchase.id}`}>
                              {purchase.lead.phone}
                            </p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center mb-2">
                              <Mail className="w-4 h-4 text-green-600 mr-2" />
                              <span className="text-sm font-medium text-green-800">E-mail</span>
                            </div>
                            <p className="font-semibold text-slate-900 break-all" data-testid={`text-email-${purchase.id}`}>
                              {purchase.lead.email}
                            </p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center mb-2">
                              <MapPin className="w-4 h-4 text-green-600 mr-2" />
                              <span className="text-sm font-medium text-green-800">Localização</span>
                            </div>
                            <p className="font-semibold text-slate-900">
                              {purchase.lead.city}, {purchase.lead.state}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="text-center">
                            <div className="flex items-center justify-center mb-2">
                              <Phone className="w-4 h-4 text-gray-400 mr-2" />
                              <span className="text-sm font-medium text-gray-600">Telefone</span>
                            </div>
                            <p className="font-semibold text-slate-900" data-testid={`text-phone-${purchase.id}`}>
                              {maskSensitiveInfo(purchase.lead.phone, 'phone')}
                            </p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center mb-2">
                              <Mail className="w-4 h-4 text-gray-400 mr-2" />
                              <span className="text-sm font-medium text-gray-600">E-mail</span>
                            </div>
                            <p className="font-semibold text-slate-900 break-all" data-testid={`text-email-${purchase.id}`}>
                              {maskSensitiveInfo(purchase.lead.email, 'email')}
                            </p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center mb-2">
                              <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                              <span className="text-sm font-medium text-gray-600">Localização</span>
                            </div>
                            <p className="font-semibold text-slate-900">
                              {purchase.lead.city}, {purchase.lead.state}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Lead Details - Only show when expanded */}
                      {expandedLead === purchase.id && (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center text-sm font-medium text-slate-600">
                                <Users className="w-4 h-4 mr-2" />
                                Tipo de Plano
                              </div>
                              <p className="font-semibold text-slate-900 capitalize">
                                {purchase.lead.planType === 'individual' ? 'Individual' :
                                 purchase.lead.planType === 'family' ? 'Familiar' : 
                                 purchase.lead.planType === 'business' ? 'Empresarial' : purchase.lead.planType}
                              </p>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center text-sm font-medium text-slate-600">
                                <DollarSign className="w-4 h-4 mr-2" />
                                Orçamento
                              </div>
                              <p className="font-semibold text-slate-900">
                                {formatBudgetRange(purchase.lead.budgetMin, purchase.lead.budgetMax)}
                              </p>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center text-sm font-medium text-slate-600">
                                <Users className="w-4 h-4 mr-2" />
                                Vidas Disponíveis
                              </div>
                              <p className="font-semibold text-slate-900">
                                {purchase.lead.availableLives} vida{purchase.lead.availableLives > 1 ? 's' : ''}
                              </p>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center text-sm font-medium text-slate-600">
                                <TrendingUp className="w-4 h-4 mr-2" />
                                Origem
                              </div>
                              <p className="font-semibold text-slate-900">
                                {purchase.lead.source}
                              </p>
                            </div>
                          </div>

                          {/* Campaign and Notes */}
                          {(purchase.lead.campaign || purchase.lead.notes) && (
                            <div className="space-y-3 pt-4 border-t border-slate-200">
                              {purchase.lead.campaign && (
                                <div>
                                  <span className="text-sm font-medium text-slate-600">Campanha: </span>
                                  <span className="text-slate-900">{purchase.lead.campaign}</span>
                                </div>
                              )}
                              {purchase.lead.notes && (
                                <div>
                                  <span className="text-sm font-medium text-slate-600">Observações: </span>
                                  <span className="text-slate-900">{purchase.lead.notes}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
