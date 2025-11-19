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
import {
  MapPin,
  User,
  Users,
  CreditCard,
  Star,
  Shield,
  Clock,
  ArrowRight,
} from "lucide-react";

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

export default function LeadCard({
  lead,
  companies,
  onPurchase,
}: LeadCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  const company = companies.find((c) => c.id === lead.insuranceCompanyId) || {
    id: lead.insuranceCompanyId,
    name: lead.insuranceCompanyId,
    color: "#7C3AED",
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
      // Invalidate all related queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/simple-auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/my-leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      // Also refetch immediately to ensure fresh data
      queryClient.refetchQueries({ queryKey: ["/api/simple-auth/user"] });
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
        description:
          "Você não possui créditos suficientes para comprar este lead.",
        variant: "destructive",
      });
      return;
    }
    purchaseMutation.mutate();
  };

  const getQualityBadge = () => {
    switch (lead.quality) {
      case "gold":
        return {
          label: "Ouro",
          color: "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white",
          icon: <Star className="w-3 h-3" />,
        };
      case "silver":
        return {
          label: "Prata",
          color: "bg-gradient-to-r from-gray-500 to-gray-600 text-white",
          icon: <Shield className="w-3 h-3" />,
        };
      case "bronze":
        return {
          label: "Bronze",
          color: "bg-gradient-to-r from-orange-500 to-orange-600 text-white",
          icon: <Clock className="w-3 h-3" />,
        };
      default:
        return {
          label: "Padrão",
          color: "bg-gradient-to-r from-gray-500 to-gray-600 text-white",
          icon: <Shield className="w-3 h-3" />,
        };
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
        <div className="relative bg-gradient-to-br from-gray-600 via-gray-600 to-gray-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-white text-sm">
                Plano de Saúde
              </h3>
              <p className="text-xs text-purple-100">Lead Qualificado</p>
            </div>
            <div
              className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${qualityBadge.color}`}
            >
              {qualityBadge.icon}
              <span>{qualityBadge.label}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-purple-100">
            <MapPin className="w-4 h-4" />
            <span
              className="text-sm font-medium"
              data-testid={`text-location-${lead.id}`}
            >
              {lead.city ? `${lead.city}, ${lead.state}` : lead.state}
            </span>
          </div>
        </div>

        <CardContent className="p-4 sm:p-6">
          {/* Informações principais em grid moderno */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg sm:rounded-xl p-2 sm:p-3 border border-emerald-100">
              <div className="flex items-center space-x-1 mb-1">
                <Users className="w-3 h-3 text-emerald-600" />
                <span className="text-[10px] sm:text-xs font-medium text-emerald-600">
                  Vidas
                </span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-gray-900">
                {lead.availableLives}
              </p>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg sm:rounded-xl p-2 sm:p-3 border border-orange-100">
              <div className="flex items-center space-x-1 mb-1">
                <CreditCard className="w-3 h-3 text-orange-600" />
                <span className="text-[10px] sm:text-xs font-medium text-orange-600">
                  Plano
                </span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-gray-900 capitalize truncate">
                {lead.planType}
              </p>
            </div>
          </div>

          {/* Preço com destaque especial */}
          <div className="relative bg-gradient-to-br from-gray-100 to-gray-20 rounded-xl p-4 sm:p-5 mb-4 sm:mb-6 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-200/50 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
            <div className="relative text-center">
              <p className="text-[10px] sm:text-xs text-gray-800 mb-1">
                Valor do lead
              </p>
              <div
                className="text-2xl sm:text-3xl font-bold text-gray-800"
                data-testid={`text-price-${lead.id}`}
              >
                R$ {parseFloat(lead.price).toFixed(2)}
              </div>
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
              <span>
                {!hasSufficientCredits ? "SALDO INSUFICIENTE" : "COMPRAR AGORA"}
              </span>
              {hasSufficientCredits && (
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              )}
            </Button>
          ) : (
            <div className="w-full h-12 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl flex items-center justify-center">
              {lead.status === "sold" ? "VENDIDO" : "INDISPONÍVEL"}
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
