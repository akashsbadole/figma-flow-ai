import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Sparkles, Mail, Lock, User, CheckCircle } from "lucide-react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const { signIn, signUp, resetPassword, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  if (user) {
    navigate("/dashboard", { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
        navigate("/dashboard");
      } else {
        await signUp(email, password, displayName);
        setSignupSuccess(true);
      }
    } catch (error: any) {
      const msg = error.message || "";
      if (msg.includes("Email not confirmed") || msg.includes("email_not_confirmed")) {
        toast({
          title: "Email not verified",
          description: "Please check your inbox and verify your email before signing in.",
          variant: "destructive",
        });
      } else {
        toast({ title: "Error", description: msg, variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({ title: "Enter your email address first", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email);
      setResetSent(true);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (signupSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <CheckCircle className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Check your email</h2>
          <p className="text-muted-foreground">
            We've sent a verification link to <strong>{email}</strong>. Please verify your email before signing in.
          </p>
          <Button variant="outline" onClick={() => { setSignupSuccess(false); setIsLogin(true); }}>
            Back to Sign In
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full gradient-primary opacity-20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full gradient-accent opacity-15 blur-3xl" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary shadow-glow">
            <Sparkles className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">AI Design Studio</h1>
          <p className="mt-2 text-muted-foreground">Create stunning designs with AI</p>
        </div>

        <Card className="shadow-elevated border-border/50">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">
              {isForgotPassword ? "Reset password" : isLogin ? "Welcome back" : "Create account"}
            </CardTitle>
            <CardDescription>
              {isForgotPassword
                ? "Enter your email and we'll send you a reset link"
                : isLogin
                ? "Sign in to access your projects"
                : "Get started with AI Design Studio"}
            </CardDescription>
          </CardHeader>

          {isForgotPassword ? (
            <form onSubmit={handleForgotPassword}>
              <CardContent className="space-y-4">
                {resetSent ? (
                  <div className="text-center space-y-2 py-2">
                    <CheckCircle className="h-8 w-8 text-primary mx-auto" />
                    <p className="text-sm text-muted-foreground">Reset link sent! Check your inbox.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="reset-email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="pl-10" />
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                {!resetSent && (
                  <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={loading}>
                    {loading ? "Sending..." : "Send Reset Link"}
                  </Button>
                )}
                <button type="button" onClick={() => { setIsForgotPassword(false); setResetSent(false); }} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Back to Sign In
                </button>
              </CardFooter>
            </form>
          ) : (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Display Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="name" placeholder="Your name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="pl-10" />
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="pl-10" />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={loading}>
                  {loading ? "Loading..." : isLogin ? "Sign In" : "Create Account"}
                </Button>

                {isLogin && (
                  <button type="button" onClick={() => setIsForgotPassword(true)} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Forgot password?
                  </button>
                )}

                <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                </button>
              </CardFooter>
            </form>
          )}
        </Card>
      </motion.div>
    </div>
  );
};

export default Auth;
