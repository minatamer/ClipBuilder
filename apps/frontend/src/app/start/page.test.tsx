import { afterEach, expect, it, vi } from "vitest";
vi.mock("../../features/local-editing/experience", () => ({
  LocalEditingExperience: () => null,
}));
import StartPage from "./page";
import { LocalEditingExperience } from "../../features/local-editing/experience";
afterEach(() => vi.unstubAllEnvs());
it("opens the current upload/editor locally", () => {
  vi.stubEnv("APP_ENV", "local");
  const page = StartPage();
  expect(page.type).toBe(LocalEditingExperience);
  expect(page.props.hosted).toBe(false);
});
it("opens the same upload/editor with hosted boundaries", () => {
  vi.stubEnv("APP_ENV", "preview");
  vi.stubEnv("FRONTEND_ORIGIN", "https://frontend.run.app");
  vi.stubEnv("PRIVATE_BACKEND_ORIGIN", "https://backend.run.app");
  vi.stubEnv("BACKEND_AUDIENCE", "https://backend.run.app");
  const page = StartPage();
  expect(page.type).toBe(LocalEditingExperience);
  expect(page.props.hosted).toBe(true);
});
