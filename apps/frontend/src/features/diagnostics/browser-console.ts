import {
  BROWSER_CONSOLE_LEVELS,
  browserConsoleDiagnosticSchema,
  browserErrorDigestSchema,
  type BrowserDiagnostic,
} from "@clipbuilder/contracts";

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
      report(
        browserConsoleDiagnosticSchema.parse({
          kind: "browser-console",
          level,
          source,
          argumentCount: Math.min(1000, values.length),
          ...(errorClass ? { errorClass } : {}),
          ...(digest.success ? { digest: digest.data } : {}),
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
