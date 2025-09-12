import { useEffect } from 'react';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import { initializeTracking, clearAllNonEssentialCookies } from '@/lib/analytics';
import { useLocation } from 'wouter';

/**
 * Component that handles analytics initialization and page tracking
 * based on cookie consent preferences
 */
export function AnalyticsInitializer() {
  const { state, hasConsent } = useCookieConsent();
  const [location] = useLocation();

  // Initialize tracking when preferences change or on mount
  useEffect(() => {
    if (state.hasChosenPreferences) {
      const preferences = {
        analytics: hasConsent('analytics'),
        marketing: hasConsent('marketing'), 
        functional: hasConsent('functional'),
      };
      
      initializeTracking(preferences);
      
      // If any category was disabled, clear cookies to be safe
      if (!preferences.analytics || !preferences.marketing || !preferences.functional) {
        clearAllNonEssentialCookies();
      }
    }
  }, [state.hasChosenPreferences, state.preferences, hasConsent]);

  // Track page views when location changes (only if analytics enabled)
  useEffect(() => {
    if (hasConsent('analytics')) {
      // Extract page name from path for cleaner tracking
      const pageName = location === '/' ? 'dashboard' : location.replace('/', '');
      
      // Import and call tracking function only if analytics enabled
      import('@/lib/analytics').then(({ events }) => {
        events.pageViewed(pageName);
      });
    }
  }, [location, hasConsent]);

  // This component doesn't render anything
  return null;
}

/**
 * Higher-order component to wrap pages that need analytics tracking
 */
export function withAnalytics<T extends object>(
  Component: React.ComponentType<T>,
  pageInfo?: { name?: string; category?: string }
) {
  return function AnalyticsWrappedComponent(props: T) {
    const { hasConsent } = useCookieConsent();

    useEffect(() => {
      if (hasConsent('analytics') && pageInfo?.name) {
        import('@/lib/analytics').then(({ events }) => {
          events.pageViewed(pageInfo.name!);
        });
      }
    }, [hasConsent]);

    return <Component {...props} />;
  };
}

/**
 * Custom hook for analytics tracking
 */
export function useAnalytics() {
  const { hasConsent } = useCookieConsent();

  return {
    trackEvent: (eventName: string, parameters?: Record<string, any>) => {
      if (hasConsent('analytics')) {
        import('@/lib/analytics').then(({ trackEvent }) => {
          trackEvent(eventName, parameters);
        });
      }
    },
    
    trackConversion: (eventName: string, parameters?: Record<string, any>) => {
      if (hasConsent('marketing')) {
        import('@/lib/analytics').then(({ trackConversion }) => {
          trackConversion(eventName, parameters);
        });
      }
    },
    
    trackLeadView: (leadId: string, category: string) => {
      if (hasConsent('analytics')) {
        import('@/lib/analytics').then(({ events }) => {
          events.leadViewed(leadId, category);
        });
      }
    },
    
    trackLeadPurchase: (leadId: string, value: number) => {
      if (hasConsent('marketing')) {
        import('@/lib/analytics').then(({ events }) => {
          events.leadPurchased(leadId, value);
        });
      }
    },
    
    trackCreditsAdded: (amount: number, method: string) => {
      if (hasConsent('analytics')) {
        import('@/lib/analytics').then(({ events }) => {
          events.creditsAdded(amount, method);
        });
      }
    },
    
    isTrackingEnabled: hasConsent,
  };
}