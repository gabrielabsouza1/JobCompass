"use client";

import { useCallback, useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import { parseSkillsFromProfile } from "@/lib/profile/skills";
import { parseTargetRolesFromProfile } from "@/lib/profile/target-roles";

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
  skills: string[];
};

export type ProfileSnapshot = {
  fullName: string;
  email: string;
  countryCode: string;
  countryName: string;
  stateCode: string;
  stateName: string;
  cityName: string;
  workMode: string;
  employmentType: string;
  workRights: string;
  targetRoles: string[];
  skills: string[];
};

type ProfileApiResponse = {
  profile?: ProfileSnapshot;
  error?: string;
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

function mapProfileToUser(
  authUserId: string,
  authEmail: string,
  profile: ProfileSnapshot
): CurrentUser {
  const rawFullName =
    profile.fullName || authEmail || "User";
  const fullName = formatName(rawFullName);

  return {
    id: authUserId,
    email: profile.email || authEmail,
    fullName,
    initial: fullName.slice(0, 1).toUpperCase(),
    countryCode: profile.countryCode,
    countryName: profile.countryName,
    stateCode: profile.stateCode,
    stateName: profile.stateName,
    cityName: profile.cityName,
    workMode: profile.workMode,
    employmentType: profile.employmentType,
    workRights: profile.workRights,
    targetRoles: parseTargetRolesFromProfile(profile.targetRoles),
    skills: parseSkillsFromProfile(profile.skills),
  };
}

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  const refreshUser = useCallback(() => {
    setReloadKey((current) => current + 1);
  }, []);

  const applyProfile = useCallback((profile: ProfileSnapshot) => {
    setUser((current) => {
      if (!current) {
        return current;
      }

      return mapProfileToUser(current.id, current.email, profile);
    });
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      setIsLoadingUser(true);

      const supabase = createClient();

      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!isMounted) {
        return;
      }

      if (!authUser) {
        setUser(null);
        setIsLoadingUser(false);
        return;
      }

      const response = await fetch("/api/profile", {
        cache: "no-store",
      });
      const data = (await response.json()) as ProfileApiResponse;

      if (!isMounted) {
        return;
      }

      if (!response.ok || !data.profile) {
        console.error(data.error ?? "Could not load profile");
        setUser(null);
        setIsLoadingUser(false);
        return;
      }

      setUser(mapProfileToUser(authUser.id, authUser.email ?? "", data.profile));
      setIsLoadingUser(false);
    }

    void loadUser();

    return () => {
      isMounted = false;
    };
  }, [reloadKey]);

  return {
    user,
    isLoadingUser,
    refreshUser,
    applyProfile,
  };
}
