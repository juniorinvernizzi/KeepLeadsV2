import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { AlertCircle } from "lucide-react";

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
  const [isCheckingConfig, setIsCheckingConfig] = useState(true);
  const [isConfigured, setIsConfigured] = useState(true);
  const [configMessage, setConfigMessage] = useState("");
  const { toast } = useToast();

  // Check Mercado Pago configuration when modal opens
  useEffect(() => {
    if (isOpen) {
      checkConfiguration();
    }
  }, [isOpen]);

  const checkConfiguration = async () => {
    try {
      setIsCheckingConfig(true);
      const response = await apiRequest("GET", "/api/payment/config");
      const data = await response.json();
      setIsConfigured(data.configured);
      setConfigMessage(data.message);
      console.log("✅ Configuração do Mercado Pago:", data);
    } catch (error: any) {
      console.error("❌ Erro ao verificar configuração:", error);
      console.error("   - Status:", error.status);
      console.error("   - Message:", error.message);
      
      // Se for erro de autenticação, mostrar mensagem específica
      if (error.status === 401 || error.message === "Unauthorized") {
        setIsConfigured(false);
        setConfigMessage("Sessão expirada. Faça login novamente.");
      } else {
        setIsConfigured(false);
        setConfigMessage("Erro ao verificar configuração do Mercado Pago");
      }
    } finally {
      setIsCheckingConfig(false);
    }
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      // Create payment preference with Mercado Pago
      const response = await apiRequest("POST", "/api/payment/create-preference", {
        amount,
        paymentMethod,
        description: `Compra de R$ ${amount.toFixed(2)} em créditos`,
      });

      const preference = await response.json();

      if (preference.initPoint) {
        // Redirect to Mercado Pago checkout (same window)
        window.location.href = preference.initPoint;
      } else {
        throw new Error("Não foi possível criar o pagamento");
      }
    } catch (error: any) {
      setIsProcessing(false);
      
      // Show detailed error message
      const errorMessage = error.message || "Não foi possível processar o pagamento";
      const errorDetails = error.details ? JSON.stringify(error.details, null, 2) : null;
      
      toast({
        title: "Erro no pagamento",
        description: errorDetails ? `${errorMessage}\n\nDetalhes: ${errorDetails}` : errorMessage,
        variant: "destructive",
      });
      
      console.error("Erro detalhado:", error);
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

          {/* Configuration Status */}
          {isCheckingConfig ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-slate-600 text-sm">Verificando configuração...</p>
            </div>
          ) : !isConfigured ? (
            <Alert variant="destructive" data-testid="alert-not-configured">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Mercado Pago não configurado</strong>
                <p className="mt-1 text-sm">{configMessage}</p>
                <p className="mt-2 text-sm">Entre em contato com o administrador para configurar o MERCADO_PAGO_ACCESS_TOKEN.</p>
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {/* Payment Info */}
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2v1h12V6H4zm0 3v5h12V9H4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  {paymentMethod === "pix" ? "Pagamento via PIX" : "Pagamento via Cartão"}
                </h3>
                <p className="text-slate-600 mb-4">
                  Você será redirecionado para o ambiente seguro do Mercado Pago para finalizar o pagamento.
                </p>
                <Badge className={paymentMethod === "pix" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}>
                  {paymentMethod === "pix" ? "Aprovação instantânea" : "Parcelamento disponível"}
                </Badge>
              </div>

              {/* Security Notice */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-green-800">Pagamento 100% seguro via Mercado Pago</span>
                </div>
              </div>
            </>
          )}

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
              disabled={isProcessing || !isConfigured || isCheckingConfig}
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
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832L14 10.202a1 1 0 000-1.404l-4.445-2.63z" clipRule="evenodd" />
                  </svg>
                  Ir para Mercado Pago
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
