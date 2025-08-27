import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentComplete: (paymentId: string) => void;
  amount: number;
  paymentMethod: string;
}

export default function PaymentModal({ 
  isOpen, 
  onClose, 
  onPaymentComplete, 
  amount, 
  paymentMethod 
}: PaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const { toast } = useToast();

  const handlePayment = async () => {
    if (paymentMethod === "credit_card") {
      if (!cardNumber || !expiryDate || !cvv || !cardName) {
        toast({
          title: "Campos obrigatórios",
          description: "Por favor, preencha todos os campos do cartão.",
          variant: "destructive",
        });
        return;
      }
    }

    setIsProcessing(true);
    
    try {
      // Create payment preference with Mercado Pago
      const response = await apiRequest("POST", "/api/payment/create-preference", {
        amount,
        paymentMethod,
      });

      if ((response as any).initPoint) {
        // For development, we'll redirect to Mercado Pago
        // In production, you might want to open in a new window or embed the checkout
        window.open((response as any).initPoint, '_blank');
        
        // For now, simulate successful payment after opening checkout
        setTimeout(() => {
          const paymentId = `mp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          onPaymentComplete(paymentId);
          setIsProcessing(false);
          
          // Reset form
          setCardNumber("");
          setExpiryDate("");
          setCvv("");
          setCardName("");
          
          toast({
            title: "Redirecionamento realizado",
            description: "Você foi redirecionado para o Mercado Pago. Complete o pagamento na nova aba.",
          });
        }, 2000);
      }
    } catch (error: any) {
      setIsProcessing(false);
      toast({
        title: "Erro no pagamento",
        description: error.message || "Não foi possível processar o pagamento. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const formatCardNumber = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    // Add spaces every 4 digits
    const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted;
  };

  const formatExpiryDate = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    // Add slash after 2 digits
    if (digits.length >= 2) {
      return digits.slice(0, 2) + '/' + digits.slice(2, 4);
    }
    return digits;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" data-testid="modal-payment">
        <DialogHeader>
          <DialogTitle>Adicionar Créditos</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Amount Summary */}
          <div className="bg-primary-light bg-opacity-10 rounded-lg p-4">
            <div className="text-center">
              <p className="text-sm text-slate-600 mb-1">Valor a adicionar:</p>
              <p className="text-3xl font-bold text-primary" data-testid="text-payment-amount">
                R$ {amount.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Payment Form */}
          {paymentMethod === "credit_card" ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Número do cartão</Label>
                <Input
                  id="cardNumber"
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  maxLength={19}
                  data-testid="input-card-number"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Validade</Label>
                  <Input
                    id="expiryDate"
                    type="text"
                    placeholder="MM/AA"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                    maxLength={5}
                    data-testid="input-expiry-date"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    type="text"
                    placeholder="123"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    maxLength={4}
                    data-testid="input-cvv"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cardName">Nome no cartão</Label>
                <Input
                  id="cardName"
                  type="text"
                  placeholder="João Silva"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  data-testid="input-card-name"
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">Pagamento via PIX</h3>
              <p className="text-slate-600 mb-4">
                Você será redirecionado para o ambiente seguro do Mercado Pago para finalizar o pagamento.
              </p>
              <Badge className="bg-green-100 text-green-800">
                Aprovação instantânea
              </Badge>
            </div>
          )}

          {/* Security Notice */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-green-800">Pagamento 100% seguro via Mercado Pago</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isProcessing}
              data-testid="button-cancel-payment"
            >
              Cancelar
            </Button>
            <Button
              className="flex-1"
              onClick={handlePayment}
              disabled={isProcessing || (paymentMethod === "credit_card" && (!cardNumber || !expiryDate || !cvv || !cardName))}
              data-testid="button-process-payment"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processando...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2v1h12V6H4zm0 3v5h12V9H4z" clipRule="evenodd" />
                  </svg>
                  Pagar R$ {amount.toFixed(2)}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
