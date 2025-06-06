"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { loginUser } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Key } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending} aria-live="polite">
      {pending ? "Logging in..." : "Login"}
    </Button>
  );
}

export default function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [state, formAction] = useActionState(loginUser, undefined);

  useEffect(() => {
    if (state?.success) {
      toast({ title: "Login Successful", description: "Welcome back!" });
      router.push("/dashboard");
    } else if (state?.error) {
      const errorMessages = Object.values(state.error).flat().join(", ");
      toast({ variant: "destructive", title: "Login Failed", description: errorMessages });
    }
  }, [state, router, toast]);

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <Label htmlFor="email">Email</Label>
        <div className="relative mt-1">
          <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input id="email" name="email" type="email" placeholder="you@example.com" required className="pl-10" />
        </div>
        {state?.error?.email && <p className="mt-1 text-xs text-destructive">{state.error.email.join(", ")}</p>}
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
         <div className="relative mt-1">
          <Key className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input id="password" name="password" type="password" placeholder="••••••••" required className="pl-10" />
        </div>
        {state?.error?.password && <p className="mt-1 text-xs text-destructive">{state.error.password.join(", ")}</p>}
      </div>
      {state?.error?.form && <p className="text-sm text-destructive">{state.error.form.join(", ")}</p>}
      <SubmitButton />
      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Register
        </Link>
      </p>
    </form>
  );
}
