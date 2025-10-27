import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { AlertCircle, Copy, Check, CreditCard, QrCode, Loader2 } from "lucide-react";

// Extend Window interface for MercadoPago SDK
declare global {
  interface Window {
    MercadoPago: any;
  }
}

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
  paymentMethod: initialPaymentMethod 
}: PaymentModalProps) {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCheckingConfig, setIsCheckingConfig] = useState(true);
  const [isConfigured, setIsConfigured] = useState(true);
  const [configMessage, setConfigMessage] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(initialPaymentMethod);
  
  // Card form states
  const [cardNumber, setCardNumber] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [securityCode, setSecurityCode] = useState("");
  const [installments, setInstallments] = useState(1);
  
  // PIX states
  const [pixData, setPixData] = useState<{
    paymentId: string;
    qrCode: string;
    qrCodeBase64: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [checkingPixStatus, setCheckingPixStatus] = useState(false);
  
  const mpRef = useRef<any>(null);
  const checkPixIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Check Mercado Pago configuration and initialize SDK
  useEffect(() => {
    if (isOpen) {
      checkConfiguration();
    } else {
      // Clean up when modal closes
      if (checkPixIntervalRef.current) {
        clearInterval(checkPixIntervalRef.current);
        checkPixIntervalRef.current = null;
      }
      setPixData(null);
      resetForm();
    }
  }, [isOpen]);

  const checkConfiguration = async () => {
    try {
      setIsCheckingConfig(true);
      const response = await apiRequest("GET", "/api/payment/config");
      const data = await response.json();
      setIsConfigured(data.configured);
      setConfigMessage(data.message);
      setPublicKey(data.publicKey);
      
      // Initialize Mercado Pago SDK
      if (data.configured && data.publicKey && window.MercadoPago) {
        mpRef.current = new window.MercadoPago(data.publicKey, {
          locale: 'pt-BR'
        });
        console.log("✅ Mercado Pago SDK inicializado");
      }
    } catch (error: any) {
      console.error("❌ Erro ao verificar configuração:", error);
      setIsConfigured(false);
      setConfigMessage(error.status === 401 
        ? "Sessão expirada. Faça login novamente." 
        : "Erro ao verificar configuração do Mercado Pago"
      );
    } finally {
      setIsCheckingConfig(false);
    }
  };

  const resetForm = () => {
    setCardNumber("");
    setCardholderName("");
    setExpirationDate("");
    setSecurityCode("");
    setInstallments(1);
  };

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted.substring(0, 19); // max 16 digits + 3 spaces
  };

  const formatExpirationDate = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length >= 2) {
      return digits.substring(0, 2) + '/' + digits.substring(2, 4);
    }
    return digits;
  };

  const handleCardPayment = async () => {
    if (!mpRef.current) {
      toast({
        title: "Erro",
        description: "SDK do Mercado Pago não está carregado",
        variant: "destructive",
      });
      return;
    }

    // Validate form
    if (!cardNumber || !cardholderName || !expirationDate || !securityCode) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os dados do cartão",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const [expirationMonth, expirationYear] = expirationDate.split('/');
      
      // Create card token using Mercado Pago SDK
      const cardToken = await mpRef.current.createCardToken({
        cardNumber: cardNumber.replace(/\s/g, ''),
        cardholderName,
        cardExpirationMonth: expirationMonth,
        cardExpirationYear: `20${expirationYear}`,
        securityCode,
      });

      console.log("🔐 Token do cartão criado:", cardToken.id);

      // Get payment method ID
      const bin = cardNumber.replace(/\s/g, '').substring(0, 6);
      const paymentMethods = await mpRef.current.getPaymentMethods({ bin });
      const paymentMethodId = paymentMethods.results[0]?.id;

      if (!paymentMethodId) {
        throw new Error("Não foi possível identificar a bandeira do cartão");
      }

      // Process payment on backend
      const response = await apiRequest("POST", "/api/payment/process-card", {
        amount,
        token: cardToken.id,
        paymentMethodId,
        installments,
        payer: {
          email: user?.email || 'cliente@keepleads.com',
          firstName: user?.firstName || cardholderName.split(' ')[0],
          lastName: user?.lastName || cardholderName.split(' ').slice(1).join(' '),
        }
      });

      const result = await response.json();

      if (result.approved) {
        toast({
          title: "Pagamento aprovado!",
          description: `Seus créditos foram adicionados com sucesso.`,
        });
        onPaymentComplete(result.paymentId);
        onClose();
      } else {
        toast({
          title: "Pagamento não aprovado",
          description: `Status: ${result.statusDetail}`,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("❌ Erro no pagamento:", error);
      toast({
        title: "Erro no pagamento",
        description: error.message || "Não foi possível processar o pagamento",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePixPayment = async () => {
    setIsProcessing(true);

    try {
      const response = await apiRequest("POST", "/api/payment/create-pix", {
        amount
      });

      const result = await response.json();

      if (result.qrCode) {
        setPixData({
          paymentId: result.paymentId,
          qrCode: result.qrCode,
          qrCodeBase64: result.qrCodeBase64
        });

        // Start checking payment status
        startCheckingPixStatus(result.paymentId);
        
        toast({
          title: "QR Code gerado!",
          description: "Escaneie o QR Code ou copie o código PIX para pagar",
        });
      } else {
        throw new Error("Não foi possível gerar o QR Code PIX");
      }
    } catch (error: any) {
      console.error("❌ Erro ao criar PIX:", error);
      toast({
        title: "Erro ao gerar PIX",
        description: error.message || "Não foi possível gerar o pagamento PIX",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const startCheckingPixStatus = (paymentId: string) => {
    setCheckingPixStatus(true);
    
    // Check every 3 seconds
    checkPixIntervalRef.current = setInterval(async () => {
      try {
        const response = await apiRequest("GET", `/api/payment/status/${paymentId}`);
        const status = await response.json();

        if (status.approved) {
          // Payment approved!
          if (checkPixIntervalRef.current) {
            clearInterval(checkPixIntervalRef.current);
            checkPixIntervalRef.current = null;
          }
          
          toast({
            title: "Pagamento confirmado!",
            description: "Seus créditos foram adicionados com sucesso.",
          });
          
          onPaymentComplete(paymentId);
          onClose();
        }
      } catch (error) {
        console.error("Erro ao verificar status:", error);
      }
    }, 3000);
  };

  const copyPixCode = () => {
    if (pixData?.qrCode) {
      navigator.clipboard.writeText(pixData.qrCode);
      setCopied(true);
      toast({
        title: "Código copiado!",
        description: "Cole no seu app de pagamentos",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="modal-payment">
        <DialogHeader>
          <DialogTitle>Adicionar Créditos</DialogTitle>
          <DialogDescription>
            Escolha a forma de pagamento para adicionar R$ {amount.toFixed(2)} em créditos
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Configuration Status */}
          {isCheckingConfig ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
              <p className="text-slate-600 text-sm">Verificando configuração...</p>
            </div>
          ) : !isConfigured ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{configMessage}</AlertDescription>
            </Alert>
          ) : (
            <>
              {/* Amount Display */}
              <div className="bg-primary/10 rounded-lg p-6 text-center">
                <p className="text-sm text-slate-600 mb-2">Valor a adicionar:</p>
                <p className="text-4xl font-bold text-primary" data-testid="text-payment-amount">
                  R$ {amount.toFixed(2)}
                </p>
              </div>

              {/* Payment Methods Tabs */}
              <Tabs value={paymentMethod} onValueChange={setPaymentMethod} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="credit_card" data-testid="tab-credit-card">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Cartão de Crédito
                  </TabsTrigger>
                  <TabsTrigger value="pix" data-testid="tab-pix">
                    <QrCode className="w-4 h-4 mr-2" />
                    PIX
                  </TabsTrigger>
                </TabsList>

                {/* Credit Card Form */}
                <TabsContent value="credit_card" className="space-y-4 mt-6">
                  {pixData ? (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Você tem um pagamento PIX pendente. Finalize-o ou mude para o método de cartão.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="cardNumber">Número do Cartão *</Label>
                        <Input
                          id="cardNumber"
                          data-testid="input-card-number"
                          placeholder="0000 0000 0000 0000"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                          maxLength={19}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cardholderName">Nome do Titular *</Label>
                        <Input
                          id="cardholderName"
                          data-testid="input-cardholder-name"
                          placeholder="COMO ESTÁ NO CARTÃO"
                          value={cardholderName}
                          onChange={(e) => setCardholderName(e.target.value.toUpperCase())}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expirationDate">Validade *</Label>
                          <Input
                            id="expirationDate"
                            data-testid="input-expiration"
                            placeholder="MM/AA"
                            value={expirationDate}
                            onChange={(e) => setExpirationDate(formatExpirationDate(e.target.value))}
                            maxLength={5}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="securityCode">CVV *</Label>
                          <Input
                            id="securityCode"
                            data-testid="input-cvv"
                            placeholder="123"
                            type="password"
                            value={securityCode}
                            onChange={(e) => setSecurityCode(e.target.value.replace(/\D/g, '').substring(0, 4))}
                            maxLength={4}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="installments">Parcelas</Label>
                        <select
                          id="installments"
                          data-testid="select-installments"
                          className="w-full h-12 px-4 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          value={installments}
                          onChange={(e) => setInstallments(Number(e.target.value))}
                        >
                          {Array.from({ length: 12 }, (_, i) => i + 1).map(num => (
                            <option key={num} value={num}>
                              {num}x de R$ {(amount / num).toFixed(2)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <Button
                        onClick={handleCardPayment}
                        disabled={isProcessing}
                        className="w-full h-12"
                        data-testid="button-pay-card"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processando...
                          </>
                        ) : (
                          `Pagar R$ ${amount.toFixed(2)}`
                        )}
                      </Button>

                      <p className="text-xs text-gray-500 text-center">
                        🔒 Pagamento seguro processado pelo Mercado Pago
                      </p>
                    </>
                  )}
                </TabsContent>

                {/* PIX Form */}
                <TabsContent value="pix" className="space-y-4 mt-6">
                  {pixData ? (
                    <div className="space-y-6">
                      <div className="text-center space-y-4">
                        <p className="font-medium">Escaneie o QR Code com seu app de pagamentos</p>
                        
                        {/* QR Code Image */}
                        {pixData.qrCodeBase64 && (
                          <div className="flex justify-center">
                            <img 
                              src={`data:image/png;base64,${pixData.qrCodeBase64}`}
                              alt="QR Code PIX"
                              className="w-64 h-64 border-2 border-dashed border-gray-300 rounded-lg p-4"
                            />
                          </div>
                        )}

                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">Ou copie o código PIX:</p>
                          <div className="flex gap-2">
                            <Input
                              value={pixData.qrCode}
                              readOnly
                              className="font-mono text-xs"
                              data-testid="input-pix-code"
                            />
                            <Button
                              onClick={copyPixCode}
                              variant="outline"
                              size="icon"
                              data-testid="button-copy-pix"
                            >
                              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </Button>
                          </div>
                        </div>

                        {checkingPixStatus && (
                          <Alert>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <AlertDescription>
                              Aguardando confirmação do pagamento...
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>

                      <Button
                        onClick={onClose}
                        variant="outline"
                        className="w-full"
                        data-testid="button-cancel-pix"
                      >
                        Cancelar
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="text-center py-8 space-y-4">
                        <QrCode className="w-16 h-16 mx-auto text-primary" />
                        <div>
                          <h3 className="font-semibold text-lg">Pagamento via PIX</h3>
                          <p className="text-sm text-gray-600">
                            Gere o QR Code e pague instantaneamente
                          </p>
                        </div>
                      </div>

                      <Button
                        onClick={handlePixPayment}
                        disabled={isProcessing}
                        className="w-full h-12"
                        data-testid="button-generate-pix"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Gerando QR Code...
                          </>
                        ) : (
                          `Gerar QR Code PIX - R$ ${amount.toFixed(2)}`
                        )}
                      </Button>

                      <p className="text-xs text-gray-500 text-center">
                        🔒 Pagamento seguro processado pelo Mercado Pago
                      </p>
                    </>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
