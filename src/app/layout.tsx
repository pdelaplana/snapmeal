import type { Metadata } from 'next';
import './globals.css';
import { ReactQueryProvider } from '@/components/providers'; // New import
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/context/auth-context';
import { MealLogProvider } from '@/context/meal-log-context';

import { PwaElementsProvider } from '@/components/providers/pwa-elements-provider';
import { SentryErrorBoundary } from '@/components/shared/sentry-error-boundary';

export const metadata: Metadata = {
  title: 'SnapMeal',
  description: 'Log your meals by taking pictures and estimate calories & macros.',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const errorFallback = (
    <div className='flex min-h-screen flex-col items-center justify-center p-4 text-center'>
      <h2 className='mb-2 text-2xl font-bold'>Something went wrong</h2>
      <p className='mb-4 text-muted-foreground'>
        We've been notified about this issue and will fix it as soon as possible. Refresh this page
        to try again.
      </p>
    </div>
  );
  return (
    <html lang='en'>
      <head>
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link rel='preconnect' href='https://fonts.gstatic.com' crossOrigin='anonymous' />
        <link
          href='https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
          rel='stylesheet'
        />
        <link rel='icon' href='/favicon.ico' sizes='any' />
      </head>
      <body className='font-body antialiased'>
        <SentryErrorBoundary fallback={errorFallback}>
          <ReactQueryProvider>
            <AuthProvider>
              <MealLogProvider>
                <PwaElementsProvider>
                  {children}
                  <Toaster />
                </PwaElementsProvider>
              </MealLogProvider>
            </AuthProvider>
          </ReactQueryProvider>
        </SentryErrorBoundary>
      </body>
    </html>
  );
}
