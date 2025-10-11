import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

export function getSupabaseClient() {
  if (typeof window === "undefined") {
    throw new Error("getSupabaseClient can only be called on the client side");
  }

  if (browserClient) return browserClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase environment variables:", {
      url: supabaseUrl ? "set" : "missing",
      key: supabaseAnonKey ? "set" : "missing",
    });
    throw new Error(
      "Supabase environment variables are missing. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  try {
    browserClient = createClient(supabaseUrl, supabaseAnonKey);
    return browserClient;
  } catch (error) {
    console.error("Failed to create Supabase client:", error);
    throw error;
  }
}
