import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import PurchaseModal from "./PurchaseModal";
import LeadInfoModal from "./LeadInfoModal";
import { MapPin, User, Users, CreditCard, Star, Shield, Clock, ArrowRight } from "lucide-react";

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
  const [showInfoModal, setShowInfoModal] = useState(false);

  const company = companies.find(c => c.id === lead.insuranceCompanyId) || {
    id: lead.insuranceCompanyId,
    name: lead.insuranceCompanyId,
    color: "#7C3AED"
  };

  const purchaseMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/leads/${lead.id}/purchase`);
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

  const getQualityBadge = () => {
    switch (lead.quality) {
      case 'high':
        return { label: 'Premium', color: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white', icon: <Star className="w-3 h-3" /> };
      case 'medium':
        return { label: 'Padrão', color: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white', icon: <Shield className="w-3 h-3" /> };
      default:
        return { label: 'Básico', color: 'bg-gradient-to-r from-gray-500 to-gray-600 text-white', icon: <Clock className="w-3 h-3" /> };
    }
  };

  const qualityBadge = getQualityBadge();

  return (
    <>
      <Card 
        className="group relative w-full max-w-sm bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 border-0 overflow-hidden cursor-pointer transform hover:-translate-y-1" 
        data-testid={`card-lead-${lead.id}`}
        onClick={() => setShowInfoModal(true)}
      >
        {/* Header com gradiente */}
        <div className="relative bg-gradient-to-br from-purple-600 via-purple-500 to-indigo-600 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg"
                style={{ backgroundColor: company?.color || '#7C3AED' }}
              >
                {company?.name?.charAt(0) || 'L'}
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">
                  {company?.name || 'Operadora'}
                </h3>
                <p className="text-xs text-purple-100">Plano de Saúde</p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${qualityBadge.color}`}>
              {qualityBadge.icon}
              <span>{qualityBadge.label}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-purple-100">
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-medium" data-testid={`text-location-${lead.id}`}>
                {lead.city}, {lead.state}
              </span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
              <span className="text-xs text-white font-medium">Disponível</span>
            </div>
          </div>
        </div>

        <CardContent className="p-6">
          {/* Informações principais em grid moderno */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-100">
              <div className="flex items-center space-x-2 mb-1">
                <User className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-medium text-blue-600">Idade</span>
              </div>
              <p className="text-lg font-bold text-gray-900">{lead.age} anos</p>
            </div>
            
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-3 border border-emerald-100">
              <div className="flex items-center space-x-2 mb-1">
                <Users className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-medium text-emerald-600">Vidas</span>
              </div>
              <p className="text-lg font-bold text-gray-900">{lead.availableLives}</p>
            </div>
          </div>

          {/* Tipo de Plano com destaque */}
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 mb-6 border border-orange-100">
            <div className="flex items-center space-x-2 mb-2">
              <CreditCard className="w-4 h-4 text-orange-600" />
              <span className="text-xs font-medium text-orange-600 uppercase tracking-wide">Tipo de Plano</span>
            </div>
            <p className="text-lg font-bold text-gray-900 capitalize">{lead.planType}</p>
          </div>

          {/* Preço com destaque especial */}
          <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-5 mb-6 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
            <div className="relative text-center">
              <p className="text-xs text-gray-400 mb-1">Valor do lead</p>
              <div className="text-3xl font-bold text-white mb-1" data-testid={`text-price-${lead.id}`}>
                R$ {parseFloat(lead.price).toFixed(2)}
              </div>
              <p className="text-xs text-gray-400">Orçamento: R$ {parseFloat(lead.budgetMin).toFixed(0)} - R$ {parseFloat(lead.budgetMax).toFixed(0)}</p>
            </div>
          </div>

          {/* Botão de ação moderno */}
          {canPurchase ? (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                setShowPurchaseModal(true);
              }}
              disabled={!hasSufficientCredits}
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 group disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed"
              data-testid={`button-purchase-${lead.id}`}
            >
              <span>{!hasSufficientCredits ? "SALDO INSUFICIENTE" : "COMPRAR AGORA"}</span>
              {hasSufficientCredits && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </Button>
          ) : (
            <div className="w-full h-12 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl flex items-center justify-center">
              {lead.status === 'sold' ? 'VENDIDO' : 'INDISPONÍVEL'}
            </div>
          )}
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

      <LeadInfoModal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        lead={lead}
        companies={companies}
      />
    </>
  );
}