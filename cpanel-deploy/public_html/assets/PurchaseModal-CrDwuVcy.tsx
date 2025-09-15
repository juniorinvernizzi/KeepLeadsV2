import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Lead {
  id: string;
  name: string;
  age: number;
  city: string;
  state: string;
  price: string;
}

interface Company {
  id: string;
  name: string;
  color: string;
}

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  lead: Lead;
  company: Company;
  userCredits: number;
  isLoading: boolean;
}

export default function PurchaseModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  lead, 
  company, 
  userCredits, 
  isLoading 
}: PurchaseModalProps) {
  const leadPrice = parseFloat(lead.price);
  const balanceAfter = userCredits - leadPrice;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" data-testid="modal-purchase">
        <DialogHeader>
          <DialogTitle>Confirmar Compra</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Lead Preview */}
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-600">Lead selecionado:</span>
              <Badge className="bg-green-100 text-green-800">Disponível</Badge>
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <svg className="w-4 h-4 text-slate-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                <span className="text-slate-700 font-medium" data-testid="text-lead-name">
                  {lead.name.split(' ')[0]} {lead.name.split(' ')[1]?.[0]}. - {lead.age} anos
                </span>
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 text-slate-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4z" />
                </svg>
                <span className="text-slate-700" data-testid="text-company-name">
                  {company.name} - Plano de Saúde
                </span>
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 text-slate-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span className="text-slate-700" data-testid="text-location">
                  {lead.city}, {lead.state}
                </span>
              </div>
            </div>
          </div>

          {/* Price Details */}
          <div className="border-t border-slate-200 pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600">Preço do lead:</span>
              <span className="font-medium text-slate-800" data-testid="text-lead-price">
                R$ {leadPrice.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600">Taxa de processamento:</span>
              <span className="font-medium text-slate-800">R$ 0,00</span>
            </div>
            <div className="flex items-center justify-between text-lg font-semibold border-t border-slate-200 pt-2">
              <span className="text-slate-800">Total:</span>
              <span className="text-primary" data-testid="text-total-price">
                R$ {leadPrice.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Balance Check */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">Seu saldo atual:</p>
                <p className="text-lg font-bold text-blue-900" data-testid="text-current-balance">
                  R$ {userCredits.toFixed(2)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-600">Saldo após compra:</p>
                <p className="text-lg font-bold text-blue-900" data-testid="text-balance-after">
                  R$ {balanceAfter.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isLoading}
              data-testid="button-cancel"
            >
              Cancelar
            </Button>
            <Button
              className="flex-1"
              onClick={onConfirm}
              disabled={isLoading || balanceAfter < 0}
              data-testid="button-confirm-purchase"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processando...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                  </svg>
                  Comprar Lead
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
