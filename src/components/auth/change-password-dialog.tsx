'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, changePasswordSchema, type AuthContextError } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { Key, KeyRound, Lock } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

interface ChangePasswordDialogProps {
  children: React.ReactNode;
}

export function ChangePasswordDialog({ children }: ChangePasswordDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { changePassword } = useAuth();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    setIsSubmitting(true);

    try {
      const result = await changePassword(data.currentPassword, data.newPassword);

      if (result.success) {
        toast({
          title: 'Password Updated',
          description: 'Your password has been successfully changed.',
        });
        reset();
        setOpen(false);
      } else if (result.error) {
        // Handle Firebase errors
        const error = result.error as AuthContextError;

        if (error.currentPassword) {
          setError('currentPassword', { message: error.currentPassword[0] });
        }
        if (error.newPassword) {
          setError('newPassword', { message: error.newPassword[0] });
        }
        if (error.form) {
          toast({
            variant: 'destructive',
            title: 'Password Change Failed',
            description: error.form[0],
          });
        }
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Password Change Failed',
        description: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset form when dialog closes
      reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <KeyRound className='h-5 w-5' />
            Change Password
          </DialogTitle>
          <DialogDescription>
            Enter your current password and choose a new password for your account.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='currentPassword'>Current Password</Label>
            <div className='relative'>
              <Key className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                id='currentPassword'
                type='password'
                placeholder='Enter current password'
                className='pl-9'
                {...register('currentPassword')}
                disabled={isSubmitting}
              />
            </div>
            {errors.currentPassword && (
              <p className='text-sm text-destructive'>{errors.currentPassword.message}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='newPassword'>New Password</Label>
            <div className='relative'>
              <Lock className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                id='newPassword'
                type='password'
                placeholder='Enter new password'
                className='pl-9'
                {...register('newPassword')}
                disabled={isSubmitting}
              />
            </div>
            {errors.newPassword && (
              <p className='text-sm text-destructive'>{errors.newPassword.message}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='confirmPassword'>Confirm New Password</Label>
            <div className='relative'>
              <Lock className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                id='confirmPassword'
                type='password'
                placeholder='Confirm new password'
                className='pl-9'
                {...register('confirmPassword')}
                disabled={isSubmitting}
              />
            </div>
            {errors.confirmPassword && (
              <p className='text-sm text-destructive'>{errors.confirmPassword.message}</p>
            )}
          </div>

          <DialogFooter className='gap-2 sm:gap-0'>
            <Button
              type='button'
              variant='outline'
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting ? 'Changing Password...' : 'Change Password'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
