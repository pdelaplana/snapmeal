import type { ReactNode } from 'react';
import { Utensils } from 'lucide-react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 flex items-center space-x-2 text-primary">
        <Utensils className="h-10 w-10" />
        <h1 className="font-headline text-4xl font-bold">SnapMeal</h1>
      </div>
      <div className="w-full max-w-md rounded-lg bg-card p-8 shadow-xl">
        {children}
      </div>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Capture your meals, understand your nutrition.
      </p>
    </div>
  );
}
