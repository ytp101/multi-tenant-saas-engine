import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Check for both anon key variants (standard and publishable alias)
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const isRealClient = !!(supabaseUrl && supabaseAnonKey);

export const createClient = () => {
  // Graceful Fallback Mode if Env variables are missing
  if (!isRealClient) {
    return {
      auth: {
        signOut: async () => {
          if (typeof document !== "undefined") {
            // Set cookie to logged-out to trigger unauthenticated state
            document.cookie = "sb-mock-email=logged-out; path=/; max-age=3600;";
          }
          return { error: null };
        },
        signInWithPassword: async ({
          email,
        }: {
          email: string;
          password?: string;
        }) => {
          if (typeof document !== "undefined") {
            // Set the session cookie with the selected user email
            document.cookie = `sb-mock-email=${email}; path=/; max-age=3600;`;
          }
          return {
            data: {
              user: {
                id: email === "boutique@legal.com" ? "usr_boutique_partner" : "usr_apex_partner",
                email,
              },
            },
            error: null,
          };
        },
      },
    } as any; // Cast mock client to any to reconcile union type conflict for createClient return
  }

  // Real Supabase Browser Client for production deployment
  return createBrowserClient(supabaseUrl!, supabaseAnonKey!);
};
