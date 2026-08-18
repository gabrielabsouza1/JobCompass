export type AdzunaWhatParams = {
  what?: string;
};

export function buildAdzunaWhatFromQuery(query: string): AdzunaWhatParams {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return {};
  }

  return { what: trimmedQuery };
}
