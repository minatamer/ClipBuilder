import { Clock3 } from "lucide-react";
export function DemoLimitScreen({ retryAt }: { retryAt: number | null }) {
  return (
    <section className="demo-limit-screen" aria-labelledby="demo-limit-title">
      <div className="demo-limit-clock">
        <Clock3 size={46} aria-hidden="true" />
      </div>
      <p className="demo-limit-eyebrow">Thanks for trying ClipBuilder</p>
      <h2 id="demo-limit-title">You’ve hit the free demo limit.</h2>
      <p>
        One free demo per network every 24 hours keeps the preview available to
        everyone.
      </p>
      {retryAt && (
        <p className="demo-limit-return">
          Try again after{" "}
          <time dateTime={new Date(retryAt).toISOString()}>
            {new Date(retryAt).toLocaleString(undefined, {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </time>
          .
        </p>
      )}
      <p>Stay tuned for the full release.</p>
      <a href="/">
        Back to ClipBuilder <span aria-hidden="true">↗</span>
      </a>
    </section>
  );
}
