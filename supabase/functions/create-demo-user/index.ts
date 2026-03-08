import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Create normal user
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: "user@aidesignstudio.com",
    password: "user1234",
    email_confirm: true,
    user_metadata: { display_name: "Normal User" },
  });

  if (error && !error.message.includes("already been registered")) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ success: true, user: data?.user?.id }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
