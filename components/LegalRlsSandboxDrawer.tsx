"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Scale, KeyRound, Loader2, CheckCircle2, ShieldAlert } from "lucide-react";

const normalizeTier = (tier: string) => {
  if (!tier) return "—";
  const t = tier.toLowerCase();
  if (t === "enterprise" || t === "enterprise tier") {
    return "Enterprise Tier";
  }
  if (t === "pro" || t === "pro tier") {
    return "Pro Tier";
  }
  return tier.charAt(0).toUpperCase() + tier.slice(1);
};

export function LegalRlsSandboxDrawer() {
  const router = useRouter();
  const supabase = createClient();

  const [activeEmail, setActiveEmail] = React.useState<string>("apex@legal.com");
  const [loadingEmail, setLoadingEmail] = React.useState<string | null>(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const [dbTenants, setDbTenants] = React.useState<any[]>([]);

  // Sync active impersonated tenant status from cookies
  React.useEffect(() => {
    if (typeof document !== "undefined") {
      const match = document.cookie.match(/(?:^|; )sb-mock-email=([^;]*)/);
      if (match && match[1]) {
        setActiveEmail(decodeURIComponent(match[1]));
      }
    }
  }, [isOpen]);

  // Fetch real tenant tier data via Supabase client
  React.useEffect(() => {
    async function fetchDbTenants() {
      try {
        const { data } = await supabase.from("tenants").select("*");
        if (data) {
          setDbTenants(data);
        }
      } catch (err) {
        console.error("Error fetching db tenants:", err);
      }
    }
    fetchDbTenants();
  }, [activeEmail, isOpen]);

  const switchFirmContext = async (firmEmail: string) => {
    setLoadingEmail(firmEmail);

    try {
      // 1. Sign out to clear current session
      await supabase.auth.signOut();

      // 2. Sign in using selected law firm dummy credentials
      const { error } = await supabase.auth.signInWithPassword({
        email: firmEmail,
        password: "password123",
      });

      if (error) {
        throw error;
      }

      setActiveEmail(firmEmail);

      // 3. Force Server Components on the dashboard to re-fetch case files
      router.refresh();

      // Small UX delay to show the switch completion
      await new Promise((resolve) => setTimeout(resolve, 800));
    } catch (err) {
      console.error("Context switch failed:", err);
    } finally {
      setLoadingEmail(null);
    }
  };

  const firmProfiles = [
    {
      id: "9cc09be5-054a-4525-b470-d0aa367c33e4",
      name: "Apex Legal Partners",
      email: "apex@legal.com",
      tier: "Enterprise Tier",
      context: "Handles corporate mergers & acquisitions and active state litigation.",
      color: "border-neutral-900 bg-neutral-50/50",
    },
    {
      id: "2beabf42-9654-463d-a24b-b06f1619bbcd",
      name: "Boutique Law Group",
      email: "boutique@legal.com",
      tier: "Pro Tier",
      context: "Handles estate planning and intellectual property litigation.",
      color: "border-neutral-200 bg-white",
    },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          className="bg-neutral-900 text-white hover:bg-neutral-850 border border-neutral-900 transition-all gap-1.5 sm:gap-2 flex items-center font-bold text-[10px] sm:text-xs md:text-sm whitespace-nowrap shrink-0"
        >
          <Scale className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5 shrink-0" />
          Launch Legal RLS Demo
        </Button>
      </SheetTrigger>

      <SheetContent className="flex flex-col h-full overflow-y-auto">
        <SheetHeader className="pb-6 border-b border-neutral-100">
          <div className="flex items-center gap-2 text-indigo-600 mb-1">
            <Scale className="h-5 w-5" />
            <SheetTitle className="text-neutral-950 font-black">
              Legal SaaS Sandbox
            </SheetTitle>
          </div>
          <SheetDescription className="text-xs leading-relaxed text-neutral-600">
            Simulate authentication context switching. Observe how Postgres RLS
            strictly isolates attorney-client privilege at the database layer.
          </SheetDescription>
        </SheetHeader>

        {/* Firm List */}
        <div className="flex-1 py-6 space-y-4">
          <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
            Active Law Firms
          </div>

          <div className="space-y-4">
            {firmProfiles.map((firm) => {
              const isActive = activeEmail === firm.email;
              const isLoading = loadingEmail === firm.email;

              // Match tenant from real database fetch
              const dbTenant = dbTenants.find(
                (t) =>
                  t.id === firm.id ||
                  t.name?.toLowerCase().includes(firm.name.split(" ")[0].toLowerCase())
              );
              const displayName = dbTenant?.name || firm.name;
              const displayTier = normalizeTier(dbTenant?.tier || firm.tier);

              return (
                <Card
                  key={firm.email}
                  className={`border-2 transition-all duration-200 text-left flex flex-col justify-between ${
                    isActive ? "border-neutral-950 shadow-sm" : "border-neutral-200"
                  }`}
                >
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-sm font-black text-neutral-950">
                          {displayName}
                        </CardTitle>
                        <CardDescription className="text-[10px] font-mono mt-0.5">
                          {firm.email}
                        </CardDescription>
                      </div>
                      <Badge
                        variant={displayTier === "Enterprise Tier" ? "default" : "secondary"}
                        className="text-[9px] uppercase tracking-wide font-black"
                      >
                        {displayTier}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 pt-0 space-y-4">
                    <p className="text-xs text-neutral-650 leading-relaxed">
                      {firm.context}
                    </p>

                    <Button
                      onClick={() => switchFirmContext(firm.email)}
                      disabled={isLoading}
                      variant={isActive ? "outline" : "default"}
                      className="w-full text-[11px] sm:text-xs font-bold gap-2 flex items-center justify-center h-9 px-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Re-authorizing...
                        </>
                      ) : isActive ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5 text-neutral-950" />
                          Resync Session
                        </>
                      ) : (
                        `Authenticate as ${displayName}`
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Security / Technology Note */}
        <div className="pt-6 border-t border-neutral-100 space-y-4">
          <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200 text-left">
            <div className="flex items-center gap-1.5 text-neutral-900 font-bold text-xs mb-1">
              <ShieldAlert className="h-4 w-4 text-indigo-600" />
              RLS Isolation Layer
            </div>
            <p className="text-[11px] text-neutral-600 leading-normal">
              Changing context signs out the current session and signs in with the new
              firm's account, setting the Postgres <code>request.jwt.claims</code>. 
              Only scoped case records pass through RLS boundaries.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
