import {
  BROWSER_CONSOLE_LEVELS,
  BROWSER_REACT_COMPONENTS,
  browserConsoleDiagnosticSchema,
  browserErrorDigestSchema,
  type BrowserDiagnostic,
} from "@clipbuilder/contracts";
import { currentEditorDiagnostic } from "./editor-lifecycle";
import { captureOwnerStack } from "react";

type DiagnosticConsole = Pick<Console, (typeof BROWSER_CONSOLE_LEVELS)[number]>;
const installations = new WeakMap<DiagnosticConsole, () => void>();

/** Route client/framework console events privately before React captures its logger. */
export function installPrivateBrowserConsole(
  target: DiagnosticConsole,
  events: EventTarget,
  report: (value: BrowserDiagnostic) => void,
): () => void {
  const installed = installations.get(target);
  if (installed) return installed;
  const restores: (() => void)[] = [];
  let reactWindow = 0,
    reactReports = 0;
  const emit = (
    level: (typeof BROWSER_CONSOLE_LEVELS)[number],
    source: "console" | "error-event" | "unhandled-rejection",
    values: unknown[],
  ) => {
    try {
      const error = values.find((value) => value instanceof Error);
      const errorClass =
        error instanceof Error &&
        browserConsoleDiagnosticSchema.shape.errorClass.safeParse(error.name)
          .success
          ? error.name
          : undefined;
      const digest = browserErrorDigestSchema.safeParse(
        error instanceof Error && "digest" in error ? error.digest : undefined,
      );
      // Classify known framework messages; never retain/transmit their text or paths.
      const strings = values
        .filter((value): value is string => typeof value === "string")
        .slice(0, 8)
        .map((value) => value.slice(0, 8192));
      if (error instanceof Error) strings.push(error.message.slice(0, 8192));
      const text = strings.join(" ");
      const reactIssue = text.includes("Maximum update depth exceeded")
        ? "maximum-update-depth"
        : text.includes("Too many re-renders")
          ? "too-many-renders"
          : text.includes("getSnapshot should be cached")
            ? "uncached-snapshot"
            : undefined;
      const stack = reactIssue
        ? `${text}\n${error?.stack?.slice(0, 16384) ?? ""}\n${captureOwnerStack?.()?.slice(0, 8192) ?? ""}`
        : "";
      const components = reactIssue
        ? BROWSER_REACT_COMPONENTS.filter((name) =>
            new RegExp(`\\b${name}\\b`, "u").test(stack),
          )
        : [];
      const editor = reactIssue ? currentEditorDiagnostic() : undefined;
      if (reactIssue) {
        const now = Date.now();
        if (now < reactWindow || now - reactWindow >= 60_000) {
          reactWindow = now;
          reactReports = 0;
        }
        if (reactReports >= 12) return;
        reactReports++;
      }
      report(
        browserConsoleDiagnosticSchema.parse({
          kind: "browser-console",
          level,
          source,
          argumentCount: Math.min(1000, values.length),
          ...(errorClass ? { errorClass } : {}),
          ...(digest.success ? { digest: digest.data } : {}),
          ...(reactIssue ? { reactIssue } : {}),
          ...(components.length ? { components } : {}),
          ...(editor ? { editor } : {}),
        }),
      );
    } catch {
      // Never recurse into a console or allow monitoring failure to affect the app.
    }
  };
  for (const level of BROWSER_CONSOLE_LEVELS) {
    const original = target[level];
    const redirect = (...values: unknown[]) => emit(level, "console", values);
    target[level] = redirect;
    restores.push(() => {
      if (target[level] === redirect) target[level] = original;
    });
  }
  const error = (event: Event) => {
    event.preventDefault();
    emit(
      "error",
      "error-event",
      event instanceof ErrorEvent ? [event.error] : [],
    );
  };
  const rejection = (event: Event) => {
    event.preventDefault();
    emit(
      "error",
      "unhandled-rejection",
      "reason" in event ? [event.reason] : [],
    );
  };
  events.addEventListener("error", error);
  events.addEventListener("unhandledrejection", rejection);
  const dispose = () => {
    events.removeEventListener("error", error);
    events.removeEventListener("unhandledrejection", rejection);
    for (const restore of restores) restore();
    installations.delete(target);
  };
  installations.set(target, dispose);
  return dispose;
}
