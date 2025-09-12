import { useState, useEffect, createContext, useContext } from 'react';

export interface CookiePreferences {
  essential: boolean;     // Always true - required for functionality
  analytics: boolean;     // Google Analytics, metrics
  marketing: boolean;     // Facebook Pixel, ads tracking
  functional: boolean;    // Chatbots, preferences, UX enhancements
}

export interface CookieConsentState {
  hasChosenPreferences: boolean;
  showBanner: boolean;
  showSettingsModal: boolean;
  preferences: CookiePreferences;
}

interface CookieConsentContextType {
  state: CookieConsentState;
  acceptAll: () => void;
  acceptEssentialOnly: () => void;
  updatePreferences: (preferences: Partial<CookiePreferences>) => void;
  openSettings: () => void;
  closeSettings: () => void;
  hasConsent: (category: keyof CookiePreferences) => boolean;
  resetConsent: () => void;
}

const CookieConsentContext = createContext<CookieConsentContextType | null>(null);

const STORAGE_KEY = 'keepleads_cookie_preferences';
const CONSENT_VERSION = '1.0'; // Increment when cookie policy changes

const defaultPreferences: CookiePreferences = {
  essential: true,
  analytics: false,
  marketing: false,
  functional: false,
};

const initialState: CookieConsentState = {
  hasChosenPreferences: false,
  showBanner: true,
  showSettingsModal: false,
  preferences: defaultPreferences,
};

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CookieConsentState>(initialState);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        
        // Check if consent version matches (for policy updates)
        if (parsed.version === CONSENT_VERSION && parsed.preferences) {
          setState({
            hasChosenPreferences: true,
            showBanner: false,
            showSettingsModal: false,
            preferences: {
              essential: true, // Always true
              analytics: parsed.preferences.analytics || false,
              marketing: parsed.preferences.marketing || false,
              functional: parsed.preferences.functional || false,
            },
          });
        } else {
          // Reset if version mismatch (new policy)
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (error) {
      console.warn('Error loading cookie preferences:', error);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const savePreferences = (preferences: CookiePreferences) => {
    try {
      const toStore = {
        version: CONSENT_VERSION,
        preferences,
        timestamp: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    } catch (error) {
      console.warn('Error saving cookie preferences:', error);
    }
  };

  const acceptAll = () => {
    const allAccepted: CookiePreferences = {
      essential: true,
      analytics: true,
      marketing: true,
      functional: true,
    };
    
    setState(prev => ({
      ...prev,
      hasChosenPreferences: true,
      showBanner: false,
      preferences: allAccepted,
    }));
    
    savePreferences(allAccepted);
    
    // Trigger analytics loading if now enabled
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cookieConsentChanged', { 
        detail: { preferences: allAccepted } 
      }));
    }
  };

  const acceptEssentialOnly = () => {
    const essentialOnly: CookiePreferences = {
      essential: true,
      analytics: false,
      marketing: false,
      functional: false,
    };
    
    setState(prev => ({
      ...prev,
      hasChosenPreferences: true,
      showBanner: false,
      preferences: essentialOnly,
    }));
    
    savePreferences(essentialOnly);
    
    // Trigger cleanup if analytics was previously enabled
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cookieConsentChanged', { 
        detail: { preferences: essentialOnly } 
      }));
    }
  };

  const updatePreferences = (newPreferences: Partial<CookiePreferences>) => {
    const previousPreferences = state.preferences;
    const updatedPreferences: CookiePreferences = {
      ...state.preferences,
      ...newPreferences,
      essential: true, // Always keep essential as true
    };
    
    setState(prev => ({
      ...prev,
      preferences: updatedPreferences,
      hasChosenPreferences: true,
      showBanner: false,
      showSettingsModal: false,
    }));
    
    savePreferences(updatedPreferences);
    
    // Clear cookies if any category was disabled
    if (typeof window !== 'undefined') {
      const wasDisabled = (
        (previousPreferences.analytics && !updatedPreferences.analytics) ||
        (previousPreferences.marketing && !updatedPreferences.marketing) ||
        (previousPreferences.functional && !updatedPreferences.functional)
      );
      
      if (wasDisabled) {
        // Dynamic import to ensure function is available
        import('@/lib/analytics').then(({ clearAllNonEssentialCookies }) => {
          clearAllNonEssentialCookies();
        });
      }
      
      // Trigger analytics changes
      window.dispatchEvent(new CustomEvent('cookieConsentChanged', { 
        detail: { preferences: updatedPreferences } 
      }));
    }
  };

  const openSettings = () => {
    setState(prev => ({ ...prev, showSettingsModal: true }));
  };

  const closeSettings = () => {
    setState(prev => ({ ...prev, showSettingsModal: false }));
  };

  const hasConsent = (category: keyof CookiePreferences): boolean => {
    return state.hasChosenPreferences && state.preferences[category];
  };

  const resetConsent = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState(initialState);
    
    // Trigger cleanup
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cookieConsentChanged', { 
        detail: { preferences: defaultPreferences } 
      }));
    }
  };

  const contextValue: CookieConsentContextType = {
    state,
    acceptAll,
    acceptEssentialOnly,
    updatePreferences,
    openSettings,
    closeSettings,
    hasConsent,
    resetConsent,
  };

  return (
    <CookieConsentContext.Provider value={contextValue}>
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);
  if (!context) {
    throw new Error('useCookieConsent must be used within a CookieConsentProvider');
  }
  return context;
}

// Type definitions for cookie categories
export const COOKIE_CATEGORIES = {
  essential: {
    name: 'Cookies Essenciais',
    description: 'Necessários para o funcionamento básico do site, como login e navegação.',
    examples: ['Sessão de usuário', 'Preferências de idioma', 'Carrinho de compras'],
    required: true,
  },
  analytics: {
    name: 'Cookies Analíticos',
    description: 'Nos ajudam a entender como os visitantes usam o site para melhorar a experiência.',
    examples: ['Google Analytics', 'Hotjar', 'Métricas de performance'],
    required: false,
  },
  marketing: {
    name: 'Cookies de Marketing',
    description: 'Usados para exibir anúncios relevantes e medir a efetividade das campanhas.',
    examples: ['Facebook Pixel', 'Google Ads', 'Remarketing'],
    required: false,
  },
  functional: {
    name: 'Cookies Funcionais',
    description: 'Melhoram a funcionalidade e personalização do site.',
    examples: ['Chat ao vivo', 'Preferências de interface', 'Lembretes'],
    required: false,
  },
} as const;