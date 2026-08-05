import { NextRequest, NextResponse } from "next/server";

import { requireApiUser } from "@/lib/auth/require-api-user";

const API_BASE_URL = "https://api.countrystatecity.in/v1";

export async function GET(request: NextRequest) {
  const { response } = await requireApiUser();

  if (response) {
    return response;
  }

  const apiKey = process.env.COUNTRY_STATE_CITY_API_KEY;
  const countryCode = request.nextUrl.searchParams.get("countryCode");

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing Country State City API key" },
      { status: 500 }
    );
  }

  if (!countryCode) {
    return NextResponse.json(
      { error: "Missing countryCode" },
      { status: 400 }
    );
  }

  const apiResponse = await fetch(
    `${API_BASE_URL}/countries/${countryCode}/states`,
    {
      headers: {
        "X-CSCAPI-KEY": apiKey,
      },
    }
  );

  if (!apiResponse.ok) {
    return NextResponse.json(
      { error: "Could not load states" },
      { status: apiResponse.status }
    );
  }

  const states = await apiResponse.json();

  return NextResponse.json(states);
}