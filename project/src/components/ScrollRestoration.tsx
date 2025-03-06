import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * This component helps maintain scroll position when navigating or when state changes
 * within the same page (like tab switching)
 */
export function ScrollRestoration() {
  const { pathname } = useLocation();
  
  // Store scroll positions for different sections of the page
  useEffect(() => {
    // Create a map to store scroll positions
    const scrollPositions = new Map<string, number>();
    
    // Function to save current scroll position
    const saveScrollPosition = (key: string) => {
      scrollPositions.set(key, window.scrollY);
    };
    
    // Function to restore scroll position
    const restoreScrollPosition = (key: string) => {
      const savedPosition = scrollPositions.get(key);
      if (savedPosition !== undefined) {
        window.scrollTo(0, savedPosition);
      }
    };
    
    // Save position before tab changes
    const handleBeforeTabChange = () => {
      saveScrollPosition(pathname);
    };
    
    // Add event listeners for tab buttons
    const tabButtons = document.querySelectorAll('button[data-tab]');
    tabButtons.forEach(button => {
      button.addEventListener('click', handleBeforeTabChange);
    });
    
    // Restore position when component mounts
    restoreScrollPosition(pathname);
    
    return () => {
      // Clean up event listeners
      tabButtons.forEach(button => {
        button.removeEventListener('click', handleBeforeTabChange);
      });
    };
  }, [pathname]);
  
  return null;
}

export default ScrollRestoration;
