import { describe, expect, it } from "vitest";

import { getJoobleApiHost } from "@/lib/jobs/jooble-domains";

describe("getJoobleApiHost", () => {
  it("maps country codes to regional Jooble domains", () => {
    expect(getJoobleApiHost("AU")).toBe("au.jooble.org");
    expect(getJoobleApiHost("US")).toBe("jooble.org");
    expect(getJoobleApiHost("GB")).toBe("uk.jooble.org");
  });

  it("defaults to the Australian domain", () => {
    expect(getJoobleApiHost()).toBe("au.jooble.org");
    expect(getJoobleApiHost("ZZ")).toBe("au.jooble.org");
  });
});
