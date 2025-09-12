// Analytics and tracking utilities with cookie consent integration

// Google Analytics 4 configuration
const GA_TRACKING_ID = import.meta.env.VITE_GA_TRACKING_ID || '';

// Facebook Pixel configuration  
const FB_PIXEL_ID = import.meta.env.VITE_FB_PIXEL_ID || '';

// Flag to track if scripts have been loaded
let analyticsLoaded = false;
let marketingLoaded = false;
let functionalLoaded = false;

/**
 * Initialize Google Analytics 4
 */
function initializeGoogleAnalytics() {
  if (!GA_TRACKING_ID || analyticsLoaded) return;

  // Load gtag script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
  document.head.appendChild(script);

  // Initialize gtag
  script.onload = () => {
    (window as any).dataLayer = (window as any).dataLayer || [];
    function gtag(...args: any[]) {
      (window as any).dataLayer.push(args);
    }
    (window as any).gtag = gtag;

    gtag('js', new Date());
    gtag('config', GA_TRACKING_ID, {
      page_title: document.title,
      page_location: window.location.href,
    });

    console.log('🔍 Google Analytics initialized');
  };

  analyticsLoaded = true;
}

/**
 * Initialize Facebook Pixel
 */
function initializeFacebookPixel() {
  if (!FB_PIXEL_ID || marketingLoaded) return;

  // Facebook Pixel Code
  (function(f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
    if (f.fbq) return;
    n = f.fbq = function() {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

  (window as any).fbq('init', FB_PIXEL_ID);
  (window as any).fbq('track', 'PageView');

  console.log('📱 Facebook Pixel initialized');
  marketingLoaded = true;
}

/**
 * Initialize functional tracking (Hotjar, etc.)
 */
function initializeFunctionalTracking() {
  if (functionalLoaded) return;

  // Add any functional tracking here (Hotjar, FullStory, etc.)
  // Example: Hotjar
  // const HOTJAR_ID = import.meta.env.VITE_HOTJAR_ID;
  // if (HOTJAR_ID) {
  //   (function(h,o,t,j,a,r){
  //     h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
  //     h._hjSettings={hjid:HOTJAR_ID,hjsv:6};
  //     a=o.getElementsByTagName('head')[0];
  //     r=o.createElement('script');r.async=1;
  //     r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
  //     a.appendChild(r);
  //   })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
  // }

  console.log('⚙️ Functional tracking initialized');
  functionalLoaded = true;
}

/**
 * Remove analytics scripts and data
 */
function removeAnalytics() {
  if (!analyticsLoaded) return;

  // Remove Google Analytics
  const gaScripts = document.querySelectorAll('script[src*="googletagmanager.com"]');
  gaScripts.forEach(script => script.remove());

  // Clear gtag
  if ((window as any).gtag) {
    delete (window as any).gtag;
    delete (window as any).dataLayer;
  }

  console.log('🗑️ Google Analytics removed');
  analyticsLoaded = false;
}

/**
 * Remove marketing scripts and data
 */
function removeMarketing() {
  if (!marketingLoaded) return;

  // Remove Facebook Pixel
  const fbScripts = document.querySelectorAll('script[src*="connect.facebook.net"]');
  fbScripts.forEach(script => script.remove());

  // Clear fbq
  if ((window as any).fbq) {
    delete (window as any).fbq;
    delete (window as any)._fbq;
  }

  console.log('🗑️ Facebook Pixel removed');
  marketingLoaded = false;
}

/**
 * Remove functional tracking
 */
function removeFunctional() {
  if (!functionalLoaded) return;

  // Remove functional scripts
  // Example: Remove Hotjar
  // const hjScripts = document.querySelectorAll('script[src*="hotjar.com"]');
  // hjScripts.forEach(script => script.remove());
  // if ((window as any).hj) {
  //   delete (window as any).hj;
  //   delete (window as any)._hjSettings;
  // }

  console.log('🗑️ Functional tracking removed');
  functionalLoaded = false;
}

/**
 * Track page view (only if analytics is enabled)
 */
export function trackPageView(pagePath: string, pageTitle?: string) {
  if (analyticsLoaded && (window as any).gtag) {
    (window as any).gtag('config', GA_TRACKING_ID, {
      page_path: pagePath,
      page_title: pageTitle || document.title,
    });
  }
}

/**
 * Track custom event (only if analytics is enabled)
 */
export function trackEvent(eventName: string, parameters?: Record<string, any>) {
  if (analyticsLoaded && (window as any).gtag) {
    (window as any).gtag('event', eventName, parameters);
  }
}

/**
 * Track conversion event (only if marketing is enabled)
 */
export function trackConversion(eventName: string, parameters?: Record<string, any>) {
  // Google Analytics conversion
  if (analyticsLoaded && (window as any).gtag) {
    (window as any).gtag('event', eventName, parameters);
  }

  // Facebook Pixel conversion
  if (marketingLoaded && (window as any).fbq) {
    (window as any).fbq('track', eventName, parameters);
  }
}

/**
 * Initialize tracking based on cookie preferences
 */
export function initializeTracking(preferences: {
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}) {
  // Analytics
  if (preferences.analytics) {
    initializeGoogleAnalytics();
  } else {
    removeAnalytics();
  }

  // Marketing
  if (preferences.marketing) {
    initializeFacebookPixel();
  } else {
    removeMarketing();
  }

  // Functional
  if (preferences.functional) {
    initializeFunctionalTracking();
  } else {
    removeFunctional();
  }
}

/**
 * Helper function to check if tracking is enabled for a category
 */
export function isTrackingEnabled(category: 'analytics' | 'marketing' | 'functional'): boolean {
  switch (category) {
    case 'analytics':
      return analyticsLoaded;
    case 'marketing':
      return marketingLoaded;
    case 'functional':
      return functionalLoaded;
    default:
      return false;
  }
}

/**
 * Get current tracking status
 */
export function getTrackingStatus() {
  return {
    analytics: analyticsLoaded,
    marketing: marketingLoaded,
    functional: functionalLoaded,
  };
}

// Event tracking helpers for common actions
export const events = {
  // User actions
  userRegistered: (method: string) => trackEvent('sign_up', { method }),
  userLoggedIn: (method: string) => trackEvent('login', { method }),
  
  // Lead interactions  
  leadViewed: (leadId: string, category: string) => 
    trackEvent('view_item', { item_id: leadId, item_category: category }),
  
  leadPurchased: (leadId: string, value: number, currency = 'BRL') => 
    trackConversion('purchase', { 
      transaction_id: leadId, 
      value, 
      currency,
      item_category: 'lead' 
    }),
  
  // Credit actions
  creditsAdded: (amount: number, method: string) => 
    trackConversion('add_payment_info', { 
      value: amount, 
      currency: 'BRL', 
      payment_type: method 
    }),
  
  // Page views
  pageViewed: (pageName: string) => 
    trackEvent('page_view', { page_name: pageName }),
  
  // Search and filters
  searchPerformed: (searchTerm: string, filters: Record<string, any>) => 
    trackEvent('search', { search_term: searchTerm, ...filters }),
};

// Initialize tracking on first load (will check preferences)
if (typeof window !== 'undefined') {
  // Listen for cookie consent changes
  window.addEventListener('cookieConsentChanged', (event: any) => {
    const { preferences } = event.detail;
    initializeTracking(preferences);
  });

  // Check for existing preferences on load
  try {
    const stored = localStorage.getItem('keepleads_cookie_preferences');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.preferences) {
        initializeTracking(parsed.preferences);
      }
    }
  } catch (error) {
    console.warn('Error loading initial tracking preferences:', error);
  }
}