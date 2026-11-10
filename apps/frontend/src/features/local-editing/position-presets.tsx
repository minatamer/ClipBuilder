import { Check } from "lucide-react";
import { Button } from "../../shared/ui/button";
import {
  centeredOwnerBox,
  type OwnerEditorBox,
  type OwnerTextGeometry,
} from "./editor-state.ts";
import styles from "./position-presets.module.css";

/** The miniature and click share the same fitted box, including safe margins. */
export function PositionPresets({
  label,
  box,
  geometry = null,
  defaultCenter,
  kind = "text",
  onChange,
}: {
  label: string;
  box: OwnerEditorBox;
  geometry?: OwnerTextGeometry | null;
  defaultCenter?: number | undefined;
  kind?: "text" | "picture" | "video";
  onChange: (box: OwnerEditorBox) => void;
}) {
  const positions = [
    ...(defaultCenter === undefined
      ? []
      : [{ center: defaultCenter, label: "Default positioning" }]),
    { center: 0.25, label: "Upper half" },
    { center: 0.5, label: "Center" },
    { center: 0.75, label: "Lower half" },
  ];
  return (
    <div
      className={styles.presets}
      role="group"
      aria-label={`${label} position`}
    >
      {positions.map((position) => {
        const next = centeredOwnerBox(box, position.center, geometry);
        const selected =
          Math.abs(box.y + box.height / 2 - position.center) < 0.00001 &&
          Math.abs(box.x + box.width / 2 - 0.5) < 0.00001 &&
          (!geometry || geometry.verticalAlign === "center");
        return (
          <Button
            key={position.label}
            className={styles.card}
            variant="secondary"
            aria-label={position.label}
            aria-pressed={selected}
            onClick={() => onChange(next)}
          >
            <span className={styles.selection} aria-hidden="true">
              <Check size={13} />
            </span>
            <PositionCanvas box={next} kind={kind} />
            <span className={styles.label}>{position.label}</span>
          </Button>
        );
      })}
    </div>
  );
}

function PositionCanvas({
  box,
  kind,
}: {
  box: OwnerEditorBox;
  kind: "text" | "picture" | "video";
}) {
  const valid = Object.values(box).every(Number.isFinite);
  const x = box.x * 108,
    y = box.y * 192,
    width = box.width * 108,
    height = box.height * 192;
  return (
    <svg
      className={styles.canvas}
      viewBox="0 0 108 192"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <rect
        className={styles.frame}
        x="1"
        y="1"
        width="106"
        height="190"
        rx="8"
      />
      <path className={styles.guides} d="M54 8v176M8 48h92M8 96h92M8 144h92" />
      {valid && (
        <g>
          <rect
            className={styles.footprint}
            x={x}
            y={y}
            width={width}
            height={height}
            rx={Math.min(3, width / 4, height / 4)}
          />
          {kind === "text" ? (
            <path
              className={styles.content}
              d={`M${x + width * 0.2} ${y + height * 0.4}h${width * 0.6}M${x + width * 0.3} ${y + height * 0.65}h${width * 0.4}`}
            />
          ) : kind === "video" ? (
            <path
              className={styles.media}
              d={`M${x + width * 0.42} ${y + height * 0.3}l${width * 0.24} ${height * 0.2}-${width * 0.24} ${height * 0.2}z`}
            />
          ) : (
            <path
              className={styles.content}
              d={`M${x + width * 0.2} ${y + height * 0.7}l${width * 0.2}-${height * 0.28} ${width * 0.17} ${height * 0.18} ${width * 0.12}-${height * 0.12} ${width * 0.11} ${height * 0.22}`}
            />
          )}
        </g>
      )}
    </svg>
  );
}
