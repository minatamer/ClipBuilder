import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { AnalysisChallenge } from "./analysis-challenge";
import {
  mountProcessingChallenge,
  type Turnstile,
} from "./processing-challenge";

function fixture(loaded = true) {
  const createScript = () =>
    Object.assign(new EventTarget(), {
      src: "",
      async: false,
      nonce: "",
      dataset: {} as Record<string, string>,
      remove: vi.fn(),
    });
  let script = createScript();
  let created = false;
  let appended: typeof script | undefined;
  const append = vi.fn((value: typeof script) => {
    appended = value;
  });
  const document = {
    createElement: vi.fn(() => {
      if (created) script = createScript();
      created = true;
      const current = script;
      current.remove.mockImplementation(() => {
        if (appended === current) appended = undefined;
      });
      return script;
    }),
    querySelector: vi.fn((selector: string) =>
      selector === "script[nonce]"
        ? { nonce: "synthetic-document-nonce" }
        : appended,
    ),
    head: { append },
  } as unknown as Pick<Document, "createElement" | "head" | "querySelector">;
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
    get script() {
      return script;
    },
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
    expect(f.script.remove).not.toHaveBeenCalled();
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

  it("shares one nonce-bearing SDK load across Strict Mode remounts and concurrent widgets", () => {
    const f = fixture(false);
    const stale = mountProcessingChallenge(f.input);
    stale();
    const stop = mountProcessingChallenge(f.input);
    const other = { ...f.input, onToken: vi.fn(), onError: vi.fn() };
    const stopOther = mountProcessingChallenge(other);
    expect(f.append).toHaveBeenCalledOnce();
    expect(f.script.nonce).toBe("synthetic-document-nonce");
    expect(f.script.remove).not.toHaveBeenCalled();
    f.load();
    expect(f.sdk.render).toHaveBeenCalledTimes(2);
    const options = vi.mocked(f.sdk.render).mock.calls.map((call) => call[1]);
    options[0]!.callback("first-token");
    options[1]!.callback("second-token");
    expect(f.input.onToken).toHaveBeenCalledExactlyOnceWith("first-token");
    expect(other.onToken).toHaveBeenCalledExactlyOnceWith("second-token");
    stop();
    stopOther();
    const stopSequential = mountProcessingChallenge(f.input);
    expect(f.sdk.render).toHaveBeenCalledTimes(3);
    expect(f.append).toHaveBeenCalledOnce();
    stopSequential();
    expect(f.sdk.remove).toHaveBeenCalledTimes(3);
  });

  it("reuses an existing SDK script across another module's loading lifetime", () => {
    const f = fixture(false);
    f.script.src =
      "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    f.append(f.script);
    const stop = mountProcessingChallenge(f.input);
    expect(f.append).toHaveBeenCalledOnce();
    f.load();
    expect(f.sdk.render).toHaveBeenCalledOnce();
    stop();
    expect(f.script.remove).not.toHaveBeenCalled();
  });

  it("retries a failed shared load once and rejects old load/error/widget callbacks", () => {
    const f = fixture(false);
    const stop = mountProcessingChallenge(f.input);
    const old = f.script;
    old.dispatchEvent(new Event("error"));
    old.dispatchEvent(new Event("error"));
    expect(f.input.onError).toHaveBeenCalledOnce();
    stop();
    const stopRetry = mountProcessingChallenge(f.input);
    expect(f.append).toHaveBeenCalledTimes(2);
    expect(old.remove).toHaveBeenCalledOnce();
    old.dispatchEvent(new Event("load"));
    expect(f.sdk.render).not.toHaveBeenCalled();
    f.load();
    f.options()["error-callback"]();
    f.options().callback("late-after-error");
    expect(f.input.onToken).not.toHaveBeenCalled();
    stopRetry();
  });

  it("treats a load without the SDK as failed so verification can retry", () => {
    const f = fixture(false);
    const stop = mountProcessingChallenge(f.input);
    f.script.dispatchEvent(new Event("load"));
    expect(f.input.onError).toHaveBeenCalledOnce();
    stop();
    const retry = mountProcessingChallenge(f.input);
    expect(f.append).toHaveBeenCalledTimes(2);
    f.load();
    expect(f.sdk.render).toHaveBeenCalledOnce();
    retry();
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
