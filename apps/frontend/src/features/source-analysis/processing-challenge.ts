export type Turnstile = {
  render(
    element: HTMLElement,
    options: {
      sitekey: string;
      action: string;
      cData: string;
      size: "compact";
      appearance: "interaction-only";
      theme: "dark";
      retry: "never";
      "refresh-expired": "never";
      "refresh-timeout": "never";
      "response-field": false;
      callback(token: string): void;
      "before-interactive-callback"(): void;
      "after-interactive-callback"(): void;
      "error-callback"(): void;
      "expired-callback"(): void;
      "timeout-callback"(): void;
      "unsupported-callback"(): void;
    },
  ): string;
  remove(id: string): void;
};

type ChallengeDocument = Pick<
  Document,
  "createElement" | "head" | "querySelector"
>;
const sdkUrl =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
type SdkLoad = {
  state: "loading" | "ready" | "failed";
  subscribers: Set<{ ready(): void; failed(): void }>;
};
const sdkLoads = new WeakMap<ChallengeDocument, SdkLoad>();

// SDK ownership lasts for the document. Widgets own only their subscription.
function subscribeSdk(
  document: ChallengeDocument,
  api: () => Turnstile | undefined,
  subscriber: { ready(): void; failed(): void },
) {
  let load = sdkLoads.get(document);
  if (!load || load.state === "failed") {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${sdkUrl}"]`,
    );
    const failed = existing?.dataset.clipbuilderTurnstile === "failed";
    if (failed) existing.remove();
    const script =
      !failed && existing ? existing : document.createElement("script");
    load = { state: "loading", subscribers: new Set() };
    sdkLoads.set(document, load);
    const current = load;
    const finish = (state: "ready" | "failed") => {
      if (current.state !== "loading") return;
      current.state = state;
      script.dataset.clipbuilderTurnstile = state;
      script.removeEventListener("load", ready);
      script.removeEventListener("error", fail);
      const subscribers = [...current.subscribers];
      current.subscribers.clear();
      for (const item of subscribers) {
        if (state === "ready") item.ready();
        else item.failed();
      }
    };
    const ready = () => finish(api() ? "ready" : "failed");
    const fail = () => finish("failed");
    if (script.dataset.clipbuilderTurnstile === "ready") {
      current.state = api() ? "ready" : "failed";
      script.dataset.clipbuilderTurnstile = current.state;
    } else {
      script.addEventListener("load", ready);
      script.addEventListener("error", fail);
    }
    if (!existing || failed) {
      script.src = sdkUrl;
      script.async = true;
      script.nonce =
        document.querySelector<HTMLScriptElement>("script[nonce]")?.nonce ?? "";
      script.dataset.clipbuilderTurnstile = "loading";
      // Subscribe before insertion so even a synchronous load is observed.
      current.subscribers.add(subscriber);
      document.head.append(script);
    }
  }
  if (load.state === "ready") subscriber.ready();
  else if (load.state === "failed") subscriber.failed();
  else load.subscribers.add(subscriber);
  const current = load;
  return () => current.subscribers.delete(subscriber);
}

export function mountProcessingChallenge(input: {
  host: HTMLElement;
  document: ChallengeDocument;
  api(): Turnstile | undefined;
  siteKey: string;
  action: string;
  sessionId: string;
  onInteractive(): void;
  onFinished(): void;
  onToken(token: string): void;
  onError(): void;
}): () => void {
  let active = true,
    settled = false,
    failed = false,
    widget: string | undefined,
    widgetApi: Turnstile | undefined;
  const fail = () => {
    if (active && !settled && !failed) {
      failed = true;
      input.onError();
    }
  };
  const mount = () => {
    if (!active || widget !== undefined) return;
    widgetApi = input.api();
    if (!widgetApi) return fail();
    try {
      widget = widgetApi.render(input.host, {
        sitekey: input.siteKey,
        action: input.action,
        cData: input.sessionId,
        size: "compact",
        appearance: "interaction-only",
        theme: "dark",
        retry: "never",
        "refresh-expired": "never",
        "refresh-timeout": "never",
        "response-field": false,
        callback: (token) => {
          if (!active || settled || failed) return;
          settled = true;
          input.onFinished();
          input.onToken(token);
        },
        "before-interactive-callback": () => {
          if (active && !settled && !failed) {
            input.onInteractive();
          }
        },
        "after-interactive-callback": () => {
          if (active && !settled && !failed) input.onFinished();
        },
        "error-callback": fail,
        "expired-callback": fail,
        "timeout-callback": fail,
        "unsupported-callback": fail,
      });
    } catch {
      fail();
    }
  };
  let unsubscribe = () => {};
  if (input.api()) mount();
  else
    unsubscribe = subscribeSdk(input.document, input.api, {
      ready: mount,
      failed: fail,
    });
  return () => {
    if (!active) return;
    active = false;
    if (widget !== undefined) widgetApi?.remove(widget);
    unsubscribe();
  };
}
