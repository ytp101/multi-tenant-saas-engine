"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Database, Copy, Check, ShieldAlert, Sparkles } from "lucide-react";

interface CodeBlockProps {
  sql: string;
  explanation: string;
}

function SqlCodeBlock({ sql, explanation }: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sql);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code: ", err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative group min-w-0 w-full">
        <pre className="bg-slate-950 text-emerald-400 p-4 pr-12 rounded-lg font-mono text-xs sm:text-sm max-w-full overflow-x-auto whitespace-pre-wrap break-words leading-relaxed border border-slate-900 shadow-inner select-all min-h-[80px]">
          <code>{sql}</code>
        </pre>
        <Button
          size="icon"
          variant="outline"
          className="absolute top-3 right-3 h-8 w-8 text-neutral-400 hover:text-white hover:bg-slate-900/50 bg-slate-950/60 border-slate-800 opacity-90 transition-opacity active:scale-95"
          onClick={handleCopy}
          title="Copy SQL Policy"
        >
          {copied ? (
            <Check className="h-4 w-4 text-emerald-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          <span className="sr-only">Copy code</span>
        </Button>
      </div>

      <div className="bg-neutral-50 border border-neutral-200 dark:bg-neutral-900/50 dark:border-neutral-800 rounded-lg p-3 text-xs text-neutral-600 dark:text-neutral-400 leading-normal flex gap-2">
        <Sparkles className="h-4 w-4 text-indigo-650 dark:text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-neutral-900 dark:text-neutral-200">How it works:</span> {explanation}
        </div>
      </div>
    </div>
  );
}

export function SqlInspectorModal() {
  const profilesSql = `CREATE POLICY profile_isolation ON profiles FOR SELECT USING (id = auth.uid());`;

  const tenantsSql = `CREATE POLICY tenant_isolation ON tenants FOR SELECT USING (id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));`;

  const casesSql = `CREATE POLICY cases_isolation ON cases FOR SELECT USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));`;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="border-neutral-300 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 hover:text-neutral-950 dark:hover:bg-neutral-900 dark:hover:text-white gap-1.5 sm:gap-2 flex items-center font-bold text-[10px] sm:text-xs md:text-sm whitespace-nowrap shrink-0"
        >
          <Database className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-neutral-500 dark:text-neutral-400 shrink-0" />
          Inspect Postgres RLS
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[95vw] max-w-2xl bg-white border border-neutral-250 p-4 sm:p-6 shadow-2xl rounded-xl dark:bg-neutral-950 dark:border-neutral-850 overflow-hidden">
        <DialogHeader className="pb-4 border-b border-neutral-150 dark:border-neutral-800">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-1">
            <Database className="h-5 w-5" />
            <DialogTitle className="text-neutral-950 font-black text-lg sm:text-xl dark:text-neutral-50">
              PostgreSQL Security Architecture
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-medium">
            Review the raw Row Level Security (RLS) policies executing at the database layer.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 w-full min-w-0 overflow-hidden">
          <Tabs defaultValue="profiles" className="w-full min-w-0 overflow-hidden">
            <TabsList className="flex sm:grid sm:grid-cols-3 w-full overflow-x-auto flex-wrap mb-6 bg-neutral-100 dark:bg-neutral-900 p-1 rounded-lg border dark:border-neutral-800">
              <TabsTrigger value="profiles" className="flex-1 text-xs font-black">
                Profiles
              </TabsTrigger>
              <TabsTrigger value="tenants" className="flex-1 text-xs font-black">
                Tenants
              </TabsTrigger>
              <TabsTrigger value="cases" className="flex-1 text-xs font-black">
                Cases
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="max-h-[350px] pr-2 w-full min-w-0">
              <TabsContent value="profiles" className="focus-visible:outline-none w-full min-w-0 overflow-hidden">
                <div className="space-y-3 w-full min-w-0">
                  <h4 className="text-xs font-black text-neutral-400 uppercase tracking-wider">
                    Profile Record Self-Isolation
                  </h4>
                  <SqlCodeBlock
                    sql={profilesSql}
                    explanation="Restricts SELECT queries on the 'profiles' table to rows where the record's primary key (id) exactly matches the authenticated user ID (auth.uid()). This guarantees that no user can scan or retrieve another attorney's profile details."
                  />
                </div>
              </TabsContent>

              <TabsContent value="tenants" className="focus-visible:outline-none w-full min-w-0 overflow-hidden">
                <div className="space-y-3 w-full min-w-0">
                  <h4 className="text-xs font-black text-neutral-400 uppercase tracking-wider">
                    Tenant Firm Boundary Enforcement
                  </h4>
                  <SqlCodeBlock
                    sql={tenantsSql}
                    explanation="Isolates tenant metadata records. A user can only view a tenant row if the user's profile maps directly to that tenant_id. Row filters resolve dynamically using subqueries on the caller's auth context."
                  />
                </div>
              </TabsContent>

              <TabsContent value="cases" className="focus-visible:outline-none w-full min-w-0 overflow-hidden">
                <div className="space-y-3 w-full min-w-0">
                  <h4 className="text-xs font-black text-neutral-400 uppercase tracking-wider">
                    Attorney-Client Privilege Case Isolation
                  </h4>
                  <SqlCodeBlock
                    sql={casesSql}
                    explanation="Secures the core cases ledger. RLS intercepts all select statements and drops cases not sharing the tenant_id defined in the authenticated caller's profile. This prevents cross-tenant data leaks at the lowest engine level."
                  />
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>

        <div className="pt-4 border-t border-neutral-150 dark:border-neutral-800 flex items-center gap-2">
          <ShieldAlert className="h-4.5 w-4.5 text-amber-600 shrink-0" />
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-normal">
            <strong>Security note:</strong> RLS policies execute in the kernel of the PostgreSQL database. 
            They bypass developer code entirely, ensuring that zero-trust boundaries are maintained even 
            if server-side filter code is modified or omitted.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
