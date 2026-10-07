"use client";
import { useEffect } from "react";
import { reportBrowserViewFailure } from "../features/diagnostics/browser.diagnostics";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    void reportBrowserViewFailure(error.digest);
  }, [error.digest]);
  return (
    <html lang="en">
      <body>
        <main>
          <h1>ClipBuilder could not load this view</h1>
          <p>Please reload the page and try again.</p>
          <button type="button" onClick={() => window.location.reload()}>
            Reload page
          </button>
        </main>
      </body>
    </html>
  );
}
