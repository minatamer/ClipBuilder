/** Provider JSON Schema regexes cannot carry JavaScript's Unicode `u` flag.
 * Keep the source/runtime schemas intact; relax only those wire patterns.
 */
export function codexOutputSchema(schema: Record<string, unknown>) {
  const result = structuredClone(schema);
  const visit = (value: unknown) => {
    if (Array.isArray(value)) {
      for (const child of value) visit(child);
    } else if (value !== null && typeof value === "object") {
      if (
        "pattern" in value &&
        typeof value.pattern === "string" &&
        /\\[pP]\{/u.test(value.pattern)
      )
        Reflect.deleteProperty(value, "pattern");
      for (const child of Object.values(value)) visit(child);
    }
  };
  visit(result);
  return result;
}
