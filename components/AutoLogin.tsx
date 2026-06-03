"use client";

import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export function AutoLogin() {
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function performAutoLogin() {
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: "apex@legal.com",
          password: "password123",
        });

        if (!error) {
          // Set the client-side cookie directly if missing to align state
          if (typeof document !== "undefined" && !document.cookie.includes("sb-mock-email")) {
            document.cookie = "sb-mock-email=apex@legal.com; path=/; max-age=3600;";
          }
          // Refresh the page context to trigger server-side re-evaluation
          router.refresh();
        }
      } catch (err) {
        console.error("Auto login exception: ", err);
      }
    }
    performAutoLogin();
  }, [supabase, router]);

  return null;
}
