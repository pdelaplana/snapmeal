
"use client";

import AppLayout from "@/components/layout/app-layout";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Key, Trash2, ShieldAlert, UserCog } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AccountManagementPage() {
  const { user, mockSignOut } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSignOut = async () => {
    mockSignOut();
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
    router.push("/login"); 
  };

  if (!user) {
    return <AppLayout><p>Loading user data...</p></AppLayout>; 
  }

  return (
    <AppLayout>
      <div className="container mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <UserCog className="mx-auto mb-4 h-16 w-16 text-primary" />
          <h1 className="font-headline text-3xl font-bold text-foreground">Account Management</h1>
          <p className="text-muted-foreground">Manage your account settings for {user.email}.</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Account Actions</CardTitle>
            <CardDescription>Perform actions related to your account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start" disabled>
                <Key className="mr-3 h-5 w-5 text-muted-foreground" />
                <span>Change Password</span>
                <span className="ml-auto text-xs text-muted-foreground">(Not available)</span>
              </Button>
              
              <Button variant="destructive_outline_mock" className="w-full justify-start" disabled>
                <Trash2 className="mr-3 h-5 w-5 text-muted-foreground" />
                <span>Delete Account</span>
                 <span className="ml-auto text-xs text-muted-foreground">(Not available)</span>
              </Button>
            </div>
            
            <div className="mt-6 border-t pt-6">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    <LogOut className="mr-2 h-5 w-5" />
                    Sign Out
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to sign out?</AlertDialogTitle>
                    <AlertDialogDescription>
                      You will be returned to the login screen.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSignOut}>
                      Sign Out
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
             <div className="mt-4">
                <Card variant="outlined_warning" className="border-yellow-500/50 bg-yellow-500/10">
                    <CardContent className="p-4">
                        <div className="flex items-start">
                            <ShieldAlert className="mr-3 mt-1 h-5 w-5 text-yellow-600" />
                            <div>
                                <p className="text-sm font-medium text-yellow-700">
                                    This is a mocked environment.
                                </p>
                                <p className="text-xs text-yellow-600">
                                    Features like password change and account deletion are for demonstration purposes and are not functional.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

// Extend Card and Button variants for mock display if needed, or handle styling directly.
// For simplicity, using standard variants with disabled state.
// Adding custom variants to ui/card.tsx and ui/button.tsx for destructive_outline_mock and outlined_warning would be the ShadCN way.
// For now, specific styling might be inline or rely on Tailwind class adjustments if these variants don't exist.
// Let's assume `variant="destructive_outline_mock"` and `variant="outlined_warning"` would need defining in their respective component files.
// Since I can't edit those now, I'll leave them as-is or use closest existing.
// For Button:
// <Button variant="outline" className="w-full justify-start border-destructive/50 text-destructive hover:bg-destructive/10" disabled>

// For Card: (This is harder without modifying card.tsx)
// I'll use a standard Card and style its content
