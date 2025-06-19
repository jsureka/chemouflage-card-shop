// Extend Window interface for gtag
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

import {
  initGTM,
  gtmTrackPageView,
  gtmTrackPurchase,
  gtmTrackBeginCheckout,
  gtmTrackAddToCart,
  gtmTrackViewItem,
  gtmTrackLogin,
  gtmTrackSignUp,
  gtmTrackSearch,
  gtmTrackSelectPaymentMethod,
  gtmTrackSelectShippingMethod,
  gtmTrackVideoPlay,
  gtmTrackContactForm,
} from './gtm';

// Google Analytics Configuration
export const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-ZVCQR84VR5';

// Initialize Google Analytics and GTM
export const initGA = () => {
  // Initialize GTM
  initGTM();

  if (!GA_MEASUREMENT_ID) {
    console.warn('Google Analytics Measurement ID not found in environment variables');
    return;
  }

  if (typeof window !== 'undefined') {
    // Load gtag script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(args);
    }
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, {
      page_title: document.title,
      page_location: window.location.href,
    });
  }
};

// Helper function to get gtag
const getGtag = () => {
  if (typeof window !== 'undefined' && window.gtag) {
    return window.gtag;
  }
  return null;
};

// Track page views
export const trackPageView = (path: string, title?: string) => {
  const pageTitle = title || document.title;
  
  // Send to GTM
  gtmTrackPageView(path, pageTitle);
  
  // Send to GA4
  if (!GA_MEASUREMENT_ID) return;
  
  const gtag = getGtag();
  if (!gtag) return;
  
  gtag('config', GA_MEASUREMENT_ID, {
    page_path: path,
    page_title: pageTitle,
  });
};

// Track custom events
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number,
  customParameters?: Record<string, any>
) => {
  if (!GA_MEASUREMENT_ID) return;

  const gtag = getGtag();
  if (!gtag) return;

  gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
    ...customParameters,
  });
};

// E-commerce tracking
export interface AnalyticsItem {
  item_id: string;
  item_name: string;
  category?: string;
  quantity?: number;
  price?: number;
  currency?: string;
  item_brand?: string;
  item_category2?: string;
  item_variant?: string;
}

export interface AnalyticsPurchase {
  transaction_id: string;
  value: number;
  currency: string;
  items: AnalyticsItem[];
  shipping?: number;
  tax?: number;
  coupon?: string;
}

// Track product views
export const trackProductView = (item: AnalyticsItem) => {
  // Send to GTM
  gtmTrackViewItem({
    currency: item.currency || 'BDT',
    value: item.price || 0,
    items: [item],
  });

  // Send to GA4
  if (!GA_MEASUREMENT_ID) return;

  const gtag = getGtag();
  if (!gtag) return;

  gtag('event', 'view_item', {
    currency: item.currency || 'BDT',
    value: item.price || 0,
    items: [item],
  });
};

// Track add to cart
export const trackAddToCart = (item: AnalyticsItem) => {
  // Send to GTM
  gtmTrackAddToCart({
    currency: item.currency || 'BDT',
    value: item.price || 0,
    items: [item],
  });

  // Send to GA4
  if (!GA_MEASUREMENT_ID) return;

  const gtag = getGtag();
  if (!gtag) return;

  gtag('event', 'add_to_cart', {
    currency: item.currency || 'BDT',
    value: item.price || 0,
    items: [item],
  });
};

// Track remove from cart
export const trackRemoveFromCart = (item: AnalyticsItem) => {
  if (!GA_MEASUREMENT_ID) return;

  const gtag = getGtag();
  if (!gtag) return;

  gtag('event', 'remove_from_cart', {
    currency: item.currency || 'BDT',
    value: item.price || 0,
    items: [item],
  });
};

// Track begin checkout
export const trackBeginCheckout = (items: AnalyticsItem[], value: number, currency = 'BDT') => {
  // Send to GTM
  gtmTrackBeginCheckout({
    currency,
    value,
    items,
  });

  // Send to GA4
  if (!GA_MEASUREMENT_ID) return;

  const gtag = getGtag();
  if (!gtag) return;

  gtag('event', 'begin_checkout', {
    currency,
    value,
    items,
  });
};

// Track purchase
export const trackPurchase = (purchase: AnalyticsPurchase) => {
  // Send to GTM
  gtmTrackPurchase({
    transaction_id: purchase.transaction_id,
    value: purchase.value,
    currency: purchase.currency,
    items: purchase.items,
    shipping: purchase.shipping,
    tax: purchase.tax,
  });

  // Send to GA4
  if (!GA_MEASUREMENT_ID) return;

  const gtag = getGtag();
  if (!gtag) return;

  gtag('event', 'purchase', {
    transaction_id: purchase.transaction_id,
    value: purchase.value,
    currency: purchase.currency,
    items: purchase.items,
    shipping: purchase.shipping,
    tax: purchase.tax,
    coupon: purchase.coupon,
  });
};

// Track search
export const trackSearch = (searchTerm: string, results?: number) => {
  // Send to GTM
  gtmTrackSearch(searchTerm, results);

  // Send to GA4
  if (!GA_MEASUREMENT_ID) return;

  const gtag = getGtag();
  if (!gtag) return;

  gtag('event', 'search', {
    search_term: searchTerm,
    ...(results !== undefined && { results_count: results }),
  });
};

// Track user registration
export const trackSignUp = (method: string = 'email') => {
  // Send to GTM
  gtmTrackSignUp(method);

  // Send to GA4
  if (!GA_MEASUREMENT_ID) return;

  const gtag = getGtag();
  if (!gtag) return;

  gtag('event', 'sign_up', {
    method,
  });
};

// Track user login
export const trackLogin = (method: string = 'email') => {
  // Send to GTM
  gtmTrackLogin(method);

  // Send to GA4
  if (!GA_MEASUREMENT_ID) return;

  const gtag = getGtag();
  if (!gtag) return;

  gtag('event', 'login', {
    method,
  });
};

// Track contact form submission
export const trackContactForm = (method: string = 'contact_page') => {
  // Send to GTM
  gtmTrackContactForm(method);

  // Send to GA4
  if (!GA_MEASUREMENT_ID) return;

  const gtag = getGtag();
  if (!gtag) return;

  gtag('event', 'contact', {
    event_category: 'engagement',
    event_label: method,
  });
};

// Track video engagement (for product videos)
export const trackVideoPlay = (videoTitle: string, productId?: string) => {
  // Send to GTM
  gtmTrackVideoPlay(videoTitle);

  // Send to GA4
  if (!GA_MEASUREMENT_ID) return;

  const gtag = getGtag();
  if (!gtag) return;

  gtag('event', 'video_play', {
    event_category: 'engagement',
    event_label: videoTitle,
    custom_parameter_1: productId,
  });
};

// Track premium code usage
export const trackPremiumCodeUsage = (codeType: string, success: boolean) => {
  if (!GA_MEASUREMENT_ID) return;

  const gtag = getGtag();
  if (!gtag) return;

  gtag('event', 'premium_code_usage', {
    event_category: 'premium_features',
    event_label: codeType,
    success: success,
  });
};

// Track admin actions (for admin dashboard)
export const trackAdminAction = (action: string, target: string) => {
  if (!GA_MEASUREMENT_ID) return;

  const gtag = getGtag();
  if (!gtag) return;

  gtag('event', 'admin_action', {
    event_category: 'admin',
    action_type: action,
    target_type: target,
  });
};

// Track order tracking
export const trackOrderTracking = (orderId: string) => {
  if (!GA_MEASUREMENT_ID) return;

  const gtag = getGtag();
  if (!gtag) return;

  gtag('event', 'track_order', {
    event_category: 'customer_service',
    order_id: orderId,
  });
};

// Track payment method selection
export const trackPaymentMethodSelection = (method: string) => {
  // Send to GTM
  gtmTrackSelectPaymentMethod(method);

  // Send to GA4
  if (!GA_MEASUREMENT_ID) return;

  const gtag = getGtag();
  if (!gtag) return;

  gtag('event', 'select_payment_method', {
    event_category: 'checkout',
    payment_method: method,
  });
};

// Track shipping method selection
export const trackShippingMethodSelection = (method: string, cost: number) => {
  // Send to GTM
  gtmTrackSelectShippingMethod(method, cost);

  // Send to GA4
  if (!GA_MEASUREMENT_ID) return;

  const gtag = getGtag();
  if (!gtag) return;

  gtag('event', 'select_shipping_method', {
    event_category: 'checkout',
    shipping_method: method,
    shipping_cost: cost,
  });
};

// Error tracking
export const trackError = (error: string, page: string, fatal: boolean = false) => {
  if (!GA_MEASUREMENT_ID) return;

  const gtag = getGtag();
  if (!gtag) return;

  gtag('event', 'exception', {
    description: error,
    fatal,
    custom_parameter_1: page,
  });
};

// Track engagement time
export const trackEngagement = (engagementTime: number, page: string) => {
  if (!GA_MEASUREMENT_ID) return;

  const gtag = getGtag();
  if (!gtag) return;

  gtag('event', 'user_engagement', {
    engagement_time_msec: engagementTime,
    event_category: 'engagement',
    event_label: page,
  });
};
