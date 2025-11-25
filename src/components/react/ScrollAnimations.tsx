import { useEffect } from 'react';

export default function ScrollAnimations() {
  useEffect(() => {
    const once = true;
    
    // Use passive event listeners for better scroll performance
    if (!window.__inViewIO) {
      window.__inViewIO = new IntersectionObserver(
        (entries) => {
          // Batch DOM updates using requestAnimationFrame
          requestAnimationFrame(() => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add("animate");
                
                // Remove will-change after animation completes for better performance
                const element = entry.target as HTMLElement;
                const animationDuration = 1500; // Approximate max animation duration
                
                setTimeout(() => {
                  element.style.willChange = 'auto';
                }, animationDuration);
                
                if (once) window.__inViewIO.unobserve(entry.target);
              }
            });
          });
        },
        { 
          threshold: 0.1, 
          rootMargin: "0px 0px -5% 0px"
        }
      );
    }

    const initInViewAnimations = (selector = ".animate-on-scroll") => {
      const elements = document.querySelectorAll(selector);
      
      // Batch observe calls
      requestAnimationFrame(() => {
        elements.forEach((el) => {
          window.__inViewIO.observe(el);
        });
      });
    };

    // Initialize on mount with slight delay to avoid blocking initial render
    setTimeout(() => {
      initInViewAnimations();
    }, 100);

    // Cleanup
    return () => {
      if (window.__inViewIO) {
        document.querySelectorAll(".animate-on-scroll").forEach((el) => {
          window.__inViewIO.unobserve(el);
        });
      }
    };
  }, []);

  return null;
}

// Extend Window type
declare global {
  interface Window {
    __inViewIO: IntersectionObserver;
  }
}

