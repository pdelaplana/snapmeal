"use client";

import { signOutUser } from "@/actions/auth"; // Import server action for signout
import { Avatar, AvatarFallback } from "@/components/ui/avatar"; // AvatarImage removed as we don't have profile photo URL yet
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { config } from "@/lib/config"; // Import config for feature flags
import {
  ArrowLeft,
  ChevronDown,
  LogOut,
  Settings2,
  User,
  Users,
  Utensils,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function SiteHeader() {
  const { user } = useAuth(); // No longer using mockSignOut from here
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const result = await signOutUser(); // Call the server action
    if (result.success) {
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      // onAuthStateChanged in AuthContext will handle user state update and redirect if necessary
      // but an explicit push can be faster for UI.
      router.push("/login");
    } else {
      toast({
        variant: "destructive",
        title: "Logout Failed",
        description: result.message || "Could not log out.",
      });
    }
  };

  const handleBack = () => {
    router.back();
  };

  const showBackButton = pathname !== "/dashboard";
  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : "?";

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-2">
          {showBackButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              title="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Go back</span>
            </Button>
          )}
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Utensils className="h-7 w-7 text-primary" />
            <span className="font-headline text-2xl font-bold text-foreground">
              SnapMeal
            </span>
          </Link>
        </div>
        <nav className="flex items-center space-x-4">
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 px-2 py-1 h-auto sm:px-3"
                >
                  <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                    {/* <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || "User"} /> */}
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs sm:text-sm">
                      {userInitial}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm font-medium text-foreground sm:inline-block">
                    {user.email}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground sm:ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/profile" passHref>
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                </Link>
                {config.features.enableSharing && (
                  <Link href="/sharing" passHref>
                    <DropdownMenuItem>
                      <Users className="mr-2 h-4 w-4" />
                      <span>Manage Sharing</span>
                    </DropdownMenuItem>
                  </Link>
                )}
                <Link href="/account" passHref>
                  <DropdownMenuItem>
                    <Settings2 className="mr-2 h-4 w-4" />
                    <span>Account Settings</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>
      </div>
    </header>
  );
}
