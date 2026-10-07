"use client";

import { useEffect } from "react";
import { reportBrowserViewFailure } from "../features/diagnostics/browser.diagnostics";

type ErrorPageProperties = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProperties) {
  useEffect(() => {
    // Preserve framework correlation privately; never transmit exception text.
    void reportBrowserViewFailure(error.digest);
  }, [error.digest]);

  return (
    <main>
      <h1>ClipBuilder could not load this view</h1>
      <p>Your media was not changed. Try the view again.</p>
      <button type="button" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
