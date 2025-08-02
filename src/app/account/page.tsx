'use client';

import { ChangePasswordDialog } from '@/components/auth/change-password-dialog';
import AppLayout from '@/components/layout/app-layout';
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
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { useDeleteAccountMutation } from '@/hooks/mutations';
import { useToast } from '@/hooks/use-toast';
import { Key, LogOut, Trash2, UserCog } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AccountManagementPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const deleteAccountMutation = useDeleteAccountMutation();

  const logoutHandler = async () => {
    const result = await logout(); // Call the server action
    if (result) {
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
      // onAuthStateChanged in AuthContext will handle user state update and redirect if necessary
      // but an explicit push can be faster for UI.
      router.push('/login');
    } else {
      toast({
        variant: 'destructive',
        title: 'Logout Failed',
        description: 'Could not log out.',
      });
    }
  };

  const deleteAccountHandler = async () => {
    if (!user?.uid) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'User ID not found.',
      });
      return;
    }

    try {
      await deleteAccountMutation.mutateAsync(user.uid);

      toast({
        title: 'Account Deleted',
        description: 'Your account has been successfully deleted.',
      });

      // Log out the user after successful deletion
      const logoutResult = await logout();
      if (logoutResult) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Delete account error:', error);
      toast({
        variant: 'destructive',
        title: 'Deletion Failed',
        description: 'Failed to delete your account. Please try again.',
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
      <div className='container mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8'>
        <div className='mb-8 text-center'>
          <UserCog className='mx-auto mb-4 h-16 w-16 text-primary' />
          <h1 className='font-headline text-3xl font-bold text-foreground'>Account Management</h1>
          <p className='text-muted-foreground'>Manage your account settings for {user.email}.</p>
        </div>

        <Card className='shadow-lg'>
          <CardHeader>
            <CardTitle className='text-xl'>Account Actions</CardTitle>
            <CardDescription>Perform actions related to your account.</CardDescription>
          </CardHeader>
          <CardContent className='space-y-6'>
            <div className='space-y-3'>
              <ChangePasswordDialog>
                <Button variant='outline' className='w-full justify-start'>
                  <Key className='mr-3 h-5 w-5 text-muted-foreground' />
                  <span>Change Password</span>
                </Button>
              </ChangePasswordDialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant='destructive'
                    className='w-full justify-start'
                    disabled={deleteAccountMutation.isPending}
                  >
                    <Trash2 className='mr-3 h-5 w-5' />
                    <span>Delete Account</span>
                    {deleteAccountMutation.isPending && (
                      <span className='ml-auto text-xs'>Processing...</span>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account and
                      remove all your data from our servers, including all your meal logs and
                      photos.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={deleteAccountHandler}
                      className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                    >
                      Delete Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>

        <div className='mt-6'>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant='outline' className='w-full'>
                <LogOut className='mr-2 h-5 w-5' />
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
                <AlertDialogAction onClick={logoutHandler}>Sign Out</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </AppLayout>
  );
}
