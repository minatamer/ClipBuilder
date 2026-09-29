"use client";

import { useEffect } from "react";

type ErrorPageProperties = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProperties) {
  useEffect(() => {
    // The digest is framework-generated and content-free; never log the error.
    if (error.digest) {
      console.error(`ClipBuilder view failed (${error.digest})`);
    }
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
