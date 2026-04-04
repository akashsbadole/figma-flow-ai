import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2, Sparkles } from "lucide-react";
import { api } from "@/integrations/neon/client";

const VerifyEmail = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState("Verifying your email...");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setMessage("Invalid verification link. No token found.");
        return;
      }

      try {
        await api.verifyEmail(token);
        setStatus('success');
        setMessage("Your email has been verified successfully!");
        toast({ title: "Email Verified!", description: "You can now sign in to your account." });
      } catch (error: any) {
        setStatus('error');
        setMessage(error.message || "Failed to verify email. The link may be expired.");
      }
    };

    verifyToken();
  }, [searchParams, toast]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full gradient-primary opacity-20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full gradient-accent opacity-15 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md mx-auto"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary shadow-glow">
            <Sparkles className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Email Verification</h1>
        </div>

        <Card className="shadow-elevated border-border/50 overflow-hidden">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              {status === 'loading' && <Loader2 className="h-12 w-12 text-primary animate-spin" />}
              {status === 'success' && <CheckCircle2 className="h-12 w-12 text-green-500" />}
              {status === 'error' && <XCircle className="h-12 w-12 text-destructive" />}
            </div>

            <CardTitle className="text-xl">
              {status === 'loading' ? "Verifying..." : status === 'success' ? "Verified!" : "Verification Failed"}
            </CardTitle>
            <CardDescription className="mt-2">{message}</CardDescription>
          </CardHeader>
          <CardContent className="px-6 py-4">
            {status === 'success' ? (
              <p className="text-sm text-muted-foreground text-center">
                Thank you for verifying your email. You now have full access to AI Design Studio.
              </p>
            ) : status === 'error' ? (
              <p className="text-sm text-muted-foreground text-center">
                If you believe this is a mistake, please request a new verification link from your profile settings.
              </p>
            ) : null}
          </CardContent>
          <CardFooter className="px-6 pb-6 pt-2">
            <Button
              onClick={() => navigate("/auth")}
              className="w-full gradient-primary text-primary-foreground font-medium shadow-sm hover:shadow-md transition-all"
            >
              {status === 'success' ? "Sign In Now" : "Back to Sign In"}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
