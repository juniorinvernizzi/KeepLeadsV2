import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { Settings, TestTube, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function TestImport() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "Maria Silva Teste",
    email: `teste${Date.now()}@exemplo.com`,
    phone: "11987654321",
    age: "35",
    city: "São Paulo",
    state: "SP",
    income: "3000.00",
    insuranceCompanyId: "unimed",
    category: "health_insurance",
    planType: "family",
    budgetMin: "300.00",
    budgetMax: "600.00",
    availableLives: "3",
    source: "Test Page - Manual",
    campaign: "Teste de Importação",
    notes: "Lead de teste criado pela página de testes"
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleTestImport = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch('/api/leads/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          age: parseInt(formData.age),
          availableLives: parseInt(formData.availableLives)
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResult(data);
        toast({
          title: "Sucesso! ✅",
          description: `Lead importado com ID: ${data.leadId}`,
        });
      } else {
        setError(data.message || "Erro desconhecido");
        toast({
          title: "Erro na importação",
          description: data.message || "Falha ao importar lead",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      setError(err.message || "Erro de conexão");
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao servidor",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== "admin") {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
              <Settings className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">Acesso Restrito</h3>
            <p className="text-slate-500">Esta área é restrita para administradores.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-2">
            <TestTube className="w-8 h-8 text-purple-600" />
            Testar Importação de Leads
          </h1>
          <p className="text-slate-600">
            Use esta página para testar o endpoint /api/leads/import sem precisar de curl ou N8N
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Dados do Lead de Teste</CardTitle>
            <CardDescription>
              Preencha os dados abaixo e clique em "Testar Importação" para enviar ao endpoint
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  data-testid="input-name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  data-testid="input-email"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  data-testid="input-phone"
                />
              </div>
              <div>
                <Label htmlFor="age">Idade *</Label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleInputChange}
                  data-testid="input-age"
                />
              </div>
              <div>
                <Label htmlFor="income">Renda</Label>
                <Input
                  id="income"
                  name="income"
                  value={formData.income}
                  onChange={handleInputChange}
                  data-testid="input-income"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">Cidade *</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  data-testid="input-city"
                />
              </div>
              <div>
                <Label htmlFor="state">Estado *</Label>
                <Input
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  data-testid="input-state"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="insuranceCompanyId">Operadora</Label>
                <Input
                  id="insuranceCompanyId"
                  name="insuranceCompanyId"
                  value={formData.insuranceCompanyId}
                  onChange={handleInputChange}
                  data-testid="input-insurance-company"
                />
              </div>
              <div>
                <Label htmlFor="planType">Tipo de Plano</Label>
                <Input
                  id="planType"
                  name="planType"
                  value={formData.planType}
                  onChange={handleInputChange}
                  data-testid="input-plan-type"
                />
              </div>
              <div>
                <Label htmlFor="availableLives">Vidas</Label>
                <Input
                  id="availableLives"
                  name="availableLives"
                  type="number"
                  value={formData.availableLives}
                  onChange={handleInputChange}
                  data-testid="input-lives"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="budgetMin">Orçamento Min</Label>
                <Input
                  id="budgetMin"
                  name="budgetMin"
                  value={formData.budgetMin}
                  onChange={handleInputChange}
                  data-testid="input-budget-min"
                />
              </div>
              <div>
                <Label htmlFor="budgetMax">Orçamento Max</Label>
                <Input
                  id="budgetMax"
                  name="budgetMax"
                  value={formData.budgetMax}
                  onChange={handleInputChange}
                  data-testid="input-budget-max"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="source">Origem</Label>
                <Input
                  id="source"
                  name="source"
                  value={formData.source}
                  onChange={handleInputChange}
                  data-testid="input-source"
                />
              </div>
              <div>
                <Label htmlFor="campaign">Campanha</Label>
                <Input
                  id="campaign"
                  name="campaign"
                  value={formData.campaign}
                  onChange={handleInputChange}
                  data-testid="input-campaign"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                data-testid="textarea-notes"
              />
            </div>

            <div className="pt-4">
              <Button
                onClick={handleTestImport}
                disabled={loading}
                className="w-full"
                size="lg"
                data-testid="button-test-import"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <TestTube className="w-5 h-5 mr-2" />
                    Testar Importação
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <Alert className="border-green-200 bg-green-50" data-testid="alert-success">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <AlertDescription className="ml-2">
              <div className="space-y-2">
                <p className="font-semibold text-green-900">Lead importado com sucesso!</p>
                <div className="text-sm text-green-800 bg-white rounded p-3 font-mono">
                  <div><strong>ID:</strong> {result.leadId}</div>
                  <div><strong>Nome:</strong> {result.data?.name}</div>
                  <div><strong>Email:</strong> {result.data?.email}</div>
                  <div><strong>Qualidade:</strong> {result.data?.quality}</div>
                  <div><strong>Preço:</strong> R$ {result.data?.price}</div>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" data-testid="alert-error">
            <XCircle className="h-5 w-5" />
            <AlertDescription className="ml-2">
              <div className="space-y-2">
                <p className="font-semibold">Erro na importação:</p>
                <pre className="text-sm bg-red-950 text-red-50 rounded p-3 overflow-x-auto">
                  {error}
                </pre>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </Layout>
  );
}
