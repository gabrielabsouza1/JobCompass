"use client";

import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import {
  DEFAULT_SELECTED_SOURCE_IDS,
  getJobSourceById,
} from "@/lib/jobs/source-registry";

const DEFAULT_SELECTED_SOURCES = DEFAULT_SELECTED_SOURCE_IDS;

type UserSourceRow = {
  source_id: string;
};

export function useJobSources() {
  const [selectedSourceIds, setSelectedSourceIds] = useState<string[]>([]);
  const [isLoadingSources, setIsLoadingSources] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadSources() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!isMounted) {
        return;
      }

      if (!user) {
        setSelectedSourceIds(DEFAULT_SELECTED_SOURCES);
        setIsLoadingSources(false);
        return;
      }

      const { data, error } = await supabase
        .from("user_sources")
        .select("source_id")
        .eq("user_id", user.id);

      if (!isMounted) {
        return;
      }

      if (error) {
        console.error(error);
        setSelectedSourceIds(DEFAULT_SELECTED_SOURCES);
        setIsLoadingSources(false);
        return;
      }

      if (data.length === 0) {
        const { error: insertError } = await supabase.from("user_sources").insert(
          DEFAULT_SELECTED_SOURCES.map((sourceId) => ({
            user_id: user.id,
            source_id: sourceId,
          }))
        );

        if (insertError) {
          console.error(insertError);
        }

        setSelectedSourceIds(DEFAULT_SELECTED_SOURCES);
        setIsLoadingSources(false);
        return;
      }

      setSelectedSourceIds(
        (data as UserSourceRow[]).map((source) => source.source_id)
      );
      setIsLoadingSources(false);
    }

    loadSources();

    return () => {
      isMounted = false;
    };
  }, []);

  function isSourceSelected(sourceId: string) {
    return selectedSourceIds.includes(sourceId);
  }

  async function toggleSource(sourceId: string) {
    const source = getJobSourceById(sourceId);

    if (source && !source.selectable) {
      return;
    }

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return;
    }

    const alreadySelected = selectedSourceIds.includes(sourceId);

    if (alreadySelected) {
      const { error } = await supabase
        .from("user_sources")
        .delete()
        .eq("user_id", user.id)
        .eq("source_id", sourceId);

      if (error) {
        console.error(error);
        return;
      }

      setSelectedSourceIds((currentSources) =>
        currentSources.filter((id) => id !== sourceId)
      );

      return;
    }

    if (selectedSourceIds.length >= 5) {
      return;
    }

    const { error } = await supabase.from("user_sources").upsert(
      {
        user_id: user.id,
        source_id: sourceId,
      },
      {
        onConflict: "user_id,source_id",
        ignoreDuplicates: true,
      }
    );

    if (error) {
      console.error(error);
      return;
    }

    setSelectedSourceIds((currentSources) => {
      if (currentSources.includes(sourceId)) {
        return currentSources;
      }

      return [...currentSources, sourceId];
    });
  }

  async function resetSources() {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSelectedSourceIds(DEFAULT_SELECTED_SOURCES);
      return;
    }

    const { error: deleteError } = await supabase
      .from("user_sources")
      .delete()
      .eq("user_id", user.id);

    if (deleteError) {
      console.error(deleteError);
      return;
    }

    const { error: insertError } = await supabase.from("user_sources").upsert(
      DEFAULT_SELECTED_SOURCES.map((sourceId) => ({
        user_id: user.id,
        source_id: sourceId,
      })),
      {
        onConflict: "user_id,source_id",
        ignoreDuplicates: true,
      }
    );

    if (insertError) {
      console.error(insertError);
      return;
    }

    setSelectedSourceIds(DEFAULT_SELECTED_SOURCES);
  }

  return {
    selectedSourceIds,
    isLoadingSources,
    isSourceSelected,
    toggleSource,
    resetSources,
  };
}