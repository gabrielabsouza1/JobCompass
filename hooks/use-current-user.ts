"use client";

import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import {
  parseTargetRolesFromProfile,
  targetRolesFromProfileValue,
} from "@/lib/profile/target-roles";

type CurrentUser = {
  id: string;
  email: string;
  fullName: string;
  initial: string;
  countryCode: string;
  countryName: string;
  stateCode: string;
  stateName: string;
  cityName: string;
  workMode: string;
  employmentType: string;
  workRights: string;
  targetRoles: string[];
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
    let isMounted = true;

    async function loadUser() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!isMounted) {
        return;
      }

      if (!user) {
        setUser(null);
        setIsLoadingUser(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select(
          "full_name, email, country_code, country_name, state_code, state_name, city_name, work_mode, employment_type, work_rights, target_roles"
        )
        .eq("id", user.id)
        .single();

      if (!isMounted) {
        return;
      }

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
        countryCode: profile?.country_code ?? "",
        countryName: profile?.country_name ?? "",
        stateCode: profile?.state_code ?? "",
        stateName: profile?.state_name ?? "",
        cityName: profile?.city_name ?? "",
        workMode: profile?.work_mode ?? "",
        employmentType: profile?.employment_type ?? "",
        workRights: profile?.work_rights ?? "",
        targetRoles: parseTargetRolesFromProfile(profile?.target_roles),
      });

      setIsLoadingUser(false);
    }

    loadUser();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    user,
    isLoadingUser,
  };
}