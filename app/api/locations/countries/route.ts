import { NextResponse } from "next/server";

import { requireApiUser } from "@/lib/auth/require-api-user";

const API_BASE_URL = "https://api.countrystatecity.in/v1";

export async function GET() {
  const { response } = await requireApiUser();

  if (response) {
    return response;
  }

  const apiKey = process.env.COUNTRY_STATE_CITY_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing Country State City API key" },
      { status: 500 }
    );
  }

  const apiResponse = await fetch(`${API_BASE_URL}/countries`, {
    headers: {
      "X-CSCAPI-KEY": apiKey,
    },
  });

  if (!apiResponse.ok) {
    return NextResponse.json(
      { error: "Could not load countries" },
      { status: apiResponse.status }
    );
  }

  const countries = await apiResponse.json();

  return NextResponse.json(countries);
}