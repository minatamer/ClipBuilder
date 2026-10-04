import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { AnalysisChallenge } from "./analysis-challenge";
import {
  mountProcessingChallenge,
  type Turnstile,
} from "./processing-challenge";

function fixture(loaded = true) {
  const script = Object.assign(new EventTarget(), {
    src: "",
    async: false,
    remove: vi.fn(),
  });
  const append = vi.fn();
  const document = {
    createElement: vi.fn(() => script),
    head: { append },
  } as unknown as Pick<Document, "createElement" | "head">;
  const sdk: Turnstile = {
    render: vi.fn(() => "synthetic-widget"),
    remove: vi.fn(),
  };
  let api: Turnstile | undefined = loaded ? sdk : undefined;
  const input = {
    document,
    api: () => api,
    host: {} as HTMLElement,
    siteKey: "synthetic-site-key",
    action: "candidate-analysis",
    sessionId: "synthetic-session",
    onToken: vi.fn(),
    onInteractive: vi.fn(),
    onFinished: vi.fn(),
    onError: vi.fn(),
  };
  return {
    input,
    sdk,
    append,
    script,
    load: () => {
      api = sdk;
      script.dispatchEvent(new Event("load"));
    },
    options: () => vi.mocked(sdk.render).mock.calls[0]![1],
  };
}

describe("background processing verification", () => {
  it("runs without a dialog, reveals interaction only on request, and settles one token", () => {
    const f = fixture();
    const stop = mountProcessingChallenge(f.input);
    const options = f.options();
    expect(options).toMatchObject({
      appearance: "interaction-only",
      retry: "never",
      "refresh-expired": "never",
      "refresh-timeout": "never",
      "response-field": false,
      action: f.input.action,
      cData: f.input.sessionId,
    });
    expect(f.append).not.toHaveBeenCalled();
    expect(f.input.onInteractive).not.toHaveBeenCalled();
    options["before-interactive-callback"]();
    expect(f.input.onInteractive).toHaveBeenCalledOnce();
    options.callback("synthetic-token");
    options.callback("duplicate-token");
    options["expired-callback"]();
    expect(f.input.onToken).toHaveBeenCalledExactlyOnceWith("synthetic-token");
    expect(f.input.onFinished).toHaveBeenCalledOnce();
    expect(f.input.onError).not.toHaveBeenCalled();
    stop();
    stop();
    expect(f.sdk.remove).toHaveBeenCalledExactlyOnceWith("synthetic-widget");
  });

  it.each([
    "error-callback",
    "expired-callback",
    "timeout-callback",
    "unsupported-callback",
  ] as const)(
    "keeps a %s failure visible without publishing a token",
    (event) => {
      const f = fixture();
      const stop = mountProcessingChallenge(f.input);
      f.options()[event]();
      f.options()["after-interactive-callback"]();
      expect(f.input.onError).toHaveBeenCalledOnce();
      expect(f.input.onFinished).not.toHaveBeenCalled();
      expect(f.input.onToken).not.toHaveBeenCalled();
      stop();
    },
  );

  it("loads one owned script/widget and ignores every late callback after cleanup", () => {
    const f = fixture(false);
    const stop = mountProcessingChallenge(f.input);
    expect(f.append).toHaveBeenCalledExactlyOnceWith(f.script);
    expect(f.sdk.render).not.toHaveBeenCalled();
    f.load();
    f.load();
    expect(f.sdk.render).toHaveBeenCalledOnce();
    stop();
    f.load();
    f.script.dispatchEvent(new Event("error"));
    f.options().callback("late-token");
    f.options()["before-interactive-callback"]();
    f.options()["after-interactive-callback"]();
    f.options()["error-callback"]();
    expect(f.sdk.render).toHaveBeenCalledOnce();
    expect(f.script.remove).toHaveBeenCalledOnce();
    expect(f.input.onError).not.toHaveBeenCalled();
    expect(f.input.onToken).not.toHaveBeenCalled();
    expect(f.input.onInteractive).not.toHaveBeenCalled();
    expect(f.input.onFinished).not.toHaveBeenCalled();
  });

  it("reports script failure and allows a fresh verification mount without any workflow dispatch", () => {
    const f = fixture(false);
    const stop = mountProcessingChallenge(f.input);
    f.script.dispatchEvent(new Event("error"));
    expect(f.input.onError).toHaveBeenCalledOnce();
    stop();
    f.load();
    const stopRetry = mountProcessingChallenge(f.input);
    expect(f.sdk.render).toHaveBeenCalledOnce();
    expect(f.input.onToken).not.toHaveBeenCalled();
    f.options().callback("retry-token");
    expect(f.input.onToken).toHaveBeenCalledExactlyOnceWith("retry-token");
    stopRetry();
  });

  it("starts with a closed accessible dialog and no initial visible verification copy", () => {
    const markup = renderToStaticMarkup(
      <AnalysisChallenge
        siteKey="synthetic-site-key"
        action="transcription"
        sessionId="synthetic-session"
        onToken={() => {}}
        onFailure={() => {}}
      />,
    );
    expect(markup).toMatch(/<dialog[^>]*aria-labelledby=/);
    expect(markup).not.toMatch(/<dialog[^>]*\bopen(?:=|\s|>)/);
    expect(markup).toContain("Quick verification");
    expect(markup).toContain("Complete this check to continue.");
    expect(markup).toContain("Cancel");
    expect(markup).not.toContain("Try again");
    expect(markup).not.toContain("<script");
  });
});
