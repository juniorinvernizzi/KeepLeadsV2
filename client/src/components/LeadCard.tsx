import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import PurchaseModal from "./PurchaseModal";
import LeadDetailsModal from "./LeadDetailsModal";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Eye, EyeOff, MapPin, Calendar, CreditCard, Star, User, Phone } from "lucide-react";

interface Lead {
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
  source: string;
  campaign: string;
  quality: string;
  status: string;
  price: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface Company {
  id: string;
  name: string;
  color: string;
  logo?: string;
}

interface LeadCardProps {
  lead: Lead;
  companies: Company[];
  onPurchase: () => void;
}

export default function LeadCard({ lead, companies, onPurchase }: LeadCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showSensitiveInfo, setShowSensitiveInfo] = useState(false);

  const company = companies.find(c => c.id === lead.insuranceCompanyId) || {
    id: lead.insuranceCompanyId,
    name: lead.insuranceCompanyId,
    color: "#7C3AED"
  };

  const purchaseMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/leads/${lead.id}/purchase`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      toast({
        title: "Lead comprado com sucesso!",
        description: "O lead foi adicionado aos seus leads comprados.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/my-leads"] });
      setShowPurchaseModal(false);
      onPurchase();
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Erro ao comprar lead",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getCompanyColors = (companyName: string) => {
    const colorMap: Record<string, { bg: string; text: string; button: string }> = {
      "amil": { 
        bg: "bg-blue-600", 
        text: "text-blue-100", 
        button: "bg-white text-blue-600 hover:bg-blue-50" 
      },
      "bradesco": { 
        bg: "bg-red-600", 
        text: "text-red-100", 
        button: "bg-white text-red-600 hover:bg-red-50" 
      },
      "sulamérica": { 
        bg: "bg-slate-700", 
        text: "text-slate-300", 
        button: "bg-white text-slate-700 hover:bg-slate-50" 
      },
      "unimed": { 
        bg: "bg-orange-500", 
        text: "text-orange-100", 
        button: "bg-white text-orange-500 hover:bg-orange-50" 
      },
      "porto seguro": { 
        bg: "bg-blue-800", 
        text: "text-blue-200", 
        button: "bg-white text-blue-800 hover:bg-blue-50" 
      },
    };
    
    const key = companyName.toLowerCase();
    return colorMap[key] || { 
      bg: "bg-primary", 
      text: "text-purple-100", 
      button: "bg-white text-primary hover:bg-purple-50" 
    };
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      available: { label: "Disponível", className: "bg-green-100 text-green-800" },
      reserved: { label: "Reservado", className: "bg-yellow-100 text-yellow-800" },
      sold: { label: "Vendido", className: "bg-red-100 text-red-800" },
      expired: { label: "Expirado", className: "bg-gray-100 text-gray-800" },
    };
    return statusMap[status] || { label: status, className: "bg-gray-100 text-gray-800" };
  };

  const colors = getCompanyColors(company.name);
  const statusBadge = getStatusBadge(lead.status);
  const canPurchase = lead.status === "available";
  const userCredits = parseFloat(user?.credits || "0");
  const leadPrice = parseFloat(lead.price);
  const hasSufficientCredits = userCredits >= leadPrice;

  const handlePurchase = () => {
    if (!hasSufficientCredits) {
      toast({
        title: "Créditos insuficientes",
        description: "Você não possui créditos suficientes para comprar este lead.",
        variant: "destructive",
      });
      return;
    }
    purchaseMutation.mutate();
  };

  // Masking function for sensitive information
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

  const daysSinceCreated = Math.floor(
    (Date.now() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  const getQualityColor = (quality: string) => {
    switch (quality.toUpperCase()) {
      case 'A': return 'bg-green-100 text-green-800 border-green-200';
      case 'B': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'C': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <>
      <Card className="h-full hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-gray-300 group overflow-hidden" data-testid={`card-lead-${lead.id}`}>
        <CardContent className="p-0">
          {/* Header with company branding */}
          <div 
            className="h-20 p-4 flex items-center justify-between relative"
            style={{ 
              background: `linear-gradient(135deg, ${company?.color || '#6366f1'} 0%, ${company?.color || '#6366f1'}dd 100%)` 
            }}
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                {company?.logo ? (
                  <img 
                    src={company.logo} 
                    alt={company.name}
                    className="w-8 h-8 object-contain"
                  />
                ) : (
                  <span className="text-white font-bold text-lg">
                    {company?.name?.charAt(0) || 'L'}
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">
                  {company?.name || 'Operadora'}
                </h3>
                <p className="text-white/80 text-xs">Plano de Saúde</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-white font-bold text-lg" data-testid={`text-price-${lead.id}`}>
                R$ {parseFloat(lead.price).toFixed(2)}
              </div>
              <div className="text-white/80 text-xs">
                {daysSinceCreated === 0 ? 'Hoje' : `${daysSinceCreated}d atrás`}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Quality and Status */}
            <div className="flex items-center justify-between mb-4">
              <Badge className={`${getQualityColor(lead.quality)} border font-medium`} data-testid={`text-status-${lead.id}`}>
                <Star className="w-3 h-3 mr-1" />
                Qualidade {lead.quality}
              </Badge>
              
              <Badge className={statusBadge.className}>
                {statusBadge.label}
              </Badge>
            </div>

            {/* Basic Info */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-sm flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  Localização:
                </span>
                <span className="font-medium text-sm" data-testid={`text-location-${lead.id}`}>
                  {lead.city}, {lead.state}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-sm flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Idade:
                </span>
                <span className="font-medium text-sm">{lead.age} anos</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-sm">Tipo:</span>
                <span className="font-medium text-sm capitalize">{lead.planType}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-sm flex items-center">
                  <CreditCard className="w-4 h-4 mr-1" />
                  Orçamento:
                </span>
                <span className="font-medium text-sm">
                  R$ {parseFloat(lead.budgetMin).toFixed(0)} - R$ {parseFloat(lead.budgetMax).toFixed(0)}
                </span>
              </div>
            </div>

            {/* Sensitive Information (masked) */}
            <div className="border-t border-gray-100 pt-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">Informações de Contato</span>
                <button
                  onClick={() => setShowSensitiveInfo(!showSensitiveInfo)}
                  className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                >
                  {showSensitiveInfo ? (
                    <EyeOff className="w-4 h-4 text-gray-500" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-500" />
                  )}
                </button>
              </div>
              
              {showSensitiveInfo && (
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      Nome:
                    </span>
                    <span className="text-gray-400 font-medium" data-testid={`text-lead-info-${lead.id}`}>
                      {maskSensitiveInfo(lead.name, 'name')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Email:</span>
                    <span className="text-gray-400 font-medium">
                      {maskSensitiveInfo(lead.email, 'email')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 flex items-center">
                      <Phone className="w-4 h-4 mr-1" />
                      Telefone:
                    </span>
                    <span className="text-gray-400 font-medium" data-testid={`text-phone-masked-${lead.id}`}>
                      {maskSensitiveInfo(lead.phone, 'phone')}
                    </span>
                  </div>
                </div>
              )}
              
              {showSensitiveInfo && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-700 text-center">
                    🔒 Informações completas disponíveis após a compra
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                variant="outline"
                onClick={() => setShowDetailsModal(true)}
                className="w-full"
                data-testid={`button-details-${lead.id}`}
              >
                Ver mais detalhes
              </Button>
              
              {canPurchase && (
                <Button
                  onClick={() => setShowPurchaseModal(true)}
                  disabled={!hasSufficientCredits}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2.5"
                  data-testid={`button-purchase-${lead.id}`}
                >
                  {!hasSufficientCredits ? "SALDO INSUFICIENTE" : "COMPRAR AGORA"}
                </Button>
              )}
              
              {!canPurchase && lead.status === 'sold' && (
                <div className="text-center py-3">
                  <Badge variant="secondary" className="bg-red-100 text-red-800">
                    Lead Vendido
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <PurchaseModal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        onConfirm={handlePurchase}
        lead={lead}
        company={company}
        userCredits={userCredits}
        isLoading={purchaseMutation.isPending}
      />

      <LeadDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        lead={lead}
        company={company}
        onPurchase={() => {
          setShowDetailsModal(false);
          setShowPurchaseModal(true);
        }}
        canPurchase={canPurchase && hasSufficientCredits}
      />
    </>
  );
}
