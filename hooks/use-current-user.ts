"use client";

import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

type CurrentUser = {
  id: string;
  email: string;
  fullName: string;
  initial: string;
};

function formatName(name: string) {
  return name
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((namePart) => {
      return namePart.slice(0, 1).toUpperCase() + namePart.slice(1);
    })
    .join(" ");
}

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setUser(null);
        setIsLoadingUser(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", user.id)
        .single();

      const rawFullName =
        profile?.full_name ??
        user.user_metadata.full_name ??
        user.email ??
        "User";

      const fullName = formatName(rawFullName);

      setUser({
        id: user.id,
        email: profile?.email ?? user.email ?? "",
        fullName,
        initial: fullName.slice(0, 1).toUpperCase(),
      });

      setIsLoadingUser(false);
    }

    loadUser();
  }, []);

  return {
    user,
    isLoadingUser,
  };
}