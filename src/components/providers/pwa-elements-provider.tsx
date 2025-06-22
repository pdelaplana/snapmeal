// filepath: src/components/providers/pwa-elements-provider.tsx
'use client';

import { useEffect } from 'react';
import { ReactNode } from 'react';

export function PwaElementsProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Import and initialize PWA elements only on the client side
    const loadPwaElements = async () => {
      try {
        const { defineCustomElements } = await import('@ionic/pwa-elements/loader');
        defineCustomElements(window);
      } catch (error) {
        console.error('Error loading PWA elements:', error);
      }
    };

    loadPwaElements();
  }, []);

  return <>{children}</>;
}
