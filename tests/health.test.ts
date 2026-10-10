import { describe, expect, it } from "bun:test";
import { GET } from "@/app/api/health/route";

describe("Health API Route", () => {
  it("returns status ok and 200 response", async () => {
    const response = await GET();
    expect(response.status).toBe(200);

    const body = (await response.json()) as { status: string; timestamp: string };
    expect(body.status).toBe("ok");
    expect(typeof body.timestamp).toBe("string");
  });
});
