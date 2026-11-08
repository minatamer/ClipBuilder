import {
  Captions,
  Images,
  Magnet,
  ScanFace,
  SlidersHorizontal,
  Type,
} from "lucide-react";
import { OWNER_HOOK_AUDIO_DEFAULT_VOLUME } from "./hook-edit.ts";

/** Navigation and its guide share one catalogue; labels never drift apart. */
export const EDITOR_SECTIONS = [
  {
    value: "captions",
    label: "Captions",
    icon: Captions,
    title: "Make every word readable",
    text: "Choose caption style, placement and animation here. Text and Speakers let you correct words and adjust speaker colours. Changes stay in your preview until you Apply.",
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
    text: "Select a picture to change its image, placement, timing and motion, or upload one of your own. Use the preview to position it and Capture to use the current playback time.",
  },
  {
    value: "focus",
    label: "Camera",
    icon: ScanFace,
    title: "Keep the right subject in frame",
    text: "Adjust camera positions, zoom and motion here. Preview each change against the video before applying it. Tracking starts only when you choose its action.",
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
    text: "Your clips live here. Choose a ready clip to open its editor; clips still preparing stay unavailable. Apply or discard a draft before switching clips.",
  },
  {
    target: "settings",
    title: "Everything has its place",
    text: "These tabs keep captions, text, filters, media, camera and Hook controls together. Only the current section is open, with its own controls below.",
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
    title: "Keep changes, then export",
    text: "Edits show Apply and Discard here. Once you Apply, Export creates the current clip and Download retrieves the finished video. Nothing is submitted by this tour. Replay it anytime using the question-mark button.",
  },
];
