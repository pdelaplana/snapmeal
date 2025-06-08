import LoginForm from "@/components/auth/login-form";
import AuthLayout from "@/components/layout/auth-layout";

export default function LoginPage() {
  return (
    <AuthLayout>
      <h2 className="mb-6 text-center font-headline text-2xl font-semibold text-foreground">
        Login to SnapMeal
      </h2>
      <LoginForm />
    </AuthLayout>
  );
}
