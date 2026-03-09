import { useNavigate } from "react-router-dom";
import { SignUp } from "@clerk/react";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

const SignUpPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <SignUp 
        routing="path" 
        path="/auth/signup"
        signInUrl="/auth"
        forceRedirectUrl="/dashboard"
        fallbackRedirectUrl="/dashboard"
        appearance={{
          elements: {
            rootBox: "w-full",
            card: "shadow-elevated border-border/50 w-full max-w-md",
          }
        }}
      />
    </div>
  );
};

export default SignUpPage;
