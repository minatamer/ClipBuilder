"use client";
import { useEffect } from "react";
import { reportBrowserViewFailure } from "../features/diagnostics/browser.diagnostics";
import { Button } from "../shared/ui/button";
import styles from "./view-failure.module.css";

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
        <main className={styles.recovery}>
          <h1>ClipBuilder could not load this view</h1>
          <p>Please reload the page and try again.</p>
          <Button onClick={() => window.location.reload()}>Reload page</Button>
        </main>
      </body>
    </html>
  );
}
