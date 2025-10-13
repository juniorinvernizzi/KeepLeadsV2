import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Star, MapPin, Phone, Mail, Users, TrendingUp, Calendar, DollarSign, Building, Eye, Download, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";

interface PurchasedLead {
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
  status: string;
  price: string;
  notes: string;
  purchasedAt: string;
  createdAt: string;
  updatedAt: string;
}

export default function MyLeads() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedLead, setSelectedLead] = useState<PurchasedLead | null>(null);
  
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
        <div className="w-full">
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

        {/* Leads Grid */}
        {purchases.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">Nenhum lead comprado</h3>
            <p className="text-slate-500 mb-4">
              Você ainda não comprou nenhum lead. Visite o marketplace para encontrar leads.
            </p>
            <Button 
              onClick={() => window.location.href = "/leads"}
              data-testid="button-go-to-marketplace"
            >
              Ir para Marketplace
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {purchases.map((purchase) => {
                const daysSincePurchase = Math.floor(
                  (new Date().getTime() - new Date(purchase.purchasedAt).getTime()) / (1000 * 60 * 60 * 24)
                );
                const { label: statusLabel, className: statusClass } = getStatusBadge(purchase.status);

                return (
                  <Card 
                    key={purchase.id} 
                    className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group border-0 bg-white"
                    onClick={() => setSelectedLead(purchase)}
                    data-testid={`card-lead-${purchase.id}`}
                  >
                    {/* Card Header with gradient */}
                    <div className="relative bg-gradient-to-br from-purple-600 via-purple-500 to-indigo-600 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                            <Users className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-white text-sm">
                              {getCompanyName(purchase.insuranceCompanyId)}
                            </h3>
                            <p className="text-xs text-purple-100">Plano de Saúde</p>
                          </div>
                        </div>
                        <Badge className={getQualityColor(purchase.quality)} style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
                          <Star className="w-3 h-3 mr-1" />
                          {purchase.quality === 'high' ? 'Premium' : 
                           purchase.quality === 'medium' ? 'Padrão' : 'Básico'}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-purple-100">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            {purchase.city}, {purchase.state}
                          </span>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                          <span className="text-xs text-white font-medium">{purchase.age} anos</span>
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-4">
                      {/* Basic Info */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Tipo de Plano</span>
                          <span className="text-sm font-medium text-slate-900 capitalize">
                            {purchase.planType === 'individual' ? 'Individual' :
                             purchase.planType === 'family' ? 'Familiar' : 
                             purchase.planType === 'business' ? 'Empresarial' : purchase.planType}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Vidas Disponíveis</span>
                          <span className="text-sm font-medium text-slate-900">
                            {purchase.availableLives} vida{purchase.availableLives > 1 ? 's' : ''}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Origem</span>
                          <span className="text-sm font-medium text-slate-900">
                            {purchase.source}
                          </span>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-slate-100 my-4"></div>

                      {/* Purchase Info */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-lg font-bold text-green-600" data-testid={`text-price-${purchase.id}`}>
                            R$ {purchase.price}
                          </p>
                          <p className="text-xs text-slate-500" data-testid={`text-date-${purchase.id}`}>
                            Comprado {daysSincePurchase === 0 ? 'hoje' : `há ${daysSincePurchase} dias`}
                          </p>
                        </div>
                        <Badge className={statusClass}>
                          {statusLabel}
                        </Badge>
                      </div>

                      {/* Click indicator */}
                      <div className="flex items-center justify-center mt-4 text-slate-400 group-hover:text-slate-600 transition-colors">
                        <Eye className="w-4 h-4 mr-2" />
                        <span className="text-xs">Clique para ver detalhes</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        )}

        {/* Lead Details Modal */}
        {selectedLead && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{selectedLead.name}</h2>
                  <p className="text-slate-600">{selectedLead.city}, {selectedLead.state}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedLead(null)}
                  className="rounded-full"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="p-6 space-y-6">
                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Informações de Contato</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Phone className="w-4 h-4 text-green-600 mr-2" />
                        <span className="text-sm font-medium text-green-800">Telefone</span>
                      </div>
                      <p className="font-semibold text-slate-900">{selectedLead.phone}</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Mail className="w-4 h-4 text-green-600 mr-2" />
                        <span className="text-sm font-medium text-green-800">E-mail</span>
                      </div>
                      <p className="font-semibold text-slate-900 break-all">{selectedLead.email}</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <MapPin className="w-4 h-4 text-green-600 mr-2" />
                        <span className="text-sm font-medium text-green-800">Localização</span>
                      </div>
                      <p className="font-semibold text-slate-900">{selectedLead.city}, {selectedLead.state}</p>
                    </div>
                  </div>
                </div>

                {/* Lead Details */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Detalhes do Lead</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm font-medium text-slate-600">
                        <Users className="w-4 h-4 mr-2" />
                        Tipo de Plano
                      </div>
                      <p className="font-semibold text-slate-900 capitalize">
                        {selectedLead.planType === 'individual' ? 'Individual' :
                         selectedLead.planType === 'family' ? 'Familiar' : 
                         selectedLead.planType === 'business' ? 'Empresarial' : selectedLead.planType}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-sm font-medium text-slate-600">
                        <DollarSign className="w-4 h-4 mr-2" />
                        Orçamento
                      </div>
                      <p className="font-semibold text-slate-900">
                        {formatBudgetRange(selectedLead.budgetMin, selectedLead.budgetMax)}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-sm font-medium text-slate-600">
                        <Users className="w-4 h-4 mr-2" />
                        Vidas Disponíveis
                      </div>
                      <p className="font-semibold text-slate-900">
                        {selectedLead.availableLives} vida{selectedLead.availableLives > 1 ? 's' : ''}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-sm font-medium text-slate-600">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Origem
                      </div>
                      <p className="font-semibold text-slate-900">
                        {selectedLead.source}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Campaign and Notes */}
                {(selectedLead.campaign || selectedLead.notes) && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Informações Adicionais</h3>
                    <div className="space-y-3 p-4 bg-slate-50 rounded-lg">
                      {selectedLead.campaign && (
                        <div>
                          <span className="text-sm font-medium text-slate-600">Campanha: </span>
                          <span className="text-slate-900">{selectedLead.campaign}</span>
                        </div>
                      )}
                      {selectedLead.notes && (
                        <div>
                          <span className="text-sm font-medium text-slate-600">Observações: </span>
                          <span className="text-slate-900">{selectedLead.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Purchase Info */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Informações da Compra</h3>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <span className="text-sm font-medium text-green-800">Valor Pago</span>
                        <p className="text-lg font-bold text-green-600">R$ {selectedLead.price}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-green-800">Data da Compra</span>
                        <p className="font-semibold text-slate-900">
                          {new Date(selectedLead.purchasedAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-green-800">Status</span>
                        <div className="mt-1">
                          <Badge className={getStatusBadge(selectedLead.status).className}>
                            {getStatusBadge(selectedLead.status).label}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
