"use client";

import { ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  buildSmartSearchParamsFromProfile,
  buildSmartSearchUrl,
} from "@/lib/jobs/smart-links/build-smart-search-url";
import {
  getSelectedSmartLinkSources,
  type JobSourceMeta,
} from "@/lib/jobs/source-registry";

type SmartLinkPanelProps = {
  selectedSourceIds: string[];
  profile?: {
    targetRoles?: string[];
    cityName?: string;
    stateName?: string;
    countryName?: string;
    workMode?: string;
  };
  title?: string;
  description?: string;
};

function openSmartLink(source: JobSourceMeta, href: string) {
  window.open(href, "_blank", "noopener,noreferrer");
}

export function SmartLinkPanel({
  selectedSourceIds,
  profile,
  title = "Search on external platforms",
  description = "These platforms open in a new tab with your role and location pre-filled from your profile.",
}: SmartLinkPanelProps) {
  const smartLinkSources = getSelectedSmartLinkSources(selectedSourceIds);
  const searchParams = buildSmartSearchParamsFromProfile(profile ?? {});

  if (smartLinkSources.length === 0) {
    return null;
  }

  return (
    <Card className="rounded-3xl border-sky-100 bg-sky-50 shadow-sm">
      <CardContent className="p-5">
        <h2 className="text-lg font-bold text-slate-950">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {smartLinkSources.map((source) => {
            const href = buildSmartSearchUrl(source.id, searchParams);

            if (!href) {
              return null;
            }

            return (
              <Button
                key={source.id}
                type="button"
                variant="outline"
                className="h-11 justify-between rounded-2xl border-sky-200 bg-white text-slate-700 hover:bg-white hover:text-teal-700"
                onClick={() => openSmartLink(source, href)}
              >
                <span>{source.name}</span>
                <ExternalLink className="h-4 w-4" />
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
