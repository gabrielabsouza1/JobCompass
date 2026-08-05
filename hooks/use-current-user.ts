"use client";

import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

type CurrentUser = {
  id: string;
  email: string;
  fullName: string;
  initial: string;
  preferredLocation: string;
  workMode: string;
  employmentType: string;
  workRights: string;
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
        .select("full_name, email, preferred_location, work_mode, employment_type, work_rights")
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
        preferredLocation: profile?.preferred_location ?? "Melbourne, VIC",
        workMode: profile?.work_mode ?? "Hybrid or Onsite",
        employmentType: profile?.employment_type ?? "Full-time",
        workRights:
          profile?.work_rights ?? "Partner visa · Full-time work allowed",
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