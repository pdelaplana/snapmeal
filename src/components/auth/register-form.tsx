'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Key, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type='submit' className='w-full' disabled={pending} aria-live='polite'>
      {pending ? 'Registering...' : 'Register'}
    </Button>
  );
}

export interface RegisterFormState {
  success: boolean;
  email?: string | null;
  error?: {
    email?: string[];
    password?: string[];
    form?: string[];
  };
}

export default function RegisterForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { user: loggedInUserFromContext, register } = useAuth();
  const [isPending, setIsPending] = useState(false);
  const [state, setState] = useState<RegisterFormState | undefined>(undefined);

  // Handle form submission using the auth context register function
  const submitHandler = async (formData: FormData) => {
    setIsPending(true);

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const result = await register(email, password);
      setState({ ...state, success: result.success, email: result.email, error: result.error });
      // If registration is successful, redirect to dashboard
    } finally {
      setIsPending(false);
    }
  };

  useEffect(() => {
    if (state?.success && state.email) {
      toast({
        title: 'Registration Successful',
        description: `Welcome, ${state.email}! You are now logged in.`,
      });
      // Redirection logic is now separate and more robust
    } else if (state?.error) {
      const errorMessages = Object.values(state.error).flat().join(', ');
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: errorMessages,
      });
    }
  }, [state, toast]);

  useEffect(() => {
    // If the server action was successful AND the AuthContext now has a user
    if (state?.success && loggedInUserFromContext) {
      // We can assume the loggedInUserFromContext is the one who just registered
      // because the server action succeeded.
      router.push('/dashboard');
    }
  }, [state, loggedInUserFromContext, router]);

  return (
    <form action={submitHandler} className='space-y-6'>
      <div>
        <Label htmlFor='email'>Email</Label>
        <div className='relative mt-1'>
          <Mail className='absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground' />
          <Input
            id='email'
            name='email'
            type='email'
            placeholder='you@example.com'
            required
            className='pl-10'
          />
        </div>
        {state?.error?.email && (
          <p className='mt-1 text-xs text-destructive'>{state.error.email.join(', ')}</p>
        )}
      </div>
      <div>
        <Label htmlFor='password'>Password</Label>
        <div className='relative mt-1'>
          <Key className='absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground' />
          <Input
            id='password'
            name='password'
            type='password'
            placeholder='••••••••'
            required
            className='pl-10'
          />
        </div>
        {state?.error?.password && (
          <p className='mt-1 text-xs text-destructive'>{state.error.password.join(', ')}</p>
        )}
      </div>
      {state?.error?.form && (
        <p className='text-sm text-destructive'>{state.error.form.join(', ')}</p>
      )}
      <SubmitButton />
      <p className='text-center text-sm text-muted-foreground'>
        Already have an account?{' '}
        <Link href='/login' className='font-medium text-primary hover:underline'>
          Login
        </Link>
      </p>
    </form>
  );
}
