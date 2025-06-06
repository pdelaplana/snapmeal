"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Utensils, LogOut } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { signOutUser } from "@/actions/auth";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function SiteHeader() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const result = await signOutUser();
    if (result.success) {
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
      router.push("/login");
    } else {
      toast({ variant: "destructive", title: "Logout Failed", description: result.error });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <Utensils className="h-7 w-7 text-primary" />
          <span className="font-headline text-2xl font-bold text-foreground">SnapMeal</span>
        </Link>
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
