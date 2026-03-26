import { useEffect } from 'react';

declare global {
  interface Window {
    frameworkReady?: () => void;
  }
}

export function useFrameworkReady() {
  useEffect(() => {
    // Only call on web - window doesn't exist in React Native
    if (typeof window !== 'undefined') {
      window.frameworkReady?.();
    }
  });
}
