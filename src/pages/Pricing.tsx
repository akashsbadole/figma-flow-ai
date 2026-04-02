import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Crown, Check, Sparkles, Shield, Infinity as InfinityIcon } from "lucide-react";
import { api } from "@/integrations/neon/client";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const plans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    features: [
      "5 generations per month",
      "UI variant generation",
      "Basic design system",
      "HTML + CSS export",
      "Community support",
    ],
    icon: Sparkles,
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$19",
    period: "/month",
    features: [
      "Unlimited generations",
      "All generation modes",
      "Full design system + dark mode",
      "HTML + CSS + React + Tailwind export",
      "Image to design",
      "Priority support",
      "Generation history",
      "All template categories",
    ],
    icon: Crown,
    popular: true,
  },
];

const Pricing = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: subscription } = useQuery({
    queryKey: ["subscription", user?.id],
    queryFn: async () => {
      if (!user) return null;
      try {
        const data = await api.getSubscription();
        return data;
      } catch (error) {
        console.error('Failed to fetch subscription:', error);
        return null;
      }
    },
    enabled: !!user,
  });

  const currentPlan = subscription?.plan || "free";

  const handleUpgrade = async (planId: string) => {
    if (!user) {
      toast({ title: "Authentication required", description: "Please sign in to upgrade.", variant: "destructive" });
      return;
    }

    try {
      // First ensure customer exists
      await api.createStripeCustomer();

      // Then create checkout session
      const { sessionUrl } = await api.createCheckoutSession(planId);
      if (sessionUrl) {
        window.location.assign(sessionUrl);
      }
    } catch (error: any) {
      console.error('Upgrade failed:', error);
      toast({ title: "Upgrade failed", description: error.message, variant: "destructive" });
    }
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Choose Your Plan</h1>
          <p className="text-muted-foreground mt-2">Unlock the full power of AI Design Studio</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div key={plan.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className={`relative overflow-hidden border-border/50 ${plan.popular ? "ring-2 ring-primary shadow-lg" : ""}`}>
                {plan.popular && (
                  <div className="absolute top-0 right-0 px-3 py-1 text-[10px] font-bold bg-primary text-primary-foreground rounded-bl-lg">
                    POPULAR
                  </div>
                )}
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <plan.icon className={`h-5 w-5 ${plan.popular ? "text-primary" : "text-muted-foreground"}`} />
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full ${plan.popular ? "gradient-primary text-primary-foreground" : ""}`}
                    variant={plan.popular ? "default" : "outline"}
                    disabled={currentPlan === plan.id}
                    onClick={() => plan.id !== "free" && handleUpgrade(plan.id)}
                  >
                    {currentPlan === plan.id
                      ? "Current Plan"
                      : plan.id === "pro"
                      ? "Upgrade to Pro"
                      : "Free Plan"}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {subscription && (
          <Card className="border-border/50 max-w-3xl mx-auto">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Current: {currentPlan === "pro" ? "Pro" : "Free"} Plan</p>
                  <p className="text-xs text-muted-foreground">
                    {subscription.generations_used} / {subscription.generations_limit === 999 ? "∞" : subscription.generations_limit} generations used
                  </p>
                </div>
              </div>
              {currentPlan === "pro" && (
                <div className="flex items-center gap-1 text-xs text-primary">
                  <InfinityIcon className="h-4 w-4" /> Unlimited access
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default Pricing;
