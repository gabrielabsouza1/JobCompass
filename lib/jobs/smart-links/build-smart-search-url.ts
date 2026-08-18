export type SmartSearchParams = {
  query?: string;
  location?: string;
  workMode?: string;
};

function buildQuery(params: SmartSearchParams) {
  const parts = [params.query?.trim(), params.workMode?.trim()]
    .filter(Boolean)
    .join(" ");

  return parts.trim();
}

function buildLocation(params: SmartSearchParams) {
  return params.location?.trim() ?? "";
}

export function buildSeekSearchUrl(params: SmartSearchParams) {
  const url = new URL("https://www.seek.com.au/jobs");
  const keywords = buildQuery(params);
  const where = buildLocation(params);

  if (keywords) {
    url.searchParams.set("keywords", keywords);
  }

  if (where) {
    url.searchParams.set("where", where);
  }

  return url.toString();
}

export function buildLinkedInSearchUrl(params: SmartSearchParams) {
  const url = new URL("https://www.linkedin.com/jobs/search/");
  const keywords = buildQuery(params);
  const location = buildLocation(params);

  if (keywords) {
    url.searchParams.set("keywords", keywords);
  }

  if (location) {
    url.searchParams.set("location", location);
  }

  return url.toString();
}

export function buildIndeedSearchUrl(params: SmartSearchParams) {
  const url = new URL("https://au.indeed.com/jobs");
  const keywords = buildQuery(params);
  const location = buildLocation(params);

  if (keywords) {
    url.searchParams.set("q", keywords);
  }

  if (location) {
    url.searchParams.set("l", location);
  }

  return url.toString();
}

export function buildJoraSearchUrl(params: SmartSearchParams) {
  const url = new URL("https://au.jora.com/j");
  const keywords = buildQuery(params);
  const location = buildLocation(params);

  url.searchParams.set("sp", "search");

  if (keywords) {
    url.searchParams.set("q", keywords);
  }

  if (location) {
    url.searchParams.set("l", location);
  }

  return url.toString();
}

export function buildWorkforceAustraliaSearchUrl(params: SmartSearchParams) {
  const url = new URL(
    "https://www.workforceaustralia.gov.au/individuals/jobs/search"
  );
  const keywords = buildQuery(params);
  const location = buildLocation(params);

  if (keywords) {
    url.searchParams.set("searchText", keywords);
  }

  if (location) {
    url.searchParams.set("location", location);
  }

  return url.toString();
}

export function buildSmartSearchUrl(
  sourceId: string,
  params: SmartSearchParams
) {
  switch (sourceId) {
    case "seek":
      return buildSeekSearchUrl(params);
    case "linkedin":
      return buildLinkedInSearchUrl(params);
    case "indeed":
      return buildIndeedSearchUrl(params);
    case "jora":
      return buildJoraSearchUrl(params);
    case "workforce":
      return buildWorkforceAustraliaSearchUrl(params);
    default:
      return null;
  }
}

export function buildSmartSearchParamsFromProfile(profile: {
  targetRoles?: string[];
  cityName?: string;
  stateName?: string;
  countryName?: string;
  workMode?: string;
}) {
  const location = [profile.cityName, profile.stateName, profile.countryName]
    .filter(Boolean)
    .join(", ");

  return {
    query: profile.targetRoles?.[0] ?? "",
    location,
    workMode:
      profile.workMode && profile.workMode !== "any" ? profile.workMode : "",
  };
}
