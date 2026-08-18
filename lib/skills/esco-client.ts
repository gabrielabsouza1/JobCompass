const ESCO_API_BASE_URL =
  process.env.ESCO_API_BASE_URL ?? "https://ec.europa.eu/esco/api";

export type EscoSkillResult = {
  name: string;
  uri: string;
  type: string | null;
};

type EscoSearchResponse = {
  _embedded?: {
    results?: Array<{
      uri?: string;
      title?: string;
      preferredLabel?: {
        en?: string;
      };
      hasSkillType?: string[];
    }>;
  };
};

function extractEscoSkillType(skillTypes?: string[]) {
  if (!skillTypes?.length) {
    return null;
  }

  const rawType = skillTypes[0];
  const segments = rawType.split("/");

  return segments[segments.length - 1] ?? null;
}

export async function searchEscoSkills(
  query: string,
  limit = 5
): Promise<EscoSkillResult[]> {
  const trimmedQuery = query.trim();

  if (trimmedQuery.length < 3) {
    return [];
  }

  const searchParams = new URLSearchParams({
    text: trimmedQuery,
    language: "en",
    type: "skill",
    limit: String(Math.min(Math.max(limit, 1), 10)),
    full: "false",
    viewObsolete: "false",
  });

  const response = await fetch(`${ESCO_API_BASE_URL}/search?${searchParams}`, {
    headers: {
      Accept: "application/json",
    },
    next: { revalidate: 60 * 60 },
  });

  if (!response.ok) {
    throw new Error(`ESCO search failed with status ${response.status}`);
  }

  const data = (await response.json()) as EscoSearchResponse;
  const results = data._embedded?.results ?? [];

  return results
    .map((result) => {
      const name =
        result.preferredLabel?.en?.trim() ||
        result.title?.trim() ||
        "";

      if (!name || !result.uri) {
        return null;
      }

      return {
        name,
        uri: result.uri,
        type: extractEscoSkillType(result.hasSkillType),
      };
    })
    .filter((result): result is EscoSkillResult => result !== null);
}
