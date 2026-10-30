import { z } from "zod";
import { normalizedBoxSchema } from "@clipbuilder/contracts";
import { OWNER_FPS, OWNER_LIMITS } from "./policy.ts";

export const OWNER_FOCUS_LIMITS = {
  people: 8,
  observations: 120,
  shots: 60,
} as const;
const frame = z
  .number()
  .int()
  .nonnegative()
  .max((OWNER_LIMITS.clipMs * OWNER_FPS) / 1000);
const point = z.number().finite().min(0).max(1);
export const ownerPersonIdSchema = z.string().regex(/^person_[1-8]$/);
export const ownerFocusObservationSchema = z
  .object({
    startFrame: frame,
    endFrame: frame,
    box: normalizedBoxSchema,
  })
  .strict()
  .refine((o) => o.endFrame > o.startFrame);
export const ownerFocusPersonSchema = z
  .object({
    id: ownerPersonIdSchema,
    observations: z
      .array(ownerFocusObservationSchema)
      .min(1)
      .max(OWNER_FOCUS_LIMITS.observations),
  })
  .strict();
export const ownerFocusDecisionSchema = z
  .object({
    startFrame: frame,
    endFrame: frame,
    personId: ownerPersonIdSchema.nullable(),
    speakerId: z
      .string()
      .regex(/^spk_\d{1,3}$/)
      .nullable(),
    confidence: point,
    evidenceWordIds: z.array(z.string().min(1).max(64)).max(8),
    shotStart: z.boolean(),
  })
  .strict()
  .refine((o) => o.endFrame > o.startFrame);
export const ownerFocusShotSchema = z
  .object({
    startFrame: frame,
    endFrame: frame,
    personId: ownerPersonIdSchema.nullable(),
    centerX: point,
    centerY: point,
    zoom: z.number().finite().min(1).max(3),
    reason: z.enum(["speaker", "held", "opening", "shot-reset", "manual"]),
  })
  .strict();
export const ownerFocusSchema = z
  .object({
    version: z.literal(1),
    source: z
      .object({
        width: z.number().int().min(1).max(3840),
        height: z.number().int().min(1).max(3840),
      })
      .strict(),
    frames: frame.refine((n) => n > 0),
    people: z.array(ownerFocusPersonSchema).max(OWNER_FOCUS_LIMITS.people),
    decisions: z
      .array(ownerFocusDecisionSchema)
      .max(OWNER_FOCUS_LIMITS.observations),
    shots: z.array(ownerFocusShotSchema).min(1).max(OWNER_FOCUS_LIMITS.shots),
  })
  .strict()
  .superRefine((focus, ctx) => {
    const ids = new Set(focus.people.map((p) => p.id));
    let cursor = 0;
    if (
      ids.size !== focus.people.length ||
      focus.people.reduce((n, p) => n + p.observations.length, 0) >
        OWNER_FOCUS_LIMITS.observations ||
      focus.people.some((p) =>
        p.observations.some((o) => o.endFrame > focus.frames),
      ) ||
      focus.decisions.some((d) => d.endFrame > focus.frames)
    )
      ctx.addIssue({ code: "custom", message: "Invalid person observations." });
    for (const shot of focus.shots) {
      if (
        shot.startFrame !== cursor ||
        shot.endFrame <= cursor ||
        shot.endFrame > focus.frames ||
        (shot.personId !== null && !ids.has(shot.personId))
      )
        ctx.addIssue({
          code: "custom",
          message: "Camera shots must cover the clip without gaps or overlap.",
        });
      cursor = shot.endFrame;
    }
    if (cursor !== focus.frames)
      ctx.addIssue({
        code: "custom",
        message: "Camera coverage is incomplete.",
      });
  });
export type OwnerFocus = z.infer<typeof ownerFocusSchema>;
export type OwnerFocusShot = z.infer<typeof ownerFocusShotSchema>;
export type OwnerFocusPerson = z.infer<typeof ownerFocusPersonSchema>;

/** Exact even-pixel content rectangle produced by the existing contain/pad cut. */
export function ownerSourceContent(source: OwnerFocus["source"]) {
  const scale = Math.min(1080 / source.width, 1920 / source.height);
  const width = Math.max(2, Math.floor((source.width * scale) / 2) * 2);
  const height = Math.max(2, Math.floor((source.height * scale) / 2) * 2);
  // FFmpeg centers chroma-subsampled padding on an even offset.
  return {
    width,
    height,
    x: Math.floor((1080 - width) / 4) * 2,
    y: Math.floor((1920 - height) / 4) * 2,
  };
}
/** One integer 9:16 viewport shared by CSS preview and native crop/scale. */
export function ownerFocusCrop(
  focus: Pick<OwnerFocus, "source">,
  shot: OwnerFocusShot,
) {
  const content = ownerSourceContent(focus.source);
  const unit = Math.max(
    1,
    Math.floor(Math.min(content.width / 18, content.height / 32) / shot.zoom),
  );
  const width = Math.min(content.width, 18 * unit),
    height = Math.min(content.height, 32 * unit);
  const x = Math.max(
    content.x,
    Math.min(
      content.x + content.width - width,
      Math.round((content.x + shot.centerX * content.width - width / 2) / 2) *
        2,
    ),
  );
  const y = Math.max(
    content.y,
    Math.min(
      content.y + content.height - height,
      Math.round((content.y + shot.centerY * content.height - height / 2) / 2) *
        2,
    ),
  );
  return { x, y, width, height };
}
export function ownerFocusAt(focus: OwnerFocus, at: number) {
  return (
    focus.shots.find((s) => at >= s.startFrame && at < s.endFrame) ??
    focus.shots[focus.shots.length - 1]!
  );
}
export function ownerPersonCamera(person: OwnerFocusPerson, at: number) {
  const box = (
    person.observations.find((o) => o.startFrame <= at && o.endFrame > at) ??
    person.observations[0]!
  ).box;
  return {
    personId: person.id,
    centerX: box.x + box.width / 2,
    centerY: Math.min(1, box.y + box.height * 0.8),
    zoom: 1,
  };
}
export function defaultOwnerFocus(
  source: OwnerFocus["source"],
  frames: number,
): OwnerFocus {
  return ownerFocusSchema.parse({
    version: 1,
    source: { width: source.width, height: source.height },
    frames,
    people: [],
    decisions: [],
    shots: [
      {
        startFrame: 0,
        endFrame: frames,
        personId: null,
        centerX: source.width > source.height ? 0.25 : 0.5,
        centerY: 0.5,
        zoom: 1,
        reason: "opening",
      },
    ],
  });
}

/** Tolerant physical decoding: quality never requires another provider request. */
export function compileAutomaticOwnerFocus(
  raw: unknown,
  source: OwnerFocus["source"],
  frames: number,
  words: readonly {
    id: string;
    startMs: number;
    endMs: number;
    speakerId: string | null;
  }[] = [],
) {
  const envelope = z
    .object({
      people: z.array(z.unknown()).catch([]),
      decisions: z.array(z.unknown()).catch([]),
    })
    .safeParse(raw);
  const focus = defaultOwnerFocus(source, frames);
  let converted = 0,
    rejected = 0;
  function clocks(value: unknown) {
    const item = z
      .object({
        startFrame: z.number().finite(),
        endFrame: z.number().finite(),
      })
      .safeParse(value);
    if (!item.success) return null;
    const startFrame = Math.max(
      0,
      Math.min(frames, Math.round(item.data.startFrame)),
    );
    const endFrame = Math.max(
      0,
      Math.min(frames, Math.round(item.data.endFrame)),
    );
    if (startFrame !== item.data.startFrame || endFrame !== item.data.endFrame)
      converted++;
    return endFrame > startFrame ? { startFrame, endFrame } : null;
  }
  let observations = 0;
  for (const rawPerson of (envelope.success ? envelope.data.people : []).slice(
    0,
    OWNER_FOCUS_LIMITS.people,
  )) {
    const person = z
      .object({ id: ownerPersonIdSchema, observations: z.array(z.unknown()) })
      .safeParse(rawPerson);
    if (!person.success || focus.people.some((p) => p.id === person.data.id)) {
      rejected++;
      continue;
    }
    const accepted: OwnerFocusPerson["observations"] = [];
    for (const value of person.data.observations.slice(
      0,
      OWNER_FOCUS_LIMITS.observations - observations,
    )) {
      const clock = clocks(value),
        box = z.object({ box: normalizedBoxSchema }).safeParse(value);
      if (!clock || !box.success) {
        rejected++;
        continue;
      }
      accepted.push({ ...clock, box: box.data.box });
      observations++;
    }
    accepted.sort((a, b) => a.startFrame - b.startFrame);
    if (accepted.length)
      focus.people.push({ id: person.data.id, observations: accepted });
  }
  for (const value of (envelope.success ? envelope.data.decisions : []).slice(
    0,
    OWNER_FOCUS_LIMITS.observations,
  )) {
    const clock = clocks(value);
    const decision = ownerFocusDecisionSchema.safeParse(
      value && typeof value === "object" ? { ...value, ...clock } : value,
    );
    if (!clock || !decision.success) {
      rejected++;
      continue;
    }
    focus.decisions.push(decision.data);
  }
  focus.decisions.sort((a, b) => a.startFrame - b.startFrame);
  const shotStarts = [
    ...new Set([
      0,
      ...focus.decisions.filter((d) => d.shotStart).map((d) => d.startFrame),
    ]),
  ].sort((a, b) => a - b);
  const byWord = new Map(words.map((w) => [w.id, w]));
  function supportedDecision(
    decision: OwnerFocus["decisions"][number],
    openingStart?: number,
  ) {
    // Visual evidence can establish the opening crop without inventing an
    // audio label. It cannot authorize a later speaker switch.
    const visualOpening =
      decision.speakerId === null && decision.startFrame === openingStart;
    const target = focus.people.find(
      (p) =>
        p.id === decision.personId &&
        p.observations.some(
          (o) =>
            o.startFrame <= decision.startFrame &&
            o.endFrame > decision.startFrame,
        ),
    );
    const evidence = decision.evidenceWordIds
      .flatMap((id) => {
        const w = byWord.get(id);
        if (!w || w.speakerId !== decision.speakerId) return [];
        const start = Math.max(
            w.startMs,
            (decision.startFrame * 1000) / OWNER_FPS,
          ),
          end = Math.min(w.endMs, (decision.endFrame * 1000) / OWNER_FPS);
        return end > start ? [{ start, end }] : [];
      })
      .sort((a, b) => a.start - b.start);
    let voiced = 0,
      cursor = -1,
      confirmedMs: number | null = null;
    for (const span of evidence) {
      if (cursor >= 0 && span.start - cursor > 2000) voiced = 0;
      const begin = Math.max(cursor, span.start),
        added = Math.max(0, span.end - begin);
      if (confirmedMs === null && voiced + added >= 1000)
        confirmedMs = begin + 1000 - voiced;
      voiced += added;
      cursor = Math.max(cursor, span.end);
      if (confirmedMs !== null) break;
    }
    const confirmedFrame =
      confirmedMs === null ? null : Math.ceil((confirmedMs * OWNER_FPS) / 1000);
    const overlap =
      confirmedMs !== null &&
      words.some(
        (w) =>
          w.speakerId !== decision.speakerId &&
          w.endMs > w.startMs &&
          w.startMs < confirmedMs &&
          w.endMs >
            Math.max(
              (decision.startFrame * 1000) / OWNER_FPS,
              confirmedMs - 1000,
            ),
      );
    return target &&
      decision.confidence >= (visualOpening ? 0.95 : 0.85) &&
      (decision.speakerId || visualOpening) &&
      confirmedMs !== null &&
      confirmedFrame !== null &&
      !overlap &&
      (!visualOpening ||
        target.observations.some(
          (o) =>
            o.startFrame <= decision.startFrame && o.endFrame > confirmedFrame,
        )) &&
      target.observations.some(
        (o) => o.startFrame <= confirmedFrame && o.endFrame > confirmedFrame,
      )
      ? {
          person: target,
          confirmedFrame,
          firstFrame: Math.floor((evidence[0]!.start * OWNER_FPS) / 1000),
        }
      : null;
  }
  const shots: OwnerFocusShot[] = [];
  let switches = 0,
    held = 0,
    fallback = 0;
  for (const [index, start] of shotStarts.entries()) {
    const end = shotStarts[index + 1] ?? frames;
    if (end <= start) continue;
    const openingTargets = focus.decisions
      .filter((d) => d.startFrame === start)
      .flatMap((d) => {
        const supported = supportedDecision(d, start);
        return supported && supported.firstFrame - start <= OWNER_FPS / 2
          ? [supported.person]
          : [];
      });
    const openingPerson =
      new Set(openingTargets.map((p) => p.id)).size === 1
        ? openingTargets[0]
        : null;
    const person =
      openingPerson ??
      focus.people.find((p) =>
        p.observations.some((o) => o.startFrame <= start && o.endFrame > start),
      );
    let current: OwnerFocusShot = {
      ...focus.shots[0]!,
      startFrame: start,
      endFrame: end,
      ...(person ? ownerPersonCamera(person, start) : {}),
      reason: start ? "shot-reset" : "opening",
    };
    if (!person) {
      fallback++;
      const firstVisible = focus.people
        .flatMap((p) =>
          p.observations
            .filter((o) => o.startFrame > start && o.startFrame < end)
            .map((o) => ({ person: p, frame: o.startFrame })),
        )
        .sort((a, b) => a.frame - b.frame)[0];
      if (firstVisible && shots.length < OWNER_FOCUS_LIMITS.shots - 1) {
        shots.push({ ...current, endFrame: firstVisible.frame });
        current = {
          ...current,
          ...ownerPersonCamera(firstVisible.person, firstVisible.frame),
          startFrame: firstVisible.frame,
        };
      }
    }
    const decisions = focus.decisions
      .filter((d) => d.startFrame >= start && d.startFrame < end)
      .map((decision) => ({ decision, target: supportedDecision(decision) }))
      .sort(
        (a, b) =>
          (a.target?.confirmedFrame ?? a.decision.startFrame) -
          (b.target?.confirmedFrame ?? b.decision.startFrame),
      );
    for (const { target } of decisions) {
      if (!target) {
        held++;
        continue;
      }
      const switchAt = Math.max(current.startFrame, target.confirmedFrame);
      if (switchAt >= end || current.personId === target.person.id) continue;
      if (shots.length >= OWNER_FOCUS_LIMITS.shots - 1) {
        held++;
        continue;
      }
      if (switchAt > current.startFrame)
        shots.push({ ...current, endFrame: switchAt });
      current = {
        ...current,
        ...ownerPersonCamera(target.person, switchAt),
        startFrame: switchAt,
        reason: "speaker",
      };
      switches++;
    }
    if (
      shots.length >= OWNER_FOCUS_LIMITS.shots - 1 &&
      index < shotStarts.length - 1
    ) {
      shots.push({ ...current, endFrame: frames });
      break;
    }
    shots.push(current);
  }
  focus.shots = shots;
  return {
    focus: ownerFocusSchema.parse(focus),
    summary: {
      returnedPeople: envelope.success
        ? Math.min(1_000_000, envelope.data.people.length)
        : 0,
      returnedDecisions: envelope.success
        ? Math.min(1_000_000, envelope.data.decisions.length)
        : 0,
      people: focus.people.length,
      observations,
      decisions: focus.decisions.length,
      shots: shots.length,
      switches,
      held,
      fallback,
      rejected,
      converted,
    },
  };
}

export function splitOwnerFocus(focus: OwnerFocus, at: number): OwnerFocus {
  if (focus.shots.length >= OWNER_FOCUS_LIMITS.shots || !Number.isInteger(at))
    return focus;
  const shot = ownerFocusAt(focus, at);
  if (at <= shot.startFrame || at >= shot.endFrame) return focus;
  return {
    ...focus,
    shots: focus.shots.flatMap((s) =>
      s === shot
        ? [
            { ...s, endFrame: at },
            { ...s, startFrame: at, reason: "manual" as const },
          ]
        : [s],
    ),
  };
}
export function removeOwnerFocusShot(
  focus: OwnerFocus,
  index: number,
): OwnerFocus {
  if (focus.shots.length < 2 || !focus.shots[index]) return focus;
  const shots = focus.shots.map((s) => ({ ...s }));
  if (index > 0) shots[index - 1]!.endFrame = shots[index]!.endFrame;
  else shots[1]!.startFrame = 0;
  shots.splice(index, 1);
  return { ...focus, shots };
}
export function ownerFocusCounts(focus: OwnerFocus) {
  return {
    people: focus.people.length,
    observations: focus.people.reduce((n, p) => n + p.observations.length, 0),
    decisions: focus.decisions.length,
    shots: focus.shots.length,
  };
}
