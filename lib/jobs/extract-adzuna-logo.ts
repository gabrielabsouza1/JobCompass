export function normalizeAdzunaStaticUrl(url: string): string {
  if (url.startsWith("//")) {
    return `https:${url}`;
  }

  return url;
}

export function extractLogoUrlFromAdzunaHtml(html: string): string | undefined {
  const matches = html.matchAll(
    /(?:https?:)?\/\/zunastatic[^"'\s>]+partners\/[^"'\s>]+\.(?:png|jpg|svg|webp)/gi
  );

  for (const match of matches) {
    const url = normalizeAdzunaStaticUrl(match[0]);

    if (
      url.includes("logo_adzuna_network") ||
      url.includes("fb_share") ||
      url.includes("favicon")
    ) {
      continue;
    }

    return url;
  }

  return undefined;
}

export async function fetchAdzunaLogoUrl(
  redirectUrl: string
): Promise<string | undefined> {
  try {
    const response = await fetch(redirectUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; JobCompass/1.0)",
        Accept: "text/html",
      },
      signal: AbortSignal.timeout(4000),
      next: {
        revalidate: 86400,
      },
    });

    if (!response.ok) {
      return undefined;
    }

    const html = await response.text();

    return extractLogoUrlFromAdzunaHtml(html);
  } catch {
    return undefined;
  }
}
