"use client";

import { useEffect } from "react";
import { reportBrowserViewFailure } from "../features/diagnostics/browser.diagnostics";
import { Button } from "../shared/ui/button";
import styles from "./view-failure.module.css";

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
    <main className={styles.recovery}>
      <h1>ClipBuilder could not load this view</h1>
      <p>Your media was not changed. Try the view again.</p>
      <Button onClick={reset}>Try again</Button>
    </main>
  );
}
