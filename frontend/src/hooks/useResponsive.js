import { useState, useEffect } from 'react';

const BREAKPOINTS = {
  mobile: 768,
  desktop: 1280,
};

export function useResponsive() {
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 0
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    isMobile: windowWidth < BREAKPOINTS.mobile,
    isTablet: windowWidth >= BREAKPOINTS.mobile && windowWidth < BREAKPOINTS.desktop,
    isDesktop: windowWidth >= BREAKPOINTS.desktop,
    windowWidth,
  };
}
