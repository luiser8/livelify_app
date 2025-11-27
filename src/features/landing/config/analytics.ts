// Simple helpers to send GA4 and Meta Pixel events safely

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

export function trackPageView(pagePath: string): void {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', {
      page_path: pagePath,
    });
  }
}

export function trackEvent(eventName: string, params?: Record<string, unknown>): void {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventName, params || {});
  }
}

export function trackFbPageView(): void {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('track', 'PageView');
  }
}

export function trackFbEvent(eventName: string, params?: Record<string, unknown>): void {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('track', eventName, params || {});
  }
}

export function trackLead(params?: Record<string, unknown>): void {
  trackEvent('lead', params);
  trackFbEvent('Lead', params);
}

export function trackInitiateCheckout(params?: Record<string, unknown>): void {
  trackEvent('begin_checkout', params);
  trackFbEvent('InitiateCheckout', params);
}


