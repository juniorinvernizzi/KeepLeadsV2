import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Webhook, CreditCard, Settings, ExternalLink, CheckCircle2, AlertCircle } from "lucide-react";

interface IntegrationSettings {
  n8nWebhookUrl: string;
  n8nEnabled: boolean;
  kommoCrmApiKey: string;
  kommoCrmEnabled: boolean;
  mercadoPagoAccessToken: string;
  mercadoPagoEnabled: boolean;
}

interface MercadoPagoEnvSettings {
  accessToken: string | null;
  publicKey: string | null;
  isActive: boolean;
  hasToken: boolean;
  source?: string;
}

interface MercadoPagoSettings {
  test: MercadoPagoEnvSettings | null;
  production: MercadoPagoEnvSettings | null;
  activeEnvironment: 'test' | 'production';
}

export default function Integrations() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [settings, setSettings] = useState<IntegrationSettings>({
    n8nWebhookUrl: "",
    n8nEnabled: false,
    kommoCrmApiKey: "",
    kommoCrmEnabled: false,
    mercadoPagoAccessToken: "",
    mercadoPagoEnabled: false,
  });

  const [mpTestToken, setMpTestToken] = useState("");
  const [mpProductionToken, setMpProductionToken] = useState("");
  const [mpActiveEnv, setMpActiveEnv] = useState<'test' | 'production'>('test');

  // Redirect non-admin users
  useEffect(() => {
    if (user && user.role !== "admin") {
      toast({
        title: "Acesso negado",
        description: "Você precisa ser administrador para acessar esta página.",
        variant: "destructive",
      });
      window.location.href = "/";
    }
  }, [user, toast]);

  const { data: integrationSettings } = useQuery<IntegrationSettings>({
    queryKey: ["/api/admin/integrations"],
    enabled: user?.role === "admin",
    onSuccess: (data) => {
      if (data) {
        setSettings(data);
      }
    },
  });

  const { data: mpSettings, isLoading: isMpLoading } = useQuery<MercadoPagoSettings>({
    queryKey: ["/api/admin/integrations/mercadopago"],
    enabled: user?.role === "admin",
  });

  useEffect(() => {
    if (mpSettings) {
      setMpActiveEnv(mpSettings.activeEnvironment);
    }
  }, [mpSettings]);

  const saveSettingsMutation = useMutation({
    mutationFn: async (data: IntegrationSettings) => {
      return await apiRequest("POST", "/api/admin/integrations", data);
    },
    onSuccess: () => {
      toast({
        title: "Configurações salvas",
        description: "As integrações foram atualizadas com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/integrations"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const testWebhookMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/admin/integrations/test-webhook", {
        url: settings.n8nWebhookUrl
      });
    },
    onSuccess: () => {
      toast({
        title: "Webhook testado",
        description: "O webhook foi testado com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro no teste",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const saveMercadoPagoMutation = useMutation({
    mutationFn: async (data: { environment: 'test' | 'production', accessToken: string, isActive: boolean }) => {
      return await apiRequest("PUT", "/api/admin/integrations/mercadopago", data);
    },
    onSuccess: () => {
      toast({
        title: "Configurações salvas",
        description: "As credenciais do Mercado Pago foram atualizadas com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/integrations/mercadopago"] });
      // Clear input fields
      setMpTestToken("");
      setMpProductionToken("");
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSaveSettings = () => {
    saveSettingsMutation.mutate(settings);
  };

  const handleTestWebhook = () => {
    if (!settings.n8nWebhookUrl) {
      toast({
        title: "URL necessária",
        description: "Por favor, insira a URL do webhook antes de testar.",
        variant: "destructive",
      });
      return;
    }
    testWebhookMutation.mutate();
  };

  const handleSaveMercadoPago = (env: 'test' | 'production') => {
    const token = env === 'test' ? mpTestToken : mpProductionToken;
    if (!token) {
      toast({
        title: "Token necessário",
        description: "Por favor, insira o token antes de salvar.",
        variant: "destructive",
      });
      return;
    }
    saveMercadoPagoMutation.mutate({
      environment: env,
      accessToken: token,
      isActive: env === mpActiveEnv
    });
  };

  const handleActivateEnvironment = (env: 'test' | 'production') => {
    const settings = env === 'test' ? mpSettings?.test : mpSettings?.production;
    if (!settings?.hasToken) {
      toast({
        title: "Token necessário",
        description: `Configure um token para o ambiente ${env === 'test' ? 'de teste' : 'de produção'} antes de ativá-lo.`,
        variant: "destructive",
      });
      return;
    }

    saveMercadoPagoMutation.mutate({
      environment: env,
      accessToken: '', // Empty token since we're just activating
      isActive: true
    });
    setMpActiveEnv(env);
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
      <div className="w-full">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 mb-2">Integrações</h1>
          <p className="text-sm sm:text-base text-slate-600">Configure as integrações externas do sistema</p>
        </div>

        <div className="space-y-6">
          {/* N8N Webhook Integration */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Webhook className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle>N8N Webhook</CardTitle>
                  <p className="text-sm text-slate-500">Automatização de leads via n8n</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Ativar integração N8N</Label>
                  <p className="text-xs text-slate-500">Enviar leads para automação via webhook</p>
                </div>
                <Switch
                  checked={settings.n8nEnabled}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, n8nEnabled: checked }))
                  }
                />
              </div>
              
              {settings.n8nEnabled && (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="webhook-url">URL do Webhook</Label>
                    <Input
                      id="webhook-url"
                      type="url"
                      placeholder="https://your-n8n-instance.com/webhook/leads"
                      value={settings.n8nWebhookUrl}
                      onChange={(e) => 
                        setSettings(prev => ({ ...prev, n8nWebhookUrl: e.target.value }))
                      }
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleTestWebhook}
                      disabled={testWebhookMutation.isPending}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      {testWebhookMutation.isPending ? "Testando..." : "Testar Webhook"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* KommoCRM Integration */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Settings className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <CardTitle>KommoCRM</CardTitle>
                  <p className="text-sm text-slate-500">Integração com sistema de CRM</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Ativar integração KommoCRM</Label>
                  <p className="text-xs text-slate-500">Sincronizar leads com KommoCRM</p>
                </div>
                <Switch
                  checked={settings.kommoCrmEnabled}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, kommoCrmEnabled: checked }))
                  }
                />
              </div>
              
              {settings.kommoCrmEnabled && (
                <div>
                  <Label htmlFor="kommo-api-key">API Key do KommoCRM</Label>
                  <Input
                    id="kommo-api-key"
                    type="password"
                    placeholder="Insira sua chave de API do KommoCRM"
                    value={settings.kommoCrmApiKey}
                    onChange={(e) => 
                      setSettings(prev => ({ ...prev, kommoCrmApiKey: e.target.value }))
                    }
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mercado Pago Integration */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <CardTitle>Mercado Pago</CardTitle>
                    <p className="text-sm text-slate-500">Gateway de pagamento brasileiro</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={mpActiveEnv === 'test' ? 'default' : 'outline'}
                    className={mpActiveEnv === 'test' ? 'bg-blue-500' : ''}
                    data-testid="badge-mp-active-env"
                  >
                    {mpActiveEnv === 'test' ? 'TESTE' : 'PRODUÇÃO'}
                  </Badge>
                  {mpSettings && (mpActiveEnv === 'test' ? mpSettings.test?.hasToken : mpSettings.production?.hasToken) && (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {isMpLoading ? (
                <div className="text-center py-4 text-slate-500">Carregando configurações...</div>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Label className="text-sm font-medium">Ambiente Ativo:</Label>
                      <div className="flex gap-2">
                        <Button
                          variant={mpActiveEnv === 'test' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleActivateEnvironment('test')}
                          disabled={saveMercadoPagoMutation.isPending}
                          data-testid="button-activate-test"
                        >
                          Teste
                        </Button>
                        <Button
                          variant={mpActiveEnv === 'production' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleActivateEnvironment('production')}
                          disabled={saveMercadoPagoMutation.isPending}
                          data-testid="button-activate-production"
                        >
                          Produção
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Tabs defaultValue="test" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="test" data-testid="tab-mp-test">Ambiente de Teste</TabsTrigger>
                      <TabsTrigger value="production" data-testid="tab-mp-production">Ambiente de Produção</TabsTrigger>
                    </TabsList>

                    <TabsContent value="test" className="space-y-4">
                      <div className="rounded-lg border bg-slate-50 p-4">
                        {mpSettings?.test?.hasToken ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-medium text-green-700">Token configurado</span>
                            </div>
                            <p className="text-xs text-slate-600">
                              Token: {mpSettings.test.accessToken}
                            </p>
                            {mpSettings.test.source === 'env' && (
                              <Badge variant="outline" className="text-xs">Variável de ambiente</Badge>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-slate-500">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-sm">Nenhum token configurado</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="mp-test-token">Access Token de Teste</Label>
                          <Input
                            id="mp-test-token"
                            type="password"
                            placeholder="TEST-1234567890-123456-..."
                            value={mpTestToken}
                            onChange={(e) => setMpTestToken(e.target.value)}
                            data-testid="input-mp-test-token"
                          />
                          <p className="text-xs text-slate-500 mt-1">
                            Token deve começar com "TEST-"
                          </p>
                        </div>
                        <Button
                          onClick={() => handleSaveMercadoPago('test')}
                          disabled={saveMercadoPagoMutation.isPending || !mpTestToken}
                          data-testid="button-save-mp-test"
                        >
                          {saveMercadoPagoMutation.isPending ? "Salvando..." : "Salvar Token de Teste"}
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="production" className="space-y-4">
                      <div className="rounded-lg border bg-slate-50 p-4">
                        {mpSettings?.production?.hasToken ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-medium text-green-700">Token configurado</span>
                            </div>
                            <p className="text-xs text-slate-600">
                              Token: {mpSettings.production.accessToken}
                            </p>
                            {mpSettings.production.source === 'env' && (
                              <Badge variant="outline" className="text-xs">Variável de ambiente</Badge>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-slate-500">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-sm">Nenhum token configurado</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="mp-production-token">Access Token de Produção</Label>
                          <Input
                            id="mp-production-token"
                            type="password"
                            placeholder="APP_USR-1234567890-123456-..."
                            value={mpProductionToken}
                            onChange={(e) => setMpProductionToken(e.target.value)}
                            data-testid="input-mp-production-token"
                          />
                          <p className="text-xs text-slate-500 mt-1">
                            Token deve começar com "APP_USR-"
                          </p>
                        </div>
                        <Button
                          onClick={() => handleSaveMercadoPago('production')}
                          disabled={saveMercadoPagoMutation.isPending || !mpProductionToken}
                          data-testid="button-save-mp-production"
                        >
                          {saveMercadoPagoMutation.isPending ? "Salvando..." : "Salvar Token de Produção"}
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-xs text-blue-800">
                      <strong>Importante:</strong> Encontre seus tokens no painel do Mercado Pago em Desenvolvedores → Credenciais. 
                      Use tokens de teste para desenvolvimento e tokens de produção quando estiver pronto para processar pagamentos reais.
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSaveSettings}
              disabled={saveSettingsMutation.isPending}
              className="min-w-32"
            >
              {saveSettingsMutation.isPending ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}