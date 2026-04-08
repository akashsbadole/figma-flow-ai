import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { User, Sparkles, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { api } from "@/integrations/neon/client";

const ForgotUsername = () => {
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName) {
      toast({ title: "Display name is required", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      await api.requestUsernameRecovery(displayName);
      setSubmitted(true);
      toast({ title: "Recovery info sent!", description: "If an account exists, you will receive an email shortly." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "An error occurred", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Forgot Username</h1>
        </div>

        <Card className="shadow-elevated border-border/50 overflow-hidden">
          {!submitted ? (
            <>
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-xl font-bold">Recover your username</CardTitle>
                <CardDescription className="mt-1">Enter your display name and we'll send recovery info to your email</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4 px-6 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
                      Display Name
                    </Label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary">
                        <User className="h-4 w-4" />
                      </div>
                      <Input
                        id="displayName"
                        type="text"
                        placeholder="Your display name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        required
                        className="pl-10 h-11 bg-muted/30 border-border/50 focus:border-primary/50 transition-all rounded-lg"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3 px-6 pb-6 pt-4">
                  <Button
                    type="submit"
                    className="w-full h-11 gradient-primary text-primary-foreground font-semibold shadow-sm hover:shadow-md transition-all rounded-lg"
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Send Recovery Info
                  </Button>
                  <Button
                    variant="ghost"
                    type="button"
                    className="w-full h-10 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                    onClick={() => navigate("/auth")}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Sign In
                  </Button>
                </CardFooter>
              </form>
            </>
          ) : (
            <>
              <CardHeader className="text-center pb-2">
                <div className="flex justify-center mb-4">
                  <CheckCircle2 className="h-12 w-12 text-green-500" />
                </div>
                <CardTitle className="text-xl font-bold">Check your email</CardTitle>
                <CardDescription className="mt-2 px-2">
                  If an account exists for <span className="font-semibold text-foreground">{displayName}</span>, we've sent recovery info to the associated email.
                </CardDescription>
              </CardHeader>
              <CardFooter className="px-6 pb-6 pt-2">
                <Button
                  variant="outline"
                  className="w-full h-11 border-border/50 hover:bg-muted/50 transition-colors rounded-lg"
                  onClick={() => navigate("/auth")}
                >
                  Return to Sign In
                </Button>
              </CardFooter>
            </>
          )}
        </Card>
      </motion.div>
    </div>
  );
};

export default ForgotUsername;
