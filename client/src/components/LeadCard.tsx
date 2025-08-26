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
import { MapPin, User, Users, CreditCard } from "lucide-react";

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

  return (
    <>
      <Card 
        className="w-full bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 cursor-pointer" 
        data-testid={`card-lead-${lead.id}`}
        onClick={() => setShowInfoModal(true)}
      >
        <CardContent className="p-6">
          {/* Localização */}
          <div className="flex items-center space-x-2 mb-4">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span className="text-gray-900 font-medium" data-testid={`text-location-${lead.id}`}>
              {lead.city}, {lead.state}
            </span>
          </div>

          {/* Informações em Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Idade</p>
                <p className="font-semibold text-gray-900">{lead.age} anos</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Vidas</p>
                <p className="font-semibold text-gray-900">{lead.availableLives}</p>
              </div>
            </div>
          </div>

          {/* Tipo de Plano */}
          <div className="flex items-center space-x-2 mb-4">
            <CreditCard className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">Tipo de Plano</p>
              <p className="font-semibold text-gray-900 capitalize">{lead.planType}</p>
            </div>
          </div>

          {/* Valor */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1" data-testid={`text-price-${lead.id}`}>
                R$ {parseFloat(lead.price).toFixed(2)}
              </div>
              <p className="text-xs text-gray-500">Valor do lead</p>
            </div>
          </div>

          {/* Botão Comprar */}
          {canPurchase ? (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                setShowPurchaseModal(true);
              }}
              disabled={!hasSufficientCredits}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg transition-all duration-200"
              data-testid={`button-purchase-${lead.id}`}
            >
              {!hasSufficientCredits ? "SALDO INSUFICIENTE" : "COMPRAR AGORA"}
            </Button>
          ) : (
            <div className="w-full bg-red-100 text-red-800 font-semibold py-2 rounded-lg text-center">
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