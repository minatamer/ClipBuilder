import type { OwnerFocus, OwnerFocusPerson } from "./focus.ts";

type Decision = OwnerFocus["decisions"][number];
type Observation = OwnerFocusPerson["observations"][number];
type Group = { members: OwnerFocusPerson[]; speakers: Set<string> };

const firstFrame = (person: OwnerFocusPerson) =>
  person.observations[0]!.startFrame;
const order = (a: OwnerFocusPerson, b: OwnerFocusPerson) =>
  firstFrame(a) - firstFrame(b) || a.id.localeCompare(b.id);

function overlap(a: Observation, b: Observation) {
  return (
    Math.max(a.startFrame, b.startFrame) < Math.min(a.endFrame, b.endFrame)
  );
}
function geometry(a: Observation, b: Observation) {
  const x = a.box,
    y = b.box;
  const intersection =
    Math.max(0, Math.min(x.x + x.width, y.x + y.width) - Math.max(x.x, y.x)) *
    Math.max(0, Math.min(x.y + x.height, y.y + y.height) - Math.max(x.y, y.y));
  const union = x.width * x.height + y.width * y.height - intersection;
  return {
    iou: union > 0 ? intersection / union : 0,
    dx:
      Math.abs(x.x + x.width / 2 - y.x - y.width / 2) /
      Math.max(x.width, y.width),
    dy:
      Math.abs(x.y + x.height / 2 - y.y - y.height / 2) /
      Math.max(x.height, y.height),
    scale: Math.max(
      x.width / y.width,
      y.width / x.width,
      x.height / y.height,
      y.height / x.height,
    ),
  };
}
/** Distinct co-visible heads are a veto, including transitive alias chains. */
function separated(a: Group, b: Group) {
  return a.members.some((left) =>
    b.members.some((right) =>
      left.observations.some((x) =>
        right.observations.some((y) => {
          const g = geometry(x, y);
          return (
            overlap(x, y) &&
            (g.iou < 0.4 || g.dx > 0.6 || g.dy > 0.6 || g.scale > 2)
          );
        }),
      ),
    ),
  );
}

/** Fresh automatic plans only; manual/saved focus never passes through here. */
export function reconcileAutomaticFocusPeople(
  people: readonly OwnerFocusPerson[],
  decisions: readonly Decision[],
  supported: ReadonlySet<Decision>,
  shotStarts: readonly number[],
) {
  const groups: Group[] = [...people].sort(order).map((person) => ({
    members: [person],
    speakers: new Set(
      decisions
        .filter(
          (decision) =>
            supported.has(decision) && decision.personId === person.id,
        )
        .flatMap((decision) =>
          decision.speakerId ? [decision.speakerId] : [],
        ),
    ),
  }));
  const groupOf = (id: string) =>
    groups.find((group) => group.members.some((person) => person.id === id));
  function merge(a: Group, b: Group) {
    a.members.push(...b.members);
    a.members.sort(order);
    for (const speaker of b.speakers) a.speakers.add(speaker);
    groups.splice(groups.indexOf(b), 1);
  }
  // A speech label can bind disjoint views across real cuts. Position alone cannot.
  for (let index = 0; index < groups.length; index++) {
    const a = groups[index]!;
    for (let other = index + 1; other < groups.length;) {
      const b = groups[other]!;
      if ([...a.speakers].some((id) => b.speakers.has(id)) && !separated(a, b))
        merge(a, b);
      else other++;
    }
  }
  // Strong coincident heads or a <=0.2-second continuation in the same shot.
  for (let index = 0; index < groups.length; index++) {
    const a = groups[index]!;
    for (let other = index + 1; other < groups.length;) {
      const b = groups[other]!;
      const conflictingVoices =
        a.speakers.size > 0 &&
        b.speakers.size > 0 &&
        ![...a.speakers].some((id) => b.speakers.has(id));
      const continuous = a.members.some((left) =>
        b.members.some((right) =>
          left.observations.some((x) =>
            right.observations.some((y) => {
              const earlier = x.startFrame <= y.startFrame ? x : y;
              const later = earlier === x ? y : x;
              if (
                later.startFrame - earlier.endFrame > 6 ||
                shotStarts.some(
                  (at) => earlier.startFrame < at && at <= later.startFrame,
                )
              )
                return false;
              const g = geometry(x, y);
              return (
                g.iou >= 0.65 && g.dx <= 0.3 && g.dy <= 0.3 && g.scale <= 1.5
              );
            }),
          ),
        ),
      );
      if (!conflictingVoices && continuous && !separated(a, b)) merge(a, b);
      else other++;
    }
  }
  const canonical = (group: Group) => group.members[0]!;
  const speakerPeople = new Map<string, string>();
  for (const group of [...groups].sort((a, b) =>
    order(canonical(a), canonical(b)),
  ))
    for (const speaker of group.speakers)
      if (!speakerPeople.has(speaker))
        speakerPeople.set(speaker, canonical(group).id);
  let conflicts = 0;
  const normalized = decisions.map((decision) => {
    const group = decision.personId ? groupOf(decision.personId) : undefined;
    let personId = group ? canonical(group).id : decision.personId;
    if (
      decision.speakerId &&
      personId !== null &&
      speakerPeople.get(decision.speakerId) !== personId
    ) {
      // Retain distinct visible people, but never give one speaker two targets.
      // Unsupported/conflicting associations hold; do not redirect to an unseen head.
      personId = null;
      conflicts++;
    }
    return { ...decision, personId };
  });
  return {
    people: groups.map((group) => ({
      id: canonical(group).id,
      // Earlier observations win overlap, retaining the established baseline box.
      observations: group.members
        .flatMap((person) => person.observations)
        .toSorted((a, b) => a.startFrame - b.startFrame),
    })),
    decisions: normalized,
    mergedPeople: people.length - groups.length,
    speakerConflicts: conflicts,
  };
}
