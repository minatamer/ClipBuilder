import { OWNER_FPS } from "./policy.ts";
import { ownerFocusSchema, type OwnerFocus } from "./focus.ts";

/** Refine fresh automatic timing only; never guess a new person or camera box. */
export function alignAutomaticFocusCuts(
  focus: OwnerFocus,
  sourceCuts: readonly number[],
): OwnerFocus {
  if (
    !sourceCuts.length ||
    focus.shots.some((shot) => shot.reason === "manual")
  )
    return focus;
  const candidates = [
    ...new Set(
      sourceCuts.filter(
        (frame) => Number.isInteger(frame) && frame > 0 && frame < focus.frames,
      ),
    ),
  ];
  const boundaries = [
    ...new Set(
      focus.decisions
        .filter((decision) => decision.shotStart && decision.startFrame > 0)
        .map((decision) => decision.startFrame),
    ),
  ];
  const clocks = [
    0,
    focus.frames,
    ...focus.shots.flatMap((shot) => [shot.startFrame, shot.endFrame]),
    ...focus.decisions.flatMap((decision) => [
      decision.startFrame,
      decision.endFrame,
    ]),
    ...focus.people.flatMap((person) =>
      person.observations.flatMap((observation) => [
        observation.startFrame,
        observation.endFrame,
      ]),
    ),
  ];
  const proposals = boundaries.flatMap((before) => {
    if (
      !focus.shots.some(
        (shot) => shot.startFrame === before && shot.reason === "shot-reset",
      )
    )
      return [];
    const nearest = candidates
      .map((after) => ({ after, distance: Math.abs(after - before) }))
      .filter((item) => item.distance <= OWNER_FPS)
      .sort((a, b) => a.distance - b.distance);
    const first = nearest[0];
    if (
      !first ||
      first.after === before ||
      (nearest[1] && nearest[1].distance - first.distance <= 2)
    )
      return [];
    if (
      clocks.some(
        (clock) =>
          clock !== before &&
          clock >= Math.min(before, first.after) &&
          clock <= Math.max(before, first.after),
      )
    )
      return [];
    return [{ before, after: first.after }];
  });
  const mapping = new Map(
    proposals
      .filter(
        (item) =>
          proposals.filter((other) => other.after === item.after).length === 1,
      )
      .map((item) => [item.before, item.after]),
  );
  if (!mapping.size) return focus;
  const retime = <T extends { startFrame: number; endFrame: number }>(
    item: T,
  ): T => ({
    ...item,
    startFrame: mapping.get(item.startFrame) ?? item.startFrame,
    endFrame: mapping.get(item.endFrame) ?? item.endFrame,
  });
  const result = ownerFocusSchema.safeParse({
    ...focus,
    shots: focus.shots.map(retime),
    decisions: focus.decisions.map(retime),
    people: focus.people.map((person) => ({
      ...person,
      observations: person.observations.map(retime),
    })),
  });
  return result.success ? result.data : focus;
}
