import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

export function serviceClient() {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("DROPI_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("Supabase service env vars are missing");
  return createClient(url, key);
}

export function serviceRoleKey() {
  return Deno.env.get("DROPI_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
}

export async function authenticatedUserId(req: Request) {
  const authHeader = req.headers.get("Authorization") || "";
  const token = authHeader.replace("Bearer ", "");
  if (!token) throw new Error("Missing authorization token");

  const supabase = serviceClient();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) throw new Error("Invalid authorization token");
  return data.user.id;
}
