import { describe, expect, it } from "vitest";

import { createTestJob } from "@/lib/test/create-test-job";
import {
  parseJobSnapshot,
  serializeJobSnapshot,
} from "@/lib/jobs/saved-job-snapshot";

describe("saved-job-snapshot", () => {
  it("serializes and parses valid job snapshots", () => {
    const job = createTestJob({ id: "adzuna-123" });
    const serialized = serializeJobSnapshot(job);

    expect(parseJobSnapshot(serialized)).toEqual(serialized);
  });

  it("rejects invalid snapshot payloads", () => {
    expect(parseJobSnapshot(null)).toBeNull();
    expect(parseJobSnapshot({ title: "Missing id" })).toBeNull();
  });
});
