import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCookieConsent, COOKIE_CATEGORIES, type CookiePreferences } from "@/hooks/useCookieConsent";
import { Shield, BarChart3, Target, Zap, Info, ExternalLink } from "lucide-react";
import { Link } from "wouter";

interface CookieSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CookieSettings({ isOpen, onClose }: CookieSettingsProps) {
  const { state, updatePreferences, acceptAll, acceptEssentialOnly } = useCookieConsent();
  const [tempPreferences, setTempPreferences] = useState<CookiePreferences>(state.preferences);

  const handleSave = () => {
    updatePreferences(tempPreferences);
    onClose();
  };

  const handleAcceptAll = () => {
    acceptAll();
    onClose();
  };

  const handleEssentialOnly = () => {
    acceptEssentialOnly();
    onClose();
  };

  const toggleCategory = (category: keyof CookiePreferences) => {
    if (category === 'essential') return; // Can't disable essential
    
    setTempPreferences(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const getCategoryIcon = (category: keyof CookiePreferences) => {
    const icons = {
      essential: Shield,
      analytics: BarChart3,
      marketing: Target,
      functional: Zap,
    };
    return icons[category];
  };

  const getCategoryColor = (category: keyof CookiePreferences) => {
    const colors = {
      essential: "text-green-600 bg-green-100",
      analytics: "text-blue-600 bg-blue-100",
      marketing: "text-purple-600 bg-purple-100",
      functional: "text-orange-600 bg-orange-100",
    };
    return colors[category];
  };

  const enabledCount = Object.values(tempPreferences).filter(Boolean).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="modal-cookie-settings">
        <DialogHeader>
          <DialogTitle className="text-xl">🍪 Configurações de Cookies</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resumo atual */}
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-slate-900">Status Atual</h3>
              <Badge variant="outline" data-testid="badge-cookies-count">
                {enabledCount}/4 categorias ativas
              </Badge>
            </div>
            <p className="text-sm text-slate-600">
              Você pode alterar suas preferências a qualquer momento. 
              Cookies essenciais são sempre necessários para o funcionamento do site.
            </p>
          </div>

          {/* Configurações por categoria */}
          <div className="space-y-4">
            {(Object.keys(COOKIE_CATEGORIES) as Array<keyof CookiePreferences>).map((category) => {
              const categoryInfo = COOKIE_CATEGORIES[category];
              const Icon = getCategoryIcon(category);
              const isEnabled = tempPreferences[category];
              const isRequired = categoryInfo.required;

              return (
                <Card key={category} className={`transition-all ${isEnabled ? 'ring-2 ring-primary/20' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getCategoryColor(category)}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <CardTitle className="text-base flex items-center gap-2">
                            {categoryInfo.name}
                            {isRequired && (
                              <Badge variant="secondary" className="text-xs">
                                Obrigatório
                              </Badge>
                            )}
                          </CardTitle>
                        </div>
                      </div>
                      
                      <Switch
                        checked={isEnabled}
                        onCheckedChange={() => toggleCategory(category)}
                        disabled={isRequired}
                        data-testid={`switch-${category}`}
                      />
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <p className="text-sm text-slate-600 mb-3">
                      {categoryInfo.description}
                    </p>
                    
                    <div className="space-y-2">
                      <h4 className="text-xs font-medium text-slate-700 uppercase tracking-wide">
                        Exemplos de uso:
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {categoryInfo.examples.map((example, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {example}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Informações legais */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <h4 className="font-medium text-blue-900 mb-1">
                  Seus direitos conforme a LGPD
                </h4>
                <p className="text-blue-700 mb-2">
                  Você tem direito de acessar, corrigir, deletar seus dados ou revogar consentimentos. 
                  Para exercer esses direitos, entre em contato conosco.
                </p>
                <Link 
                  href="/privacy-policy" 
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                >
                  Política de Privacidade
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleEssentialOnly}
              className="flex-1"
              data-testid="button-save-essential-only"
            >
              Apenas Essenciais
            </Button>
            
            <Button
              variant="outline"
              onClick={handleAcceptAll}
              className="flex-1"
              data-testid="button-save-all"
            >
              Aceitar Todos
            </Button>
            
            <Button
              onClick={handleSave}
              className="flex-1 bg-primary hover:bg-primary/90"
              data-testid="button-save-preferences"
            >
              Salvar Preferências
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Componente para exibir o status atual de cookies (para uso em configurações do usuário)
export function CookieStatusCard() {
  const { state, openSettings } = useCookieConsent();

  if (!state.hasChosenPreferences) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">🍪 Preferências de Cookies</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 mb-4">
            Você ainda não configurou suas preferências de cookies.
          </p>
          <Button onClick={openSettings} variant="outline" size="sm">
            Configurar Agora
          </Button>
        </CardContent>
      </Card>
    );
  }

  const enabledCategories = Object.entries(state.preferences)
    .filter(([_, enabled]) => enabled)
    .map(([category]) => category);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">🍪 Preferências de Cookies</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Categorias ativas:</span>
            <Badge variant="outline">{enabledCategories.length}/4</Badge>
          </div>
          
          <div className="flex flex-wrap gap-1">
            {enabledCategories.map((category) => (
              <Badge key={category} variant="secondary" className="text-xs">
                {COOKIE_CATEGORIES[category as keyof typeof COOKIE_CATEGORIES].name}
              </Badge>
            ))}
          </div>
          
          <Button onClick={openSettings} variant="outline" size="sm" className="w-full">
            Alterar Preferências
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}