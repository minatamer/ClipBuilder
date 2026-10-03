"use client";
import { useEffect, useRef } from "react";

type Turnstile = {
  render(
    element: HTMLElement,
    options: {
      sitekey: string;
      action: string;
      cData: string;
      size: "compact";
      callback(token: string): void;
      "error-callback"(): void;
      "expired-callback"(): void;
    },
  ): string;
  remove(id: string): void;
};
declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}
export function AnalysisChallenge({
  siteKey,
  action,
  sessionId,
  onToken,
  onFailure,
}: {
  siteKey: string;
  action: "transcription" | "candidate-analysis";
  sessionId: string;
  onToken(token: string): void;
  onFailure(): void;
}) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let active = true,
      widget: string | undefined;
    const mount = () => {
      if (active && host.current && window.turnstile)
        widget = window.turnstile.render(host.current, {
          sitekey: siteKey,
          action,
          cData: sessionId,
          size: "compact",
          callback: (token) => {
            if (active) onToken(token);
          },
          "error-callback": onFailure,
          "expired-callback": onFailure,
        });
    };
    const script = document.createElement("script");
    script.src =
      "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    if (window.turnstile) mount();
    else {
      script.addEventListener("load", mount);
      script.addEventListener("error", onFailure);
      document.head.append(script);
    }
    return () => {
      active = false;
      if (widget) window.turnstile?.remove(widget);
      script.removeEventListener("load", mount);
      script.removeEventListener("error", onFailure);
      script.remove();
    };
  }, [action, onFailure, onToken, sessionId, siteKey]);
  return <div ref={host} aria-label="Processing verification" />;
}
