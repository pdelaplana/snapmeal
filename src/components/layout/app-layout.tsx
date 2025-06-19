'use client';

import { LoadingSpinner } from '@/components/loading-spinner';
import SiteHeader from '@/components/site-header';
import { useAuth } from '@/context/auth-context';
import { config } from '@/lib/config';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useEffect } from 'react';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <LoadingSpinner className='h-12 w-12 text-primary' />
      </div>
    );
  }

  if (!user) {
    return null; // Or a redirect, though useEffect handles it
  }

  return (
    <div className='flex min-h-screen flex-col'>
      <SiteHeader />
      <main className='flex-1'>{children}</main>
      <footer className='py-3 text-center text-xs text-muted-foreground'>
        © {new Date().getFullYear()} SnapMeal. All rights reserved.{' '}
        <span className='ml-2'>
          {config.version} (build {config.build})
        </span>
      </footer>
    </div>
  );
}
