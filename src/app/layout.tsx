import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/context/auth-context';
import { MealLogProvider } from '@/context/meal-log-context';
import { Providers } from '@/components/providers'; // New import

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
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="font-body antialiased">
        <Providers> {/* Wrap with React Query Provider */}
          <AuthProvider>
            <MealLogProvider>
              {children}
              <Toaster />
            </MealLogProvider>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
