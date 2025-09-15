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
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Webhook, CreditCard, Settings, ExternalLink } from "lucide-react";

interface IntegrationSettings {
  n8nWebhookUrl: string;
  n8nEnabled: boolean;
  kommoCrmApiKey: string;
  kommoCrmEnabled: boolean;
  mercadoPagoAccessToken: string;
  mercadoPagoEnabled: boolean;
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
      <div className="w-9/10 mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Integrações</h1>
          <p className="text-slate-600">Configure as integrações externas do sistema</p>
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
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <CardTitle>Mercado Pago</CardTitle>
                  <p className="text-sm text-slate-500">Gateway de pagamento brasileiro</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Ativar Mercado Pago</Label>
                  <p className="text-xs text-slate-500">Processar pagamentos de créditos</p>
                </div>
                <Switch
                  checked={settings.mercadoPagoEnabled}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, mercadoPagoEnabled: checked }))
                  }
                />
              </div>
              
              {settings.mercadoPagoEnabled && (
                <div>
                  <Label htmlFor="mp-access-token">Access Token do Mercado Pago</Label>
                  <Input
                    id="mp-access-token"
                    type="password"
                    placeholder="Insira seu Access Token do Mercado Pago"
                    value={settings.mercadoPagoAccessToken}
                    onChange={(e) => 
                      setSettings(prev => ({ ...prev, mercadoPagoAccessToken: e.target.value }))
                    }
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Encontre seu Access Token no painel do Mercado Pago em Desenvolvedores → Credenciais
                  </p>
                </div>
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