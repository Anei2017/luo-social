import { SignUp } from "@clerk/nextjs";
import { AuthLayout, clerkAuthAppearance } from "@/components/luo/auth-layout";

export default function SignUpPage() {
  return (
    <AuthLayout
      backdropVariant="sign-up"
      tagline="Join creators sharing culture, music, business, and everyday life."
    >
      <SignUp
        appearance={clerkAuthAppearance}
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        forceRedirectUrl="/onboarding"
      />
    </AuthLayout>
  );
}
