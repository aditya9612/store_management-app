import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname, search } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    // Always scroll to top on route changes, but with different behavior based on navigation type
    const scrollOptions = {
      top: 0,
      left: 0,
      behavior: navigationType === 'POP' ? 'auto' : 'smooth'
    };

    // Use requestAnimationFrame for better performance and to ensure DOM is ready
    const scrollToTop = () => {
      requestAnimationFrame(() => {
        window.scrollTo(scrollOptions);
      });
    };

    // Immediate scroll for programmatic navigation
    if (navigationType !== 'POP') {
      scrollToTop();
    } else {
      // For browser back/forward, add a small delay
      setTimeout(scrollToTop, 10);
    }
  }, [pathname, search, navigationType]);

  useEffect(() => {
    // Handle any additional scroll restoration needs
    const handleLoad = () => {
      // Ensure scroll position is at top after page load
      if (window.scrollY > 0) {
        requestAnimationFrame(() => {
          window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'auto'
          });
        });
      }
    };

    // Handle visibility change (when user switches tabs)
    const handleVisibilityChange = () => {
      if (!document.hidden && window.scrollY > 0) {
        requestAnimationFrame(() => {
          window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'auto'
          });
        });
      }
    };

    window.addEventListener('load', handleLoad);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('load', handleLoad);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return null;
}
