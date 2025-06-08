import RegisterForm from "@/components/auth/register-form";
import AuthLayout from "@/components/layout/auth-layout";

export default function RegisterPage() {
  return (
    <AuthLayout>
      <h2 className="mb-6 text-center font-headline text-2xl font-semibold text-foreground">
        Create your SnapMeal Account
      </h2>
      <RegisterForm />
    </AuthLayout>
  );
}
