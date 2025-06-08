"use client";

import { signOutUser } from "@/actions/auth"; // Import server action
import AppLayout from "@/components/layout/app-layout";
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
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Key, LogOut, ShieldAlert, Trash2, UserCog } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AccountManagementPage() {
  const { user } = useAuth(); // Removed mockSignOut
  const router = useRouter();
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

  if (!user) {
    // This check might be redundant if AppLayout already handles it, but good for safety.
    return (
      <AppLayout>
        <p>Loading user data...</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <UserCog className="mx-auto mb-4 h-16 w-16 text-primary" />
          <h1 className="font-headline text-3xl font-bold text-foreground">
            Account Management
          </h1>
          <p className="text-muted-foreground">
            Manage your account settings for {user.email}.
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Account Actions</CardTitle>
            <CardDescription>
              Perform actions related to your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                disabled
              >
                <Key className="mr-3 h-5 w-5 text-muted-foreground" />
                <span>Change Password</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  (Not available)
                </span>
              </Button>

              <Button
                variant="destructive_outline_mock"
                className="w-full justify-start"
                disabled
              >
                <Trash2 className="mr-3 h-5 w-5 text-muted-foreground" />
                <span>Delete Account</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  (Not available)
                </span>
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
                    <AlertDialogTitle>
                      Are you sure you want to sign out?
                    </AlertDialogTitle>
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
              <Card
                variant="outlined_warning"
                className="border-yellow-500/50 bg-yellow-500/10"
              >
                <CardContent className="p-4">
                  <div className="flex items-start">
                    <ShieldAlert className="mr-3 mt-1 h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium text-yellow-700">
                        This is a mocked environment.
                      </p>
                      <p className="text-xs text-yellow-600">
                        Features like password change and account deletion are
                        for demonstration purposes and are not functional.
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
