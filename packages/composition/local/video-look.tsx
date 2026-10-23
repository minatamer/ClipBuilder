import { useId, type ReactNode } from "react";
import {
  ownerVideoLookMatrix,
  type OwnerVideoLook,
} from "../../contracts/local/video-look.ts";

export function OwnerVideoLookLayer({
  look,
  children,
}: {
  look?: OwnerVideoLook | undefined;
  children?: ReactNode;
}) {
  const id = `owner-look-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const matrix = ownerVideoLookMatrix(look);
  if (!look || look.preset === "original" || look.strength === 0)
    return <>{children}</>;
  const values = [
    ...matrix.slice(0, 3),
    0,
    0,
    ...matrix.slice(3, 6),
    0,
    0,
    ...matrix.slice(6, 9),
    0,
    0,
    0,
    0,
    0,
    1,
    0,
  ].join(" ");
  return (
    <>
      <svg
        width="0"
        height="0"
        aria-hidden="true"
        style={{ position: "absolute" }}
      >
        <defs>
          <filter
            id={id}
            x="0"
            y="0"
            width="100%"
            height="100%"
            colorInterpolationFilters="sRGB"
          >
            <feColorMatrix type="matrix" values={values} />
          </filter>
        </defs>
      </svg>
      <div style={{ position: "absolute", inset: 0, filter: `url(#${id})` }}>
        {children}
      </div>
    </>
  );
}
