import { afterEach, expect, it, vi } from "vitest";
vi.mock("../../features/sample/sample.experience", () => ({
  SampleExperience: () => null,
}));
vi.mock("../../features/local-editing/experience", () => ({
  LocalEditingExperience: () => null,
}));
import StartPage from "./page";
import { SampleExperience } from "../../features/sample/sample.experience";
import { LocalEditingExperience } from "../../features/local-editing/experience";
afterEach(() => vi.unstubAllEnvs());
it("adds local controls while preserving the existing sample link", async () => {
  vi.stubEnv("APP_ENV", "local");
  expect((await StartPage({ searchParams: Promise.resolve({}) })).type).toBe(
    LocalEditingExperience,
  );
  const sample = await StartPage({
    searchParams: Promise.resolve({ source: "sample" }),
  });
  expect(sample.type).toBe(SampleExperience);
  expect(sample.props.sampleRequested).toBe(true);
});
it("opens the shared upload/editor on hosted start and ignores the local sample bypass", async () => {
  vi.stubEnv("APP_ENV", "preview");
  vi.stubEnv("FRONTEND_ORIGIN", "https://frontend.run.app");
  vi.stubEnv("PRIVATE_BACKEND_ORIGIN", "https://backend.run.app");
  vi.stubEnv("BACKEND_AUDIENCE", "https://backend.run.app");
  for (const query of [{}, { source: "sample" }]) {
    const page = await StartPage({ searchParams: Promise.resolve(query) });
    expect(page.type).toBe(LocalEditingExperience);
    expect(page.props.hosted).toBe(true);
  }
});
