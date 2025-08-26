import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import PaymentModal from "@/components/PaymentModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CreditTransaction {
  id: string;
  userId: string;
  type: string;
  amount: string;
  description: string;
  balanceBefore: string;
  balanceAfter: string;
  paymentMethod: string | null;
  paymentId: string | null;
  createdAt: string;
}

export default function Credits() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const { data: transactions = [], isLoading } = useQuery<CreditTransaction[]>({
    queryKey: ["/api/transactions"],
    enabled: !!user,
  });

  const addCreditsMutation = useMutation({
    mutationFn: async (data: { amount: number; paymentMethod: string; paymentId: string }) => {
      return await apiRequest("POST", "/api/credits/add", data);
    },
    onSuccess: () => {
      toast({
        title: "Créditos adicionados!",
        description: "Os créditos foram adicionados com sucesso à sua conta.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      setShowPaymentModal(false);
      setSelectedAmount(null);
      setCustomAmount("");
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao adicionar créditos",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const predefinedAmounts = [
    { value: 50, label: "R$ 50,00", description: "~1 lead" },
    { value: 100, label: "R$ 100,00", description: "~2 leads" },
    { value: 250, label: "R$ 250,00", description: "~5 leads" },
    { value: 500, label: "R$ 500,00", description: "~10 leads", popular: true },
  ];

  const handleSelectAmount = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setSelectedAmount(null);
  };

  const getAmountToAdd = () => {
    if (selectedAmount) return selectedAmount;
    if (customAmount) return parseFloat(customAmount);
    return 0;
  };

  const handleAddCredits = () => {
    const amount = getAmountToAdd();
    if (amount < 10) {
      toast({
        title: "Valor mínimo",
        description: "O valor mínimo para depósito é R$ 10,00.",
        variant: "destructive",
      });
      return;
    }
    setShowPaymentModal(true);
  };

  const handlePaymentComplete = (paymentId: string) => {
    const amount = getAmountToAdd();
    addCreditsMutation.mutate({
      amount,
      paymentMethod,
      paymentId,
    });
  };

  const getTransactionIcon = (type: string) => {
    if (type === "deposit") {
      return (
        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
        </div>
      );
    } else {
      return (
        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
          <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }
  };

  const getTransactionAmountClass = (type: string) => {
    return type === "deposit" ? "text-green-600" : "text-red-600";
  };

  const formatAmount = (amount: string, type: string) => {
    const prefix = type === "deposit" ? "+" : "-";
    return `${prefix}R$ ${parseFloat(amount).toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="w-4/5 mx-auto py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/3 mb-8"></div>
            <div className="bg-slate-200 rounded-xl h-32 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-slate-200 rounded-xl h-96"></div>
              <div className="bg-slate-200 rounded-xl h-96"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-4/5 mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2" data-testid="text-page-title">
            Gerenciar Créditos
          </h1>
          <p className="text-slate-600">Adicione créditos para comprar leads ou visualize seu histórico</p>
        </div>

        {/* Current Balance */}
        <div className="bg-gradient-to-r from-primary to-primary-light rounded-xl text-white p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Saldo atual</p>
              <p className="text-4xl font-bold" data-testid="text-current-balance">
                R$ {parseFloat(user?.credits || "0").toFixed(2)}
              </p>
              <p className="text-purple-100 text-sm mt-1">
                Último depósito: {transactions.length > 0 
                  ? formatDistanceToNow(new Date(transactions.find(t => t.type === "deposit")?.createdAt || new Date()), { addSuffix: true, locale: ptBR })
                  : "Nunca"
                }
              </p>
            </div>
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add Credits */}
          <Card>
            <CardHeader>
              <CardTitle>Adicionar Créditos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Predefined Amounts */}
              <div className="grid grid-cols-2 gap-3">
                {predefinedAmounts.map((amount) => (
                  <button
                    key={amount.value}
                    onClick={() => handleSelectAmount(amount.value)}
                    className={`p-4 border-2 rounded-lg transition-colors text-center ${
                      selectedAmount === amount.value
                        ? "border-primary bg-purple-50"
                        : "border-slate-200 hover:border-primary hover:bg-purple-50"
                    } ${amount.popular ? "border-primary bg-purple-50" : ""}`}
                    data-testid={`button-amount-${amount.value}`}
                  >
                    <div className="text-lg font-semibold text-slate-800">{amount.label}</div>
                    <div className={`text-sm ${amount.popular ? "text-primary font-medium" : "text-slate-500"}`}>
                      {amount.description}
                      {amount.popular && " • Popular"}
                    </div>
                  </button>
                ))}
              </div>

              {/* Custom Amount */}
              <div className="space-y-2">
                <Label htmlFor="customAmount">Valor personalizado</Label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-500">R$</span>
                  <Input
                    id="customAmount"
                    type="number"
                    placeholder="0,00"
                    min="10"
                    value={customAmount}
                    onChange={(e) => handleCustomAmountChange(e.target.value)}
                    className="pl-10"
                    data-testid="input-custom-amount"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-3">
                <Label>Método de pagamento</Label>
                <div className="space-y-2">
                  <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    paymentMethod === "credit_card" ? "border-primary bg-purple-50" : "border-slate-200 hover:bg-slate-50"
                  }`}>
                    <input
                      type="radio"
                      name="payment"
                      value="credit_card"
                      checked={paymentMethod === "credit_card"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-primary"
                      data-testid="radio-credit-card"
                    />
                    <div className="ml-3 flex items-center">
                      <svg className="w-5 h-5 text-slate-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2v1h12V6H4zm0 3v5h12V9H4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-slate-700">Cartão de Crédito</span>
                    </div>
                  </label>
                  <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    paymentMethod === "pix" ? "border-primary bg-purple-50" : "border-slate-200 hover:bg-slate-50"
                  }`}>
                    <input
                      type="radio"
                      name="payment"
                      value="pix"
                      checked={paymentMethod === "pix"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-primary"
                      data-testid="radio-pix"
                    />
                    <div className="ml-3 flex items-center">
                      <svg className="w-5 h-5 text-slate-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3z" clipRule="evenodd" />
                      </svg>
                      <span className="text-slate-700">PIX</span>
                      <Badge className="ml-2 bg-green-100 text-green-800 text-xs">
                        Instantâneo
                      </Badge>
                    </div>
                  </label>
                </div>
              </div>

              <Button 
                className="w-full" 
                onClick={handleAddCredits}
                disabled={getAmountToAdd() < 10}
                data-testid="button-add-credits"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Adicionar Créditos
              </Button>
            </CardContent>
          </Card>

          {/* Transaction History */}
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Transações</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-slate-600" data-testid="text-no-transactions">
                    Nenhuma transação encontrada
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.slice(0, 10).map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                      data-testid={`transaction-${transaction.id}`}
                    >
                      <div className="flex items-center">
                        {getTransactionIcon(transaction.type)}
                        <div>
                          <div className="text-sm font-medium text-slate-900" data-testid={`text-description-${transaction.id}`}>
                            {transaction.description}
                          </div>
                          <div className="text-xs text-slate-500" data-testid={`text-date-${transaction.id}`}>
                            {formatDistanceToNow(new Date(transaction.createdAt), { addSuffix: true, locale: ptBR })}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-semibold ${getTransactionAmountClass(transaction.type)}`} data-testid={`text-amount-${transaction.id}`}>
                          {formatAmount(transaction.amount, transaction.type)}
                        </div>
                        <div className="text-xs text-slate-500">Aprovado</div>
                      </div>
                    </div>
                  ))}

                  {transactions.length > 10 && (
                    <div className="pt-4 border-t border-slate-200">
                      <Button variant="ghost" className="w-full text-primary hover:text-primary-dark" data-testid="button-view-all">
                        Ver todo o histórico
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Payment Modal */}
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onPaymentComplete={handlePaymentComplete}
          amount={getAmountToAdd()}
          paymentMethod={paymentMethod}
        />
      </div>
    </Layout>
  );
}
