import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  city: string;
  state: string;
  planType: string;
  budgetMin: string;
  budgetMax: string;
  source: string;
  campaign: string;
  quality: string;
  price: string;
  createdAt: string;
}

interface Company {
  id: string;
  name: string;
  color: string;
}

interface LeadDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
  company: Company;
  onPurchase: () => void;
  canPurchase: boolean;
}

export default function LeadDetailsModal({ 
  isOpen, 
  onClose, 
  lead, 
  company, 
  onPurchase, 
  canPurchase 
}: LeadDetailsModalProps) {
  const getQualityBadge = (quality: string) => {
    const qualityMap: Record<string, { label: string; className: string }> = {
      high: { label: "Alta", className: "bg-green-100 text-green-800" },
      medium: { label: "Média", className: "bg-yellow-100 text-yellow-800" },
      low: { label: "Baixa", className: "bg-red-100 text-red-800" },
    };
    return qualityMap[quality] || { label: quality, className: "bg-gray-100 text-gray-800" };
  };

  const qualityBadge = getQualityBadge(lead.quality);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg" data-testid="modal-lead-details">
        <DialogHeader>
          <DialogTitle>Detalhes do Lead</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div>
            <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">
              Informações Básicas
            </h4>
            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600">Nome:</span>
                <span className="font-medium text-slate-800" data-testid="text-lead-full-name">
                  {lead.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Idade:</span>
                <span className="font-medium text-slate-800" data-testid="text-lead-age">
                  {lead.age} anos
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Telefone:</span>
                <span className="font-medium text-slate-800" data-testid="text-lead-phone">
                  {lead.phone}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">E-mail:</span>
                <span className="font-medium text-slate-800" data-testid="text-lead-email">
                  {lead.email}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Cidade:</span>
                <span className="font-medium text-slate-800" data-testid="text-lead-city">
                  {lead.city}, {lead.state}
                </span>
              </div>
            </div>
          </div>

          {/* Insurance Info */}
          <div>
            <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">
              Interesse
            </h4>
            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600">Operadora:</span>
                <span className="font-medium text-slate-800" data-testid="text-insurance-company">
                  {company.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Tipo de Plano:</span>
                <span className="font-medium text-slate-800" data-testid="text-plan-type">
                  {lead.planType === "individual" ? "Individual" : 
                   lead.planType === "family" ? "Familiar" : 
                   lead.planType === "corporate" ? "Empresarial" : lead.planType}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Orçamento:</span>
                <span className="font-medium text-slate-800" data-testid="text-budget">
                  {lead.budgetMin && lead.budgetMax 
                    ? `R$ ${parseFloat(lead.budgetMin).toFixed(0)} - R$ ${parseFloat(lead.budgetMax).toFixed(0)}`
                    : "Não informado"
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Lead Source */}
          <div>
            <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">
              Origem do Lead
            </h4>
            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600">Fonte:</span>
                <span className="font-medium text-slate-800" data-testid="text-source">
                  {lead.source}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Campanha:</span>
                <span className="font-medium text-slate-800" data-testid="text-campaign">
                  {lead.campaign || "Não informado"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Data/Hora:</span>
                <span className="font-medium text-slate-800" data-testid="text-created-date">
                  {new Date(lead.createdAt).toLocaleString('pt-BR')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Qualidade:</span>
                <Badge className={qualityBadge.className} data-testid="text-quality">
                  {qualityBadge.label}
                </Badge>
              </div>
            </div>
          </div>

          {/* Price and Actions */}
          <div className="border-t border-slate-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold text-slate-800">Preço:</span>
              <span className="text-2xl font-bold text-primary" data-testid="text-price">
                R$ {parseFloat(lead.price).toFixed(2)}
              </span>
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={onClose}
                data-testid="button-close-details"
              >
                Fechar
              </Button>
              {canPurchase && (
                <Button 
                  className="flex-1" 
                  onClick={onPurchase}
                  data-testid="button-purchase-from-details"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                  </svg>
                  Comprar
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
