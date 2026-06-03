import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { LegalRlsSandboxDrawer } from "@/components/LegalRlsSandboxDrawer";
import { FolderKanban, ShieldCheck, FileText } from "lucide-react";
import { cookies } from "next/headers";

// Ensuring dynamic rendering since it relies on authentication session
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const envMissing =
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

  // Initialize the Supabase client
  const supabase = await createClient();

  // Authenticate session
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  // Execute SELECT * queries to fetch tenant, profile, subscription, and case records
  // Crucial: No `.eq()` or WHERE clauses are specified. PostgreSQL Row Level Security (RLS) handles data isolation.
  let tenant: any = null;
  let profile: any = null;
  let subscription: any = null;
  let cases: any[] = [];
  let fetchError = false;
  let errorMessage = "";

  try {
    const [tenantResult, profileResult, subscriptionResult, casesResult] = await Promise.all([
      supabase.from("tenants").select("*").single(),
      supabase.from("profiles").select("*").single(),
      supabase.from("subscriptions").select("*").single(),
      supabase.from("cases").select("*"),
    ]);

    tenant = tenantResult?.data;
    profile = profileResult?.data;
    subscription = subscriptionResult?.data;
    cases = casesResult?.data || [];

    // Capture precise database error messages
    if (tenantResult?.error) {
      fetchError = true;
      errorMessage += `[tenants table]: ${tenantResult.error.message} (Code: ${tenantResult.error.code}). `;
    }
    if (profileResult?.error) {
      fetchError = true;
      errorMessage += `[profiles table]: ${profileResult.error.message} (Code: ${profileResult.error.code}). `;
    }
    if (subscriptionResult?.error) {
      fetchError = true;
      errorMessage += `[subscriptions table]: ${subscriptionResult.error.message} (Code: ${subscriptionResult.error.code}). `;
    }
    if (casesResult?.error) {
      fetchError = true;
      errorMessage += `[cases table]: ${casesResult.error.message} (Code: ${casesResult.error.code}). `;
    }
  } catch (err: any) {
    console.error("Database fetch failed:", err);
    fetchError = true;
    errorMessage = err?.message || "Unknown database fetch exception.";
  }

  // Fallback defaults to prevent crashes (displaying blank spaces as requested)
  const userEmail = user?.email || "—";
  const tenantName = tenant?.name || "—";
  const tenantId = tenant?.id || "—";
  const tenantTier = tenant?.tier || "—";
  const profileId = profile?.id || "—";
  const profileRole = profile?.role || "—";
  const subscriptionStatus = subscription?.status || "—";

  return (
    <div className="min-h-screen bg-gray-50 text-neutral-900 font-sans antialiased selection:bg-neutral-900 selection:text-white">
      {/* Header bar / Status check indicator */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold tracking-wider text-neutral-500 uppercase">
              Legal Case SaaS
            </span>
          </div>
          <div className="text-xs text-neutral-500 font-medium">
            Active User: <span className="text-neutral-950 font-semibold font-mono">{userEmail}</span>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* RLS Security Explainer banner */}
        <div className="mb-8 p-4 bg-indigo-50 border border-indigo-200 rounded-lg flex gap-3">
          <div className="text-indigo-600 shrink-0 mt-0.5">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-indigo-950">
              Implicit Query Filtering via RLS Policies
            </h3>
            <p className="text-xs text-indigo-800 mt-1 leading-relaxed">
              No developer-defined filters or WHERE criteria (e.g. <code>.eq()</code>) are used. 
              The application executes naked queries, and Postgres automatically secures and filters 
              tenant-scoped records using the authenticated context.
            </p>
          </div>
        </div>

        {/* Diagnostic Banner if Environment Variables are Missing or DB tables are empty */}
        {(envMissing || fetchError) && (
          <div className="mb-8 p-4 bg-amber-50 border border-amber-250 rounded-lg flex gap-3 animate-fade-in">
            <div className="text-amber-600 shrink-0 mt-0.5">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-black text-amber-950">
                {envMissing ? "Environment Variables Missing" : "Database Query Error"}
              </h3>
              <p className="text-xs text-amber-855 mt-1 leading-relaxed">
                {envMissing ? (
                  <>
                    The application is running in mock fallback mode because <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> are not configured in your env file.
                  </>
                ) : (
                  <>
                    <strong>Diagnostics:</strong> {errorMessage || "Queries returned empty results."}
                  </>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Dashboard Header Section */}
        <header className="mb-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-baseline md:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-950">
                {tenantName}
              </h1>
              <p className="mt-1 text-xs text-neutral-500 font-mono">
                Tenant ID: {tenantId}
              </p>
            </div>
            <div className="mt-2 md:mt-0 flex items-center gap-3">
              <LegalRlsSandboxDrawer />
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-neutral-950 text-white rounded-full border border-neutral-950">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Context Enforced
              </span>
            </div>
          </div>
        </header>

        {/* CSS Data Grid: 2 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Profile Access */}
          <section className="bg-white border border-neutral-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col justify-between">
            <div>
              <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-neutral-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                    />
                  </svg>
                  <h2 className="font-bold text-xs text-neutral-800 tracking-wider uppercase">
                    Profile Access
                  </h2>
                </div>
                <span className="text-[10px] font-bold text-neutral-600 bg-neutral-100 border border-neutral-200 px-2.5 py-0.5 rounded-full">
                  User Context
                </span>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block">
                    Profile ID
                  </span>
                  <span className="font-mono text-xs text-neutral-900 bg-neutral-50 border border-neutral-200 p-3 rounded-lg block break-all leading-normal">
                    {profileId}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block">
                    Role
                  </span>
                  <div className="mt-1">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-neutral-900 text-white tracking-wide">
                      {profileRole}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-3 border-t border-neutral-100 bg-neutral-50/20 text-[10px] text-neutral-500">
              Query: <code>select(*)</code> on <code>profiles</code>
            </div>
          </section>

          {/* Card 2: Billing Infrastructure */}
          <section className="bg-white border border-neutral-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col justify-between">
            <div>
              <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-neutral-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h2 className="font-bold text-xs text-neutral-800 tracking-wider uppercase">
                    Billing Infrastructure
                  </h2>
                </div>
                <span className="text-[10px] font-bold text-neutral-600 bg-neutral-100 border border-neutral-200 px-2.5 py-0.5 rounded-full">
                  Tenant Scope
                </span>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block">
                    Tier
                  </span>
                  <div className="mt-1">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white tracking-wide shadow-sm">
                      {tenantTier}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block">
                    Subscription Status
                  </span>
                  <div className="mt-1">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                        subscriptionStatus === "active"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : "bg-amber-50 text-amber-800 border-amber-200"
                      }`}
                    >
                      {subscriptionStatus.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-3 border-t border-neutral-100 bg-neutral-50/20 text-[10px] text-neutral-500">
              Query: <code>select(*)</code> on <code>subscriptions</code>
            </div>
          </section>
        </div>

        {/* Case Files section */}
        <section className="bg-white border border-neutral-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col justify-between mt-6">
          <div>
            <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-neutral-500" />
                <h2 className="font-bold text-xs text-neutral-800 tracking-wider uppercase">
                  Privileged Case Files (RLS Filtered)
                </h2>
              </div>
              <span className="text-[10px] font-bold text-indigo-650 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full">
                Active Case Vault
              </span>
            </div>
            
            <div className="p-6">
              {cases.length === 0 ? (
                <div className="text-center py-6 text-sm text-neutral-500">
                  {envMissing ? "No cases found in mock context." : "No case records accessible. Connect your Supabase instance to load database records."}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cases.map((c) => (
                    <div 
                      key={c.id} 
                      className="border border-neutral-200 rounded-lg p-4 bg-neutral-50/50 hover:bg-neutral-50 hover:border-neutral-300 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="text-sm font-black text-neutral-900 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                          {c.title}
                        </h4>
                        <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold bg-neutral-950 text-white uppercase tracking-wider">
                          {c.confidentiality_level}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-600 leading-relaxed">
                        {c.description}
                      </p>
                      <div className="mt-3 pt-2.5 border-t border-neutral-150 flex items-center justify-between text-[10px] text-neutral-400 font-mono">
                        <span>ID: {c.id}</span>
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <span className="h-1 w-1 rounded-full bg-emerald-500" />
                          RLS Bound
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="px-6 py-3 border-t border-neutral-100 bg-neutral-50/20 text-[10px] text-neutral-500 flex items-center justify-between">
            <span>Query: <code>select(*)</code> on <code>cases</code> (Implicit tenant-scoping)</span>
            <span className="font-semibold text-emerald-600 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Isolated
            </span>
          </div>
        </section>

        {/* Diagnostic Metadata Footer */}
        <section className="mt-8 bg-neutral-900 text-neutral-100 border border-neutral-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <svg
              className="w-4 h-4 text-emerald-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
              />
            </svg>
            Server-Side Execution Log
          </h3>
          <p className="text-xs text-neutral-400 leading-relaxed mb-4">
            Under active RLS policies, the PostgreSQL execution planner adds query qualifiers 
            implicitly. The dashboard component requests raw tables, trusting the backend constraints 
            for strict tenant boundary containment:
          </p>
          <div className="bg-black/40 p-4 rounded-lg border border-neutral-800 overflow-x-auto">
            <code className="text-[11px] font-mono leading-relaxed text-emerald-400 block whitespace-pre">
{`// Day 4 Sprint Implementation
import { createClient } from "@/utils/supabase/server";

const supabase = await createClient();

-- Implicit security contexts (No manual filters or WHERE clauses requested):
const tenant = await supabase.from('tenants').select('*').single();
const profile = await supabase.from('profiles').select('*').single();
const subscription = await supabase.from('subscriptions').select('*').single();
const cases = await supabase.from('cases').select('*');`}
            </code>
          </div>
        </section>
      </main>
    </div>
  );
}
