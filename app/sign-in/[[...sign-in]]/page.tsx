import { SignIn } from "@clerk/nextjs";
import { AuthLayout, clerkAuthAppearance } from "@/components/luo/auth-layout";

export default function SignInPage() {
  return (
    <AuthLayout tagline="Sign in and pick up where your community left off.">
      <SignIn
        appearance={clerkAuthAppearance}
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/feed"
      />
    </AuthLayout>
  );
}
