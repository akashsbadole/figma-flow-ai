
-- 1. Drop the insecure user UPDATE policy
DROP POLICY IF EXISTS "Users can update own subscription" ON public.user_subscriptions;

-- 2. Create a secure RPC function to increment generation usage only
CREATE OR REPLACE FUNCTION public.increment_generation_usage(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.user_subscriptions
  SET generations_used = generations_used + 1,
      updated_at = now()
  WHERE user_id = p_user_id;
END;
$$;
