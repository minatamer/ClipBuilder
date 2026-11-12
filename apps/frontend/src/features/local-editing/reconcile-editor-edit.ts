import {
  ownerEditDocumentSchema,
  type OwnerEditDocument,
  type OwnerCaptionStyle,
} from "../../../../../packages/contracts/local/editor.ts";

const record = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);
function equal(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (Array.isArray(a) && Array.isArray(b))
    return a.length === b.length && a.every((value, i) => equal(value, b[i]));
  if (!record(a) || !record(b)) return false;
  const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])];
  return keys.every((key) => equal(a[key], b[key]));
}

/** Three-way authored changes only. A new source/base is never rebased. */
export function reconcileEditorEdit(
  base: OwnerEditDocument,
  local: OwnerEditDocument,
  saved: OwnerEditDocument,
  preferLocal = false,
  inheritedCaption?: OwnerCaptionStyle,
) {
  const compatible = [base, local].every(
    (value) =>
      value.clipId === saved.clipId &&
      value.fingerprint === saved.fingerprint &&
      value.baseHash === saved.baseHash,
  );
  if (!compatible || saved.revision < base.revision)
    return {
      draft: structuredClone(local),
      conflicts: [compatible ? "revision" : "source"],
      compatible,
      valid: false,
    };
  const conflicts = new Set<string>();
  const conflict = (path: string, a: unknown, b: unknown) => {
    conflicts.add(path);
    return preferLocal ? a : b;
  };
  const merge = (
    before: unknown,
    a: unknown,
    b: unknown,
    path: string,
  ): unknown => {
    if (equal(a, b)) return b;
    if (equal(a, before)) return b;
    if (equal(b, before)) return a;
    // Null means the prepared caption style, not an empty style. Compare the
    // first explicit edits against that same inherited baseline on both sides.
    if (
      path === "captions" &&
      before === null &&
      record(a) &&
      record(b) &&
      inheritedCaption
    )
      return merge(inheritedCaption, a, b, path);
    if (record(before) && record(a) && record(b)) {
      const result: Record<string, unknown> = Object.create(null);
      for (const key of new Set([
        ...Object.keys(before),
        ...Object.keys(a),
        ...Object.keys(b),
      ])) {
        result[key] =
          !path &&
          ["version", "revision", "clipId", "fingerprint", "baseHash"].includes(
            key,
          )
            ? b[key]
            : merge(before[key], a[key], b[key], path ? `${path}.${key}` : key);
      }
      return result;
    }
    if (Array.isArray(before) && Array.isArray(a) && Array.isArray(b)) {
      const all = [...before, ...a, ...b];
      const key = ["id", "wordId", "speakerId"].find(
        (key) =>
          all.length > 0 &&
          all.every((value) => record(value) && typeof value[key] === "string"),
      );
      if (!key) return conflict(path, a, b);
      const identity = (value: unknown) =>
        record(value) ? String(value[key]) : "";
      const maps = [before, a, b].map(
        (values) => new Map(values.map((value) => [identity(value), value])),
      );
      if ([before, a, b].some((values, i) => values.length !== maps[i]!.size))
        return conflict(path, a, b);
      const [oldMap, localMap, savedMap] = maps;
      const values = new Map<string, unknown>();
      for (const id of new Set([
        ...oldMap!.keys(),
        ...localMap!.keys(),
        ...savedMap!.keys(),
      ])) {
        const value = merge(
          oldMap!.get(id),
          localMap!.get(id),
          savedMap!.get(id),
          `${path}.${id}`,
        );
        if (value !== undefined) values.set(id, value);
      }
      const common = new Set(
        before
          .map(identity)
          .filter(
            (id) => localMap!.has(id) && savedMap!.has(id) && values.has(id),
          ),
      );
      const originalOrder = before.map(identity).filter((id) => common.has(id));
      const localOrder = a.map(identity).filter((id) => common.has(id));
      const savedOrder = b.map(identity).filter((id) => common.has(id));
      const localMoved = !equal(originalOrder, localOrder);
      const savedMoved = !equal(originalOrder, savedOrder);
      if (localMoved && savedMoved && !equal(localOrder, savedOrder))
        conflicts.add(`${path}.order`);
      const useLocal = localMoved && (!savedMoved || preferLocal);
      const primary = useLocal ? a : b,
        secondary = useLocal ? b : a;
      const order = primary.map(identity).filter((id) => values.has(id));
      const otherOrder = secondary.map(identity).filter((id) => values.has(id));
      for (const [index, id] of otherOrder.entries()) {
        if (order.includes(id)) continue;
        const previous = otherOrder
          .slice(0, index)
          .reverse()
          .find((id) => order.includes(id));
        const next = otherOrder
          .slice(index + 1)
          .find((id) => order.includes(id));
        order.splice(
          previous
            ? order.indexOf(previous) + 1
            : next
              ? order.indexOf(next)
              : order.length,
          0,
          id,
        );
      }
      return order.map((id) => values.get(id));
    }
    return conflict(path, a, b);
  };
  const value = merge(base, local, saved, "");
  if (!record(value)) throw Error("invalid_edit_reconciliation");
  // All values originate in the typed documents. Raw invalid form numbers are
  // retained locally; the existing strict request/preview guards still block them.
  const draft = Object.assign(structuredClone(saved), value, {
    revision: saved.revision,
    baseHash: saved.baseHash,
    fingerprint: saved.fingerprint,
  });
  return {
    draft,
    conflicts: [...conflicts],
    compatible: true,
    valid: ownerEditDocumentSchema.safeParse(draft).success,
  };
}
