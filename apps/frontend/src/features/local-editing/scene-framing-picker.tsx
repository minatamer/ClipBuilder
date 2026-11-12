import { EditorChoiceGrid } from "./editor-choice-grid";
import { ownerBlackBarRects } from "../../../../../packages/contracts/local/black-bars.ts";
import styles from "./scene-framing.module.css";

export function SceneFramingPicker({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}) {
  return (
    <section
      className={`editor-control-section ${styles.section}`}
      aria-label="Canvas framing"
    >
      <h3>Canvas framing</h3>
      <EditorChoiceGrid
        label="Canvas framing"
        value={enabled ? "square" : "vertical"}
        onChange={(value) => onChange(value === "square")}
        items={[
          { value: "vertical", label: "Full vertical" },
          { value: "square", label: "Black bars · Square window" },
        ].map((item) => ({
          ...item,
          preview: (
            <svg width="45" height="80" viewBox="0 0 1080 1920">
              <rect width="1080" height="1920" rx="48" fill="#1c3c69" />
              <circle cx="540" cy="760" r="190" fill="#8aaddc" />
              <path d="M160 1440Q160 990 540 990T920 1440" fill="#587eb3" />
              {ownerBlackBarRects(item.value === "square").map((rect) => (
                <rect key={rect.y} {...rect} fill="#000000" />
              ))}
              <rect
                x="12"
                y="12"
                width="1056"
                height="1896"
                rx="42"
                fill="none"
                stroke="#8aaddc"
                strokeWidth="24"
              />
            </svg>
          ),
        }))}
      />
    </section>
  );
}
