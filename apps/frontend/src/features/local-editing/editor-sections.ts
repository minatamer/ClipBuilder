import {
  Captions,
  Images,
  Magnet,
  ScanFace,
  SlidersHorizontal,
  Type,
  House,
} from "lucide-react";
import { OWNER_HOOK_AUDIO_DEFAULT_VOLUME } from "./hook-edit.ts";

/** Navigation and its guide share one catalogue; labels never drift apart. */
export const EDITOR_SECTIONS = [
  {
    value: "home",
    label: "Home",
    icon: House,
    title: "See the whole clip",
    text: "Review layers, camera positions and audio together. Select an item to open its controls. Valid changes save automatically; Undo and Redo are in the top bar.",
  },
  {
    value: "captions",
    label: "Captions",
    icon: Captions,
    title: "Make every word readable",
    text: "Choose caption style, placement and animation here. Text and Speakers let you correct words and adjust speaker colours. Valid changes save automatically.",
  },
  {
    value: "text",
    label: "Text",
    icon: Type,
    title: "Give your clip a headline",
    text: "Add and style text layers, then choose when they appear. Select a layer in the preview or its list to adjust it. Drag and resize it directly in the preview.",
  },
  {
    value: "filters",
    label: "Filters",
    icon: SlidersHorizontal,
    title: "Set the look",
    text: "Choose a colour treatment and its strength. Keep one look across the clip or give a timed section its own treatment. The preview shows your draft as you work.",
  },
  {
    value: "pictures",
    label: "Media",
    icon: Images,
    title: "Shape the visual story",
    text: "Upload pictures or videos, then select a visual to adjust its timing, fit, position, layer order and volume. Camera owns zoom, pan and tracking. Capture uses the settled preview time.",
  },
  {
    value: "focus",
    label: "Camera",
    icon: ScanFace,
    title: "Keep the right subject in frame",
    text: "Choose the original video or an added visual, then adjust camera positions, zoom, pan or face tracking. The selected frame and the main preview show the same crop. Tracking starts only when you choose its action.",
  },
  {
    value: "hook",
    label: "Hook",
    icon: Magnet,
    title: "Open with a strong moment",
    text: "Repeat a short moment before the full clip. Pick a range or use a suggestion. Generate title and Add Hook audio are separate choices, both off until you select them.",
  },
] as const;

export type EditorSetting = (typeof EDITOR_SECTIONS)[number]["value"];
export type EditorTourStep = {
  target: string;
  title: string;
  text: string;
  section?: EditorSetting;
  media?: "pictures" | "audio";
  optional?: boolean;
};

export const EDITOR_TOUR_WELCOME: EditorTourStep = {
  target: "welcome",
  title: "Welcome to the editor",
  text: "Take a quick tour of the preview, editing tools and export controls. You can replay the tour anytime with the question-mark button.",
};

export const EDITOR_TOUR_STEPS: readonly EditorTourStep[] = [
  {
    target: "preview",
    title: "Your clip is ready",
    text: "This is your working preview. Play it to review the clip, then select captions, text or pictures to move and resize them. Let’s find the controls you’ll use most.",
  },
  {
    target: "clips",
    optional: true,
    title: "One editor for each clip",
    text: "Choose a ready clip here or use Add to choose more moments. Clips still preparing stay unavailable. Wait for the Saved indicator before switching clips.",
  },
  {
    target: "settings",
    title: "Everything has its place",
    text: "Home shows the full layer timeline. The other tabs open one set of controls at a time, with the selected item’s properties alongside its collection.",
  },
  ...EDITOR_SECTIONS.flatMap((section): EditorTourStep[] => [
    {
      target: section.value,
      section: section.value,
      title: section.title,
      text: section.text,
      ...(section.value === "pictures" ? { media: "pictures" as const } : {}),
    },
    ...(section.value === "pictures"
      ? [
          {
            target: "audio",
            section: "pictures" as const,
            media: "audio" as const,
            title: "Balance speech and sound",
            text: `Audio keeps the original sound and added tracks separate. Audition a recording, adjust its volume and timing, or add your own. Hook recordings stay with the Hook; new ones start at ${OWNER_HOOK_AUDIO_DEFAULT_VOLUME}%.`,
          },
        ]
      : []),
  ]),
  {
    target: "actions",
    title: "Your workspace toolbar",
    text: "Valid edits save automatically. Undo and Redo step through changes without processing again. Export creates the current clip; Download retrieves the finished video. File contains session actions and privacy details. Help replays this tour. Nothing is submitted by this tour.",
  },
];
