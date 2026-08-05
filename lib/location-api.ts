export type CountryOption = {
  name: string;
  iso2: string;
  iso3: string;
};

export type StateOption = {
  name: string;
  iso2: string;
};

export type CityOption = {
  name: string;
};

async function fetchInternalApi<T>(path: string): Promise<T[]> {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error("Could not load location data");
  }

  return response.json();
}

export async function getCountries() {
  return fetchInternalApi<CountryOption>("/api/locations/countries");
}

export async function getStates(countryCode: string) {
  return fetchInternalApi<StateOption>(
    `/api/locations/states?countryCode=${countryCode}`
  );
}

export async function getCities(countryCode: string, stateCode: string) {
  return fetchInternalApi<CityOption>(
    `/api/locations/cities?countryCode=${countryCode}&stateCode=${stateCode}`
  );
}