import { useNavigate } from "react-router-dom";
import { SignIn } from "@clerk/react";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { HomepageLayout } from "@/components/HomepageLayout";

const Auth = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  return (
    <HomepageLayout>
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12">
        <SignIn 
          routing="path" 
          path="/auth"
          signUpUrl="/auth/signup"
          forceRedirectUrl="/dashboard"
          fallbackRedirectUrl="/dashboard"
          appearance={{
            elements: {
              rootBox: "w-full flex items-center justify-center",
              card: "shadow-elevated border-border/50 w-full max-w-md",
            }
          }}
        />
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/forgot-password")}
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
          >
            Forgot your password?
          </button>
        </div>
      </div>
    </HomepageLayout>
  );
};

export default Auth;
