import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '@/lib/analytics';

// Hook to track page views automatically
export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    // Track page view on route change
    const path = location.pathname + location.search;
    trackPageView(path);
  }, [location]);
};

// Hook to track engagement time on pages
export const useEngagementTracking = (pageName: string) => {
  useEffect(() => {
    const startTime = Date.now();

    return () => {
      const endTime = Date.now();
      const engagementTime = endTime - startTime;
      
      // Only track if user spent more than 5 seconds on the page
      if (engagementTime > 5000) {
        import('@/lib/analytics').then(({ trackEngagement }) => {
          trackEngagement(engagementTime, pageName);
        });
      }
    };
  }, [pageName]);
};
