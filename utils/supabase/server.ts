import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export interface Tenant {
  id: string;
  name: string;
  tier: string;
}

export interface Profile {
  id: string;
  role: string;
}

export interface Subscription {
  status: string;
}

export interface Case {
  id: string;
  title: string;
  description: string;
  confidentiality_level: string;
}

// Map the tables to their exact types to simulate Supabase schema auto-generation
export interface Database {
  tenants: Tenant;
  profiles: Profile;
  subscriptions: Subscription;
  cases: Case[];
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Check for both anon key variants (standard and publishable alias)
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const isRealClient = !!(supabaseUrl && supabaseAnonKey);

export async function createClient() {
  const cookieStore = await cookies();
  // Default to 'logged-out' if no session cookie exists yet, ensuring blank states on initial load
  const email = cookieStore.get("sb-mock-email")?.value || "logged-out";

  // Graceful Fallback Mode if Env variables are missing
  if (!isRealClient) {
    return {
      auth: {
        getUser: async () => {
          if (email === "logged-out") {
            return { data: { user: null }, error: null };
          }
          return {
            data: {
              user: {
                id: email === "boutique@legal.com" ? "usr_boutique_partner" : "usr_apex_partner",
                email: email,
              },
            },
            error: null,
          };
        },
      },
      from<T extends keyof Database>(table: T) {
        return {
          select: (columns: string = "*") => {
            const execute = async () => {
              if (email === "logged-out") {
                // Return empty data/null when logged out or when initially loading without env
                if (table === "cases") {
                  return { data: [] as unknown as Database[T], error: null };
                }
                return { data: null, error: null };
              }

              // Dynamic mock data switcher
              if (email === "boutique@legal.com") {
                if (table === "tenants") {
                  return {
                    data: {
                      id: "2beabf42-9654-463d-a24b-b06f1619bbcd",
                      name: "Boutique Law Group",
                      tier: "Pro Tier",
                    } as unknown as Database[T],
                    error: null,
                  };
                }
                if (table === "profiles") {
                  return {
                    data: {
                      id: "usr_boutique_partner",
                      role: "Managing Partner",
                    } as unknown as Database[T],
                    error: null,
                  };
                }
                if (table === "subscriptions") {
                  return {
                    data: {
                      status: "active",
                    } as unknown as Database[T],
                    error: null,
                  };
                }
                if (table === "cases") {
                  return {
                    data: [
                      {
                        id: "case-b1",
                        title: "John Doe Estate Trust Settlement",
                        description: "Estate planning structure, trust funds, and asset protection planning.",
                        confidentiality_level: "Client Confidential",
                      },
                      {
                        id: "case-b2",
                        title: "IP Patent Infringement - SmartTech Corp",
                        description: "Filing drafts and evidence mapping for wireless telemetry patents.",
                        confidentiality_level: "Highly Privileged",
                      },
                    ] as unknown as Database[T],
                    error: null,
                  };
                }
              } else {
                if (table === "tenants") {
                  return {
                    data: {
                      id: "9cc09be5-054a-4525-b470-d0aa367c33e4",
                      name: "Apex Legal Partners",
                      tier: "Enterprise Tier",
                    } as unknown as Database[T],
                    error: null,
                  };
                }
                if (table === "profiles") {
                  return {
                    data: {
                      id: "usr_apex_partner",
                      role: "Senior Litigation Partner",
                    } as unknown as Database[T],
                    error: null,
                  };
                }
                if (table === "subscriptions") {
                  return {
                    data: {
                      status: "active",
                    } as unknown as Database[T],
                    error: null,
                  };
                }
                if (table === "cases") {
                  return {
                    data: [
                      {
                        id: "case-a1",
                        title: "Acme Corp Merger Acquisition Agreement",
                        description: "Highly confidential mergers and acquisitions transaction filings.",
                        confidentiality_level: "Strictly Confidential",
                      },
                      {
                        id: "case-a2",
                        title: "State of California vs Apex Holdings Ltd",
                        description: "Defense filings for multi-jurisdictional environmental compliance.",
                        confidentiality_level: "Privileged & Confidential",
                      },
                    ] as unknown as Database[T],
                    error: null,
                  };
                }
              }
              return { data: null, error: new Error(`Table not found: ${table}`) };
            };

            return {
              then(onfulfilled: (value: { data: Database[T] | null; error: any }) => void) {
                execute().then(onfulfilled);
              },
              single: async () => {
                const result = await execute();
                return { data: result.data as any, error: result.error };
              },
            };
          },
        };
      },
    } as any; // Cast mock client to any to reconcile union type conflict for createClient return
  }

  // Real Supabase SSR client for production deployment
  return createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Can be ignored if middleware is handling session refreshes
        }
      },
    },
  });
}
