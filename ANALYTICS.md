# Google Analytics 4 & Google Tag Manager Implementation

This document outlines the comprehensive analytics implementation for the Chemouflage Card Shop frontend, featuring both Google Analytics 4 (GA4) and Google Tag Manager (GTM) integration.

## Overview

The analytics implementation provides comprehensive tracking of user interactions, e-commerce events, and site performance metrics using both GA4 and GTM for maximum flexibility and data collection capabilities.

## Features

### 1. Page Tracking
- Automatic page view tracking on route changes
- Engagement time tracking for each page
- Custom page titles and paths

### 2. E-commerce Tracking
- **Product Views**: Track when users view product details
- **Begin Checkout**: Track when users start the checkout process
- **Purchase**: Track completed orders with full transaction details
- **Payment Method Selection**: Track selected payment methods
- **Shipping Method Selection**: Track delivery preferences

### 3. User Authentication Events
- **Sign Up**: Track new user registrations
- **Login**: Track user logins
- **Authentication Errors**: Track failed login attempts

### 4. Search and Navigation
- **Search**: Track product searches with query terms and result counts
- **Video Play**: Track video engagement on product pages

### 5. Admin Actions (for Admin Dashboard)
- **Premium Code Management**: Track code creation, generation, and deletion
- **Product Management**: Track admin product operations

### 6. Customer Service
- **Contact Form**: Track contact form submissions
- **Order Tracking**: Track order lookup attempts

### 7. Error Tracking
- Comprehensive error tracking across all pages
- Custom error descriptions and page context

## Setup Instructions

### 1. Environment Configuration

Create a `.env.local` file based on `.env.example`:

```bash
cp .env.example .env.local
```

Add your Google Analytics 4 Measurement ID:

```env
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 2. Google Tag Manager Setup

GTM is already configured with container ID: `GTM-WBDPRPG4`

The GTM container includes:
- Automatic page view tracking
- Enhanced e-commerce events
- Custom event triggers
- User interaction tracking

### 3. Google Analytics 4 Setup

1. Create a GA4 property in Google Analytics
2. Get your Measurement ID (format: G-XXXXXXXXXX)
3. Add the Measurement ID to your environment variables
4. Configure Enhanced Ecommerce in GA4 dashboard

### 4. Dual Tracking Benefits

The implementation sends data to both GTM and GA4:
- **GTM**: Provides flexibility for adding other marketing tools (Facebook Pixel, etc.)
- **GA4**: Direct integration for detailed analytics and reporting
- **Data Layer**: Structured data available for any marketing tools

### 3. Event Configuration in GA4

The following custom events are tracked:

#### E-commerce Events (Standard GA4)
- `view_item`
- `add_to_cart`
- `remove_from_cart`
- `begin_checkout`
- `purchase`
- `select_payment_method`
- `select_shipping_method`

#### Custom Events
- `search`
- `sign_up`
- `login`
- `contact`
- `video_play`
- `premium_code_usage`
- `admin_action`
- `track_order`
- `user_engagement`
- `exception`

## Implementation Details

### Analytics Library (`src/lib/analytics.ts`)

The main analytics library provides:

- **Initialization**: `initGA()` - Initialize both Google Analytics and GTM
- **Page Tracking**: `trackPageView(path, title)` - Sends to both GA4 and GTM
- **Event Tracking**: `trackEvent(action, category, label, value, customParameters)`
- **E-commerce**: Specialized functions for each e-commerce event
- **Error Handling**: `trackError(error, page, fatal)`

### GTM Utilities (`src/lib/gtm.ts`)

GTM-specific functions for data layer management:

- **Data Layer Push**: `gtmPush(data)` - Send custom data to GTM
- **Page Views**: `gtmTrackPageView(path, title)`
- **E-commerce Events**: Complete GTM e-commerce implementation
- **Custom Events**: Flexible event tracking through data layer

### React Hooks (`src/hooks/use-analytics.ts`)

- **`usePageTracking()`**: Automatic page view tracking
- **`useEngagementTracking(pageName)`**: Track time spent on pages

### Component Integration

Analytics are integrated into key components with dual tracking:

- **App.tsx**: Initialization and page tracking (GA4 + GTM)
- **Checkout.tsx**: Complete e-commerce funnel tracking (GA4 + GTM)
- **Login/Register.tsx**: Authentication event tracking (GA4 + GTM)
- **ProductDetail.tsx**: Product view tracking (GA4 + GTM)
- **ProductBrowser.tsx**: Search tracking (GA4 + GTM)
- **Contact.tsx**: Contact form tracking (GA4 + GTM)
- **OrderTracking.tsx**: Order lookup tracking (GA4 + GTM)
- **CloudinaryVideo.tsx**: Video engagement tracking (GA4 + GTM)
- **PremiumCodeManagement.tsx**: Admin action tracking (GA4 + GTM)

### GTM Container Structure

The GTM container (`GTM-WBDPRPG4`) includes:

**Triggers:**
- Page View
- Custom Events (purchase, search, etc.)
- Form Submissions
- Video Interactions
- Error Events

**Variables:**
- Data Layer Variables for all e-commerce data
- Page Path and Title variables
- User interaction variables

**Tags:**
- Google Analytics 4 Configuration
- Enhanced E-commerce Events
- Custom Event Tags
- Conversion Tracking

## Data Structure

### Analytics Item Format
```typescript
interface AnalyticsItem {
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
```

### Purchase Data Format
```typescript
interface AnalyticsPurchase {
  transaction_id: string;
  value: number;
  currency: string;
  items: AnalyticsItem[];
  shipping?: number;
  tax?: number;
  coupon?: string;
}
```

## Privacy and Compliance

- Analytics only initialize in production with valid measurement ID
- No personally identifiable information (PII) is tracked
- Users can opt-out through browser settings
- GDPR compliant implementation

## Testing

### Development Environment
- Analytics events are logged to console in development
- GTM data layer pushes are visible in browser console
- No actual data sent to GA4 without measurement ID

### Production Verification
1. Check browser network tab for gtag requests
2. Use Google Analytics Real-time reports
3. Verify e-commerce events in GA4 dashboard
4. Check GTM Preview mode for data layer events
5. Verify GTM container firing in browser developer tools

### GTM Debug Mode
1. Enable Preview mode in GTM interface
2. Navigate to your site
3. Verify all triggers and tags are firing correctly
4. Check data layer variables are populated

## Troubleshooting

### Common Issues

1. **Events not appearing**: Check measurement ID and network requests
2. **E-commerce data missing**: Verify enhanced e-commerce is enabled in GA4
3. **Development tracking**: Ensure measurement ID is set in environment
4. **GTM events not firing**: Check GTM Preview mode and container publish status
5. **Data layer issues**: Verify data structure in browser console

### Debug Mode

**GA4 Debug Mode:**
```typescript
gtag('config', GA_MEASUREMENT_ID, {
  debug_mode: true
});
```

**GTM Debug:**
- Use GTM Preview mode
- Check browser console for dataLayer events
- Verify tag firing in GTM interface

## Best Practices

1. **Event Naming**: Use descriptive, consistent event names
2. **Custom Parameters**: Include relevant context in custom parameters
3. **Error Handling**: Always include error tracking for critical flows
4. **Performance**: Analytics calls are non-blocking and asynchronous
5. **Privacy**: Never track sensitive information like passwords or payment details

## Analytics Dashboard Recommendations

### Key Metrics to Monitor

1. **E-commerce**:
   - Conversion rate
   - Average order value
   - Cart abandonment rate
   - Payment method preferences

2. **User Engagement**:
   - Page views and engagement time
   - Search behavior
   - Video engagement
   - Contact form submissions

3. **Technical**:
   - Error rates by page
   - Authentication success rates
   - Admin action frequency

### Custom Reports

Create custom reports for:
- Product performance analysis
- Checkout funnel analysis
- Search behavior analysis
- Customer service metrics

## Maintenance

### Regular Tasks

1. **Monitor Error Rates**: Check exception events for issues
2. **Review Custom Events**: Ensure events are firing correctly
3. **Update Tracking**: Add analytics to new features
4. **Privacy Compliance**: Review data collection practices

### Updates

When adding new features:
1. Identify tracking opportunities
2. Choose appropriate event names
3. Include relevant parameters
4. Test in development
5. Verify in production
