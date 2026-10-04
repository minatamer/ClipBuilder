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

export function mountProcessingChallenge(input: {
  host: HTMLElement;
  document: Pick<Document, "createElement" | "head">;
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
    widgetApi: Turnstile | undefined,
    script: HTMLScriptElement | undefined;
  const fail = () => {
    if (active && !settled) {
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
          if (!active || settled) return;
          settled = true;
          input.onFinished();
          input.onToken(token);
        },
        "before-interactive-callback": () => {
          if (active && !settled) {
            failed = false;
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
  if (input.api()) mount();
  else {
    script = input.document.createElement("script");
    script.src =
      "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.addEventListener("load", mount);
    script.addEventListener("error", fail);
    input.document.head.append(script);
  }
  return () => {
    if (!active) return;
    active = false;
    if (widget !== undefined) widgetApi?.remove(widget);
    script?.removeEventListener("load", mount);
    script?.removeEventListener("error", fail);
    script?.remove();
  };
}
