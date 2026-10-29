import sharp from "sharp";
import {
  ownerIllustrationSchema,
  type OwnerIllustration,
} from "../../../packages/contracts/local/illustration.ts";

const escape = (text: string) =>
  text.replace(
    /[&<>"']/gu,
    (value) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;",
      })[value]!,
  );
const icons: Record<OwnerIllustration["items"][number]["icon"], string> = {
  person:
    '<circle cx="60" cy="31" r="18"/><path d="M25 101v-9a35 35 0 0 1 70 0v9"/>',
  globe:
    '<circle cx="60" cy="60" r="43"/><ellipse cx="60" cy="60" rx="19" ry="43"/><path d="M18 60h84M26 35h68M26 85h68"/>',
  idea: '<path d="M40 81c0-14-15-20-15-40a35 35 0 0 1 70 0c0 20-15 26-15 40ZM42 94h36M48 106h24"/><path d="m51 43 12-12-2 23 13-7-12 24"/>',
  computer:
    '<rect x="14" y="15" width="92" height="66" rx="8"/><path d="M60 81v24M37 105h46M26 65h68"/>',
  chart:
    '<path d="M17 12v94h90M34 89V63h17v26M64 89V43h17v46M94 89V23h13v66"/>',
  clock:
    '<circle cx="60" cy="60" r="44"/><path d="M60 28v33l24 13M60 13v5M13 60h5M102 60h5M60 102v5"/>',
  box: '<path d="m60 12 44 25v49l-44 25-44-25V37ZM16 37l44 25 44-25M60 62v49M38 24l44 25"/>',
  check: '<circle cx="60" cy="60" r="44"/><path d="m34 61 18 18 35-38"/>',
  leaf: '<path d="M26 90C2 28 64 18 102 14c0 43-12 97-76 76ZM21 108l58-63"/>',
};
function labelLines(text: string, maximum = 20) {
  const parts = text
    .replace(/[\p{Cc}]/gu, " ")
    .split(/\s+/u)
    .filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const part of parts) {
    if ((line + " " + part).trim().length > maximum && line) {
      lines.push(line);
      line = part;
    } else line = (line + " " + part).trim();
  }
  if (line) lines.push(line);
  return lines
    .slice(0, 4)
    .map((value) =>
      value.length > maximum + 2 ? value.slice(0, maximum + 1) + "…" : value,
    );
}
/** All geometry/markup is trusted code; only escaped bounded labels enter it. */
export async function renderCodexIllustration(value: unknown): Promise<Buffer> {
  const plan = ownerIllustrationSchema.parse(value),
    count = plan.items.length,
    step = 820 / count;
  const nodes = plan.items
    .map((item, index) => {
      const x = 50 + step * (index + 0.5),
        color = ["#2563eb", "#7c3aed", "#0891b2", "#059669"][index]!;
      const fontSize = count > 2 ? 32 : 38;
      const labels = labelLines(item.label, count > 2 ? 10 : 18)
        .map(
          (line, lineIndex) =>
            `<text x="0" y="${118 + lineIndex * (fontSize + 4)}" text-anchor="middle" font-size="${fontSize}" font-family="Arial,sans-serif" font-weight="600" fill="#0f172a">${escape(line)}</text>`,
        )
        .join("");
      return `<g transform="translate(${x} 225)"><circle cx="0" cy="0" r="72" fill="${color}" fill-opacity="0.1"/><g transform="translate(-54 -54) scale(.9)" fill="none" stroke="${color}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">${icons[item.icon]}</g>${labels}</g>`;
    })
    .join("");
  const connections =
    plan.layout === "process"
      ? plan.items
          .slice(1)
          .map((_, index) => {
            const x1 = 50 + step * (index + 0.5) + 80,
              x2 = 50 + step * (index + 1.5) - 80;
            return `<path d="M${x1} 225H${x2}m-10-7 10 7-10 7" stroke="#94a3b8" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
          })
          .join("")
      : plan.layout === "comparison" && count > 1
        ? '<path d="M460 150v270" stroke="#cbd5e1" stroke-width="3" stroke-dasharray="8 8"/>'
        : "";
  const headingFont = plan.heading.length > 36 ? 34 : 44,
    headingLines = labelLines(plan.heading, headingFont === 34 ? 42 : 32).slice(
      0,
      2,
    );
  const heading = headingLines
    .map(
      (line, index) =>
        `<text x="460" y="${headingLines.length === 1 ? 96 : 76 + index * 48}" text-anchor="middle" font-family="Arial,sans-serif" font-size="${headingFont}" font-weight="700" fill="#0f172a">${escape(line)}</text>`,
    )
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="920" height="520" viewBox="0 0 920 520"><defs><linearGradient id="paper" x2="1" y2="1"><stop stop-color="#fff"/><stop offset="1" stop-color="#eff6ff"/></linearGradient></defs><rect x="4" y="4" width="912" height="512" rx="36" fill="url(#paper)" stroke="#bfdbfe" stroke-width="4"/><rect x="410" y="34" width="100" height="7" rx="4" fill="#2563eb"/>${heading}${connections}${nodes}</svg>`;
  return sharp(Buffer.from(svg), { limitInputPixels: 920 * 520 })
    .png()
    .toBuffer();
}
