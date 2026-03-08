import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export function useGenerationLimit() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);

  const checkAndIncrement = useCallback(async (): Promise<boolean> => {
    if (!user) return false;
    setChecking(true);

    try {
      const { data: sub, error } = await supabase
        .from("user_subscriptions")
        .select("generations_used, generations_limit, plan")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (!sub) {
        return true;
      }

      if (sub.plan !== "free") {
        await supabase.rpc("increment_generation_usage", { p_user_id: user.id });
        return true;
      }

      if (sub.generations_used >= sub.generations_limit) {
        toast({
          title: "Generation limit reached",
          description: `You've used all ${sub.generations_limit} free generations. Upgrade to Pro for unlimited access.`,
          variant: "destructive",
        });
        navigate("/pricing");
        return false;
      }

      await supabase.rpc("increment_generation_usage", { p_user_id: user.id });

      const remaining = sub.generations_limit - sub.generations_used - 1;
      if (remaining <= 2 && remaining >= 0) {
        toast({
          title: `${remaining} generation${remaining !== 1 ? "s" : ""} remaining`,
          description: "Upgrade to Pro for unlimited generations.",
        });
      }

      return true;
    } catch (err: any) {
      console.error("Generation limit check failed:", err);
      return true;
    } finally {
      setChecking(false);
    }
  }, [user, toast, navigate]);

  return { checkAndIncrement, checking };
}
