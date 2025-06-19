// Google Tag Manager utility functions
declare global {
  interface Window {
    dataLayer: any[];
  }
}

// GTM Container ID
export const GTM_CONTAINER_ID = 'GTM-WBDPRPG4';

// Initialize dataLayer if it doesn't exist
export const initGTM = () => {
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
  }
};

// Push data to GTM dataLayer
export const gtmPush = (data: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push(data);
  }
};

// GTM-specific event tracking functions
export const gtmTrackPageView = (pagePath: string, pageTitle: string) => {
  gtmPush({
    event: 'page_view',
    page_path: pagePath,
    page_title: pageTitle,
  });
};

export const gtmTrackPurchase = (transactionData: {
  transaction_id: string;
  value: number;
  currency: string;
  items: any[];
  shipping?: number;
  tax?: number;
}) => {
  gtmPush({
    event: 'purchase',
    ecommerce: {
      transaction_id: transactionData.transaction_id,
      value: transactionData.value,
      currency: transactionData.currency,
      items: transactionData.items,
      shipping: transactionData.shipping,
      tax: transactionData.tax,
    },
  });
};

export const gtmTrackBeginCheckout = (checkoutData: {
  currency: string;
  value: number;
  items: any[];
}) => {
  gtmPush({
    event: 'begin_checkout',
    ecommerce: {
      currency: checkoutData.currency,
      value: checkoutData.value,
      items: checkoutData.items,
    },
  });
};

export const gtmTrackAddToCart = (item: {
  currency: string;
  value: number;
  items: any[];
}) => {
  gtmPush({
    event: 'add_to_cart',
    ecommerce: {
      currency: item.currency,
      value: item.value,
      items: item.items,
    },
  });
};

export const gtmTrackViewItem = (item: {
  currency: string;
  value: number;
  items: any[];
}) => {
  gtmPush({
    event: 'view_item',
    ecommerce: {
      currency: item.currency,
      value: item.value,
      items: item.items,
    },
  });
};

export const gtmTrackLogin = (method: string) => {
  gtmPush({
    event: 'login',
    method: method,
  });
};

export const gtmTrackSignUp = (method: string) => {
  gtmPush({
    event: 'sign_up',
    method: method,
  });
};

export const gtmTrackSearch = (searchTerm: string, resultsCount?: number) => {
  gtmPush({
    event: 'search',
    search_term: searchTerm,
    results_count: resultsCount,
  });
};

export const gtmTrackSelectPaymentMethod = (paymentMethod: string) => {
  gtmPush({
    event: 'select_payment_method',
    payment_method: paymentMethod,
  });
};

export const gtmTrackSelectShippingMethod = (shippingMethod: string, cost: number) => {
  gtmPush({
    event: 'select_shipping_method',
    shipping_method: shippingMethod,
    shipping_cost: cost,
  });
};

export const gtmTrackVideoPlay = (videoTitle: string, videoDuration?: number) => {
  gtmPush({
    event: 'video_play',
    video_title: videoTitle,
    video_duration: videoDuration,
  });
};

export const gtmTrackContactForm = (formType: string) => {
  gtmPush({
    event: 'contact_form_submit',
    form_type: formType,
  });
};

export const gtmTrackCustomEvent = (eventName: string, parameters: Record<string, any>) => {
  gtmPush({
    event: eventName,
    ...parameters,
  });
};
