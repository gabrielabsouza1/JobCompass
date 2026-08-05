"use client";

import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

type CurrentUser = {
    id: string;
    email: string;
    fullName: string;
    initial: string;
};

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

            const rawFullName =
                typeof user.user_metadata.full_name === "string"
                    ? user.user_metadata.full_name.trim()
                    : user.email ?? "User";

            const fullName =
                rawFullName.length > 0
                    ? rawFullName
                        .split(" ")
                        .filter(Boolean)
                        .map((namePart) => {
                            return namePart.slice(0, 1).toUpperCase() + namePart.slice(1);
                        })
                        .join(" ")
                    : "User";

            setUser({
                id: user.id,
                email: user.email ?? "",
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