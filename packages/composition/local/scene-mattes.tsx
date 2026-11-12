import { ownerBlackBarRects } from "../../contracts/local/black-bars.ts";

/** Cover the original before individually clipped media and the text layers. */
export function OwnerSceneMattes({
  enabled,
}: {
  enabled?: boolean | undefined;
}) {
  if (!enabled) return null;
  return (
    <svg
      data-scene-mattes
      aria-hidden="true"
      width="1080"
      height="1920"
      viewBox="0 0 1080 1920"
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      {ownerBlackBarRects(enabled).map((rect) => (
        <rect key={rect.y} {...rect} fill="#000000" />
      ))}
    </svg>
  );
}
