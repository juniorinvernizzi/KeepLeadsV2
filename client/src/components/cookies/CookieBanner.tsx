import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCookieConsent } from "@/hooks/useCookieConsent";
import { useState } from "react";
import { CookieSettings } from "@/components/cookies/CookieSettings";
import { Link } from "wouter";
import { Cookie, Settings, Shield, X } from "lucide-react";

export function CookieBanner() {
  const { state, acceptAll, acceptEssentialOnly } = useCookieConsent();
  const [showSettings, setShowSettings] = useState(false);

  // Don't show banner if user has already chosen preferences
  if (!state.showBanner || state.hasChosenPreferences) {
    return null;
  }

  return (
    <>
      {/* Banner fixo no rodapé */}
      <div 
        className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg"
        data-testid="banner-cookie-consent"
      >
        <Card className="rounded-none border-0 border-t">
          <CardContent className="p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                {/* Icon e texto principal */}
                <div className="flex items-start gap-3 flex-1">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mt-1">
                    <Cookie className="w-5 h-5 text-primary" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      🍪 Este site usa cookies
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Usamos cookies para melhorar sua experiência, analisar nosso tráfego e personalizar conteúdo. 
                      Você pode escolher quais tipos de cookies aceitar. Cookies essenciais são necessários para 
                      o funcionamento do site.{" "}
                      <Link href="/privacy-policy" className="text-primary hover:underline font-medium">
                        Saiba mais na nossa Política de Privacidade
                      </Link>
                    </p>
                  </div>
                </div>

                {/* Botões de ação */}
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                  <Button
                    variant="outline"
                    onClick={() => setShowSettings(true)}
                    className="w-full sm:w-auto text-sm"
                    data-testid="button-customize-cookies"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Personalizar
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={acceptEssentialOnly}
                    className="w-full sm:w-auto text-sm"
                    data-testid="button-essential-only"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Só Essenciais
                  </Button>
                  
                  <Button
                    onClick={acceptAll}
                    className="w-full sm:w-auto text-sm bg-primary hover:bg-primary/90"
                    data-testid="button-accept-all"
                  >
                    Aceitar Todos
                  </Button>
                </div>
              </div>

              {/* Informação adicional em dispositivos móveis */}
              <div className="mt-4 md:hidden">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Shield className="w-3 h-3" />
                  <span>Seus dados estão protegidos conforme a LGPD</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de configurações */}
      <CookieSettings 
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

      {/* Overlay para garantir que o conteúdo não fique por baixo */}
      <div className="h-20 md:h-24" aria-hidden="true" />
    </>
  );
}

// Componente para mostrar indicador de status dos cookies (opcional, para header/footer)
export function CookieStatus() {
  const { state, openSettings } = useCookieConsent();

  if (!state.hasChosenPreferences) {
    return null;
  }

  const activeCategories = Object.entries(state.preferences)
    .filter(([_, enabled]) => enabled)
    .length;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={openSettings}
      className="text-xs text-slate-600 hover:text-slate-900"
      data-testid="button-cookie-status"
    >
      <Cookie className="w-3 h-3 mr-1" />
      Cookies ({activeCategories}/4)
    </Button>
  );
}

// Componente minimalista para páginas onde o banner deve ser discreto
export function CookieBannerMinimal() {
  const { state, acceptAll, acceptEssentialOnly } = useCookieConsent();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!state.showBanner || state.hasChosenPreferences) {
    return null;
  }

  if (isCollapsed) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsCollapsed(false)}
          className="rounded-full shadow-lg"
          size="sm"
          data-testid="button-expand-cookie-banner"
        >
          <Cookie className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="shadow-xl">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <h4 className="font-semibold text-sm">🍪 Cookies</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(true)}
              className="h-6 w-6 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
          
          <p className="text-xs text-slate-600 mb-3">
            Usamos cookies para melhorar sua experiência.
          </p>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={acceptEssentialOnly}
              className="text-xs flex-1"
            >
              Essenciais
            </Button>
            <Button
              size="sm"
              onClick={acceptAll}
              className="text-xs flex-1"
            >
              Aceitar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}