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

  const company = companies.find(c => c.id === lead.insuranceCompanyId) || {
    id: lead.insuranceCompanyId,
    name: lead.insuranceCompanyId,
    color: "#7C3AED"
  };

  const purchaseMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/leads/${lead.id}/purchase`, {});
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

  return (
    <>
      <Card className="overflow-hidden hover:shadow-md transition-shadow" data-testid={`card-lead-${lead.id}`}>
        {/* Company Logo Header */}
        <div className={`${colors.bg} p-4 flex items-center justify-between`}>
          <div className="text-white">
            <div className="text-2xl font-bold">{company.name}</div>
            <div className={`${colors.text} text-sm`}>Plano de Saúde</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white" data-testid={`text-price-${lead.id}`}>
              R$ {parseFloat(lead.price).toFixed(2)}
            </div>
            {canPurchase && (
              <Button
                onClick={() => setShowPurchaseModal(true)}
                className={`mt-2 ${colors.button} px-4 py-2 rounded-lg font-semibold transition-colors text-sm`}
                disabled={!hasSufficientCredits}
                data-testid={`button-purchase-${lead.id}`}
              >
                {!hasSufficientCredits ? "SALDO INSUFICIENTE" : "COMPRAR AGORA"}
              </Button>
            )}
          </div>
        </div>
        
        {/* Lead Info */}
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <Badge className={statusBadge.className} data-testid={`text-status-${lead.id}`}>
              {statusBadge.label}
            </Badge>
            <span className="text-xs text-slate-500" data-testid={`text-time-${lead.id}`}>
              {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true, locale: ptBR })}
            </span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <svg className="w-4 h-4 text-slate-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              <span className="text-slate-600" data-testid={`text-lead-info-${lead.id}`}>
                {lead.name.split(' ')[0]} {lead.name.split(' ')[1]?.[0]}. - {lead.age} anos
              </span>
            </div>
            <div className="flex items-center text-sm">
              <svg className="w-4 h-4 text-slate-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span className="text-slate-600" data-testid={`text-location-${lead.id}`}>
                {lead.city}, {lead.state}
              </span>
            </div>
            <div className="flex items-center text-sm">
              <svg className="w-4 h-4 text-slate-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              <span className="text-slate-600" data-testid={`text-phone-masked-${lead.id}`}>
                Tel: ({lead.phone.slice(0, 2)}) 9****-****
              </span>
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <Button 
              variant="ghost"
              onClick={() => setShowDetailsModal(true)}
              className="text-primary hover:text-primary-dark text-sm font-medium p-0 h-auto"
              data-testid={`button-details-${lead.id}`}
            >
              Ver detalhes
            </Button>
            {canPurchase && (
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-500 hover:text-slate-700 p-2 h-auto"
                data-testid={`button-add-cart-${lead.id}`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                </svg>
              </Button>
            )}
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
