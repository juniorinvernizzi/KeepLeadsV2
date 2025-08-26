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
import LeadInfoModal from "./LeadInfoModal";
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
  availableLives: number;
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
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

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
      <Card 
        className="w-full max-w-sm bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 cursor-pointer group" 
        data-testid={`card-lead-${lead.id}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                style={{ backgroundColor: company?.color || '#7C3AED' }}
              >
                {company?.name?.charAt(0) || 'L'}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">
                  {company?.name || 'Operadora'}
                </h3>
                <p className="text-xs text-gray-500">Plano de Saúde</p>
              </div>
            </div>
            <Badge className={`text-xs ${getQualityColor(lead.quality)}`}>
              {lead.quality === 'high' ? 'Alta' : lead.quality === 'medium' ? 'Média' : 'Baixa'}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500 flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>{daysSinceCreated === 0 ? 'Hoje' : `${daysSinceCreated}d`}</span>
            </div>
            <Badge className={statusBadge.className}>
              {statusBadge.label}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Basic Info */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 flex items-center">
                <MapPin className="w-3 h-3 mr-1" />
                Localização
              </span>
              <span className="font-medium text-gray-900" data-testid={`text-location-${lead.id}`}>
                {lead.city}, {lead.state}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 flex items-center">
                <User className="w-3 h-3 mr-1" />
                Idade
              </span>
              <span className="font-medium text-gray-900">{lead.age} anos</span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Vidas</span>
              <span className="font-medium text-gray-900">{lead.availableLives}</span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Orçamento</span>
              <span className="font-medium text-gray-900">
                R$ {parseFloat(lead.budgetMin).toFixed(0)} - R$ {parseFloat(lead.budgetMax).toFixed(0)}
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1" data-testid={`text-price-${lead.id}`}>
                R$ {parseFloat(lead.price).toFixed(2)}
              </div>
              <p className="text-xs text-gray-500">Preço do lead</p>
            </div>
          </div>

          {/* Action Button */}
          {canPurchase ? (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                setShowPurchaseModal(true);
              }}
              disabled={!hasSufficientCredits}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg text-sm transition-all duration-200"
              data-testid={`button-purchase-${lead.id}`}
            >
              {!hasSufficientCredits ? "SALDO INSUFICIENTE" : "COMPRAR AGORA"}
            </Button>
          ) : (
            <div className="w-full bg-red-100 text-red-800 font-semibold py-2 rounded-lg text-sm text-center">
              {lead.status === 'sold' ? 'VENDIDO' : 'INDISPONÍVEL'}
            </div>
          )}
        </div>

        {/* Expandable details - Information that shows when clicked */}
        {isExpanded && (
          <div className="border-t border-gray-100 p-4 bg-gray-50">
            <div className="space-y-3">
              {/* Basic Lead Information - Available to everyone */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Localização</p>
                    <p className="font-medium" data-testid={`text-location-${lead.id}`}>
                      {lead.city}, {lead.state}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Idade</p>
                    <p className="font-medium">{lead.age} anos</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Tipo de Plano</p>
                    <p className="font-medium capitalize">{lead.planType}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Orçamento</p>
                    <p className="font-medium">
                      R$ {parseFloat(lead.budgetMin).toFixed(0)} - R$ {parseFloat(lead.budgetMax).toFixed(0)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Vidas Disponíveis</p>
                    <p className="font-medium">{lead.availableLives} vida{lead.availableLives > 1 ? 's' : ''}</p>
                  </div>
                </div>
              </div>

              {/* Separator */}
              <div className="border-t border-gray-200 pt-3">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Informações de Contato</h4>
                
                {/* Masked Personal Information */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      Nome:
                    </span>
                    <span className="text-gray-400 font-medium" data-testid={`text-lead-info-${lead.id}`}>
                      {maskSensitiveInfo(lead.name, 'name')}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Email:</span>
                    <span className="text-gray-400 font-medium">
                      {maskSensitiveInfo(lead.email, 'email')}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 flex items-center">
                      <Phone className="w-4 h-4 mr-1" />
                      Telefone:
                    </span>
                    <span className="text-gray-400 font-medium" data-testid={`text-phone-masked-${lead.id}`}>
                      {maskSensitiveInfo(lead.phone, 'phone')}
                    </span>
                  </div>
                </div>
                
                {/* Purchase notice */}
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-700 text-center flex items-center justify-center">
                    <span className="mr-1">🔒</span>
                    Informações completas disponíveis após a compra
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action buttons at bottom */}
        <div className="border-t border-gray-100 p-3 flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="flex-1 flex items-center justify-center py-2 text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-50"
          >
            {isExpanded ? (
              <>
                <EyeOff className="w-4 h-4 mr-2" />
                <span className="text-sm">Ocultar</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                <span className="text-sm">Ver mais</span>
              </>
            )}
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowInfoModal(true);
            }}
            className="flex-1 flex items-center justify-center py-2 text-purple-600 hover:text-purple-700 transition-colors rounded-lg hover:bg-purple-50"
          >
            <Star className="w-4 h-4 mr-2" />
            <span className="text-sm">Detalhes</span>
          </button>
        </div>
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

      <LeadInfoModal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        lead={lead}
        companies={companies}
      />
    </>
  );
}
