
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Utensils, LogOut, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function SiteHeader() {
  const { user, mockSignOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const handleSignOut = async () => {
    mockSignOut();
    toast({ title: "Logged Out (Mocked)", description: "You have been successfully logged out." });
    router.push("/login");
  };

  const handleBack = () => {
    router.back();
  };

  // Only show the back button if not on the dashboard page
  const showBackButton = pathname !== '/dashboard';

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-2">
          {showBackButton && (
            <Button variant="ghost" size="icon" onClick={handleBack} title="Go back">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Go back</span>
            </Button>
          )}
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Utensils className="h-7 w-7 text-primary" />
            <span className="font-headline text-2xl font-bold text-foreground">SnapMeal</span>
          </Link>
        </div>
        <nav className="flex items-center space-x-4">
          {user && (
            <>
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {user.email}
              </span>
              <Button variant="ghost" size="icon" onClick={handleSignOut} title="Logout">
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Logout</span>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
