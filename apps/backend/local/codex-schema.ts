const object = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);
const required = (schema: Record<string, unknown>) =>
  new Set<string>(
    Array.isArray(schema.required)
      ? schema.required.filter((key): key is string => typeof key === "string")
      : [],
  );

function reference(root: Record<string, unknown>, value: unknown): unknown {
  if (typeof value !== "string" || !value.startsWith("#/")) return undefined;
  let current: unknown = root;
  for (const part of value.slice(2).split("/")) {
    if (!object(current)) return undefined;
    current = current[part.replace(/~1/gu, "/").replace(/~0/gu, "~")];
  }
  return current;
}

function acceptsNull(
  value: unknown,
  root: Record<string, unknown>,
  depth = 0,
): boolean {
  if (depth > 64) return false;
  if (value === true) return true;
  if (!object(value)) return false;
  if (value.$ref)
    return acceptsNull(reference(root, value.$ref), root, depth + 1);
  if ("const" in value) return value.const === null;
  if (Array.isArray(value.enum)) return value.enum.includes(null);
  if (Array.isArray(value.anyOf))
    return value.anyOf.some((child) => acceptsNull(child, root, depth + 1));
  return (
    value.type === "null" ||
    (Array.isArray(value.type) && value.type.includes("null")) ||
    value.type === undefined
  );
}

/** Strict wire objects require all keys; absent optional values use null.
 * Source/runtime schemas stay unchanged, including Unicode-aware validation.
 */
export function codexOutputSchema(schema: Record<string, unknown>) {
  const result = structuredClone(schema);
  const visit = (value: unknown) => {
    if (Array.isArray(value)) {
      for (const child of value) visit(child);
    } else if (object(value)) {
      if (
        "pattern" in value &&
        typeof value.pattern === "string" &&
        /\\[pP]\{/u.test(value.pattern)
      )
        Reflect.deleteProperty(value, "pattern");
      for (const child of Object.values(value)) visit(child);
      if (
        value.type === "object" ||
        (Array.isArray(value.type) && value.type.includes("object"))
      ) {
        const properties =
          "properties" in value && object(value.properties)
            ? value.properties
            : {};
        const originalRequired = required(value);
        for (const [key, child] of Object.entries(properties)) {
          if (!originalRequired.has(key) && !acceptsNull(child, result))
            properties[key] = { anyOf: [child, { type: "null" }] };
        }
        Object.assign(value, {
          properties,
          required: Object.keys(properties),
          additionalProperties: false,
        });
      }
    }
  };
  visit(result);
  return result;
}

/** Remove only the null placeholders introduced for non-nullable optional keys.
 * Required/explicitly nullable values and unrelated returned data are preserved.
 */
export function codexOutputValue(
  schema: Record<string, unknown>,
  value: unknown,
): unknown {
  function matches(node: unknown, input: unknown, depth: number): boolean {
    if (!object(node) || depth > 64) return node !== false;
    if (node.$ref)
      return matches(reference(schema, node.$ref), input, depth + 1);
    if ("const" in node && node.const !== input) return false;
    if (Array.isArray(node.enum) && !node.enum.includes(input)) return false;
    const type =
      input === null ? "null" : Array.isArray(input) ? "array" : typeof input;
    const kinds = Array.isArray(node.type)
      ? node.type
      : node.type
        ? [node.type]
        : [];
    if (
      kinds.length &&
      !kinds.includes(type) &&
      !(
        type === "number" &&
        Number.isInteger(input) &&
        kinds.includes("integer")
      )
    )
      return false;
    if (object(input) && object(node.properties)) {
      for (const [key, child] of Object.entries(node.properties))
        if (object(child) && "const" in child && input[key] !== child.const)
          return false;
      for (const key of required(node))
        if (typeof key === "string" && !(key in input)) return false;
    }
    return true;
  }
  function restore(node: unknown, input: unknown, depth = 0): unknown {
    if (!object(node) || depth > 64) return input;
    if (node.$ref)
      return restore(reference(schema, node.$ref), input, depth + 1);
    if (Array.isArray(node.anyOf)) {
      const branches = node.anyOf.filter((child) =>
        matches(child, input, depth + 1),
      );
      if (branches.length === 1) return restore(branches[0], input, depth + 1);
    }
    if (Array.isArray(input))
      return input.map((item) => restore(node.items, item, depth + 1));
    if (!object(input) || !object(node.properties)) return input;
    const result = { ...input },
      requiredKeys = required(node);
    for (const [key, child] of Object.entries(node.properties)) {
      if (!(key in result)) continue;
      if (
        result[key] === null &&
        !requiredKeys.has(key) &&
        !acceptsNull(child, schema)
      )
        delete result[key];
      else result[key] = restore(child, result[key], depth + 1);
    }
    return result;
  }
  return restore(schema, value);
}
