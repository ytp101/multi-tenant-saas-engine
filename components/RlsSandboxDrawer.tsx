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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShieldAlert, KeyRound, Users, CheckCircle2, Loader2 } from "lucide-react";

export function RlsSandboxDrawer() {
  const router = useRouter();
  const supabase = createClient();

  const [activeEmail, setActiveEmail] = React.useState<string>("demo1@test.com");
  const [loadingEmail, setLoadingEmail] = React.useState<string | null>(null);
  const [isOpen, setIsOpen] = React.useState(false);

  // Synchronize active impersonated user state from cookies on mount
  React.useEffect(() => {
    if (typeof document !== "undefined") {
      const match = document.cookie.match(/(?:^|; )sb-mock-email=([^;]*)/);
      if (match && match[1]) {
        setActiveEmail(decodeURIComponent(match[1]));
      }
    }
  }, [isOpen]);

  const handleImpersonate = async (email: string) => {
    setLoadingEmail(email);

    try {
      // 1. Sign out to clear any existing session
      await supabase.auth.signOut();

      // 2. Sign in with selected tenant credentials (using dummy passwords for PoC)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: "password123",
      });

      if (error) {
        throw error;
      }

      setActiveEmail(email);

      // 3. Force a Next.js Server Components data refetch
      router.refresh();

      // Give a tiny UX delay for visual feedback of transition
      await new Promise((resolve) => setTimeout(resolve, 800));
    } catch (err) {
      console.error("Impersonation failed:", err);
    } finally {
      setLoadingEmail(null);
    }
  };

  const demoProfiles = [
    {
      name: "Alpha Corp Admin",
      email: "demo1@test.com",
      role: "Tenant Administrator",
      org: "Alpha Corp",
      tier: "Enterprise Tier",
      description: "Full configuration and workspace management access in the primary workspace.",
      color: "border-indigo-500 bg-indigo-50/20 text-indigo-700",
    },
    {
      name: "Beta Inc Member",
      email: "demo2@test.com",
      role: "Tenant Member",
      org: "Beta Inc",
      tier: "Pro Tier",
      description: "Standard member privileges scoped strictly to the secondary tenant group.",
      color: "border-emerald-500 bg-emerald-50/20 text-emerald-700",
    },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      {/* Sleek RLS trigger button in the main layout */}
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="border-neutral-900 text-neutral-900 bg-transparent hover:bg-neutral-900 hover:text-white transition-colors duration-200 gap-2 flex items-center font-bold"
        >
          <ShieldAlert className="h-4.5 w-4.5" />
          Test Security (RLS)
        </Button>
      </SheetTrigger>

      <SheetContent className="flex flex-col h-full overflow-y-auto">
        <SheetHeader className="pb-6 border-b border-neutral-100">
          <div className="flex items-center gap-2 text-indigo-600 mb-1">
            <ShieldAlert className="h-5 w-5" />
            <SheetTitle className="text-neutral-950 font-black">
              Zero-Trust Sandbox
            </SheetTitle>
          </div>
          <SheetDescription className="text-xs leading-relaxed text-neutral-600">
            Select a demo profile below to organically trigger Supabase Auth. Watch
            the Postgres RLS seamlessly isolate the database queries based on the
            active tenant context.
          </SheetDescription>
        </SheetHeader>

        {/* Demo User Selection list */}
        <div className="flex-1 py-6 space-y-4">
          <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
            Select Demo Account
          </div>

          <div className="space-y-4">
            {demoProfiles.map((profile) => {
              const isActive = activeEmail === profile.email;
              const isLoading = loadingEmail === profile.email;

              return (
                <Card
                  key={profile.email}
                  onClick={() => !isLoading && handleImpersonate(profile.email)}
                  className={`relative cursor-pointer transition-all duration-200 border-2 text-left ${
                    isActive
                      ? "border-neutral-950 bg-neutral-50/50 shadow-sm"
                      : "border-neutral-200 hover:border-neutral-400 bg-white"
                  }`}
                >
                  <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
                    <div>
                      <CardTitle className="text-sm font-black text-neutral-950">
                        {profile.name}
                      </CardTitle>
                      <CardDescription className="text-[11px] font-mono mt-0.5">
                        {profile.email}
                      </CardDescription>
                    </div>
                    {isActive && !isLoading && (
                      <CheckCircle2 className="h-5 w-5 text-neutral-950" />
                    )}
                    {isLoading && (
                      <Loader2 className="h-5 w-5 animate-spin text-neutral-900" />
                    )}
                  </CardHeader>

                  <CardContent className="p-4 pt-0 space-y-3">
                    <p className="text-xs text-neutral-600 leading-normal">
                      {profile.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-100 text-neutral-800 border border-neutral-200">
                        <Users className="h-3 w-3 mr-1" />
                        {profile.org}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-950 text-white">
                        {profile.role}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Informational security summary footer inside Sheet */}
        <div className="pt-6 border-t border-neutral-100 space-y-4">
          <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200 text-left">
            <div className="flex items-center gap-1.5 text-neutral-900 font-bold text-xs mb-1">
              <KeyRound className="h-4 w-4" />
              Row Level Security Enforced
            </div>
            <p className="text-[11px] text-neutral-600 leading-normal">
              Active tenant switching acts immediately on database fetches. RLS prevents
              cross-tenant visibility at the Postgres tablespace level.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
