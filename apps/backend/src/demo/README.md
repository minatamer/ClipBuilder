# Deterministic sample foundation

`sampleAnalysis.ts` owns the synthetic, production-shaped sample response and
precomputed assembly metadata. `sampleManifest.ts` records the pending sample
asset status, while `sampleFakes.ts` composes the explicit success, timeout,
provider-error, and operation fixtures. The fake clock, fixture provider, and
operation store run without network or credentials, expose call counts, reject
unknown keys, and never replace a failed live call.

No sample video, poster, or generated visual binary is present. After the
rights gate is approved, add a new immutable sample version in private storage,
pin its object generation and SHA-256 in the manifest, and retain the old
version until all references and rollback evidence have moved.
