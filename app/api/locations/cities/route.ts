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
  const stateCode = request.nextUrl.searchParams.get("stateCode");

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

  if (!stateCode) {
    return NextResponse.json({ error: "Missing stateCode" }, { status: 400 });
  }

  const apiResponse = await fetch(
    `${API_BASE_URL}/countries/${countryCode}/states/${stateCode}/cities`,
    {
      headers: {
        "X-CSCAPI-KEY": apiKey,
      },
    }
  );

  if (!apiResponse.ok) {
    return NextResponse.json(
      { error: "Could not load cities" },
      { status: apiResponse.status }
    );
  }

  const cities = await apiResponse.json();

  return NextResponse.json(cities);
}