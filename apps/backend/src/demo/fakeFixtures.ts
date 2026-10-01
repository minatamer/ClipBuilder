import {
  SAFE_ERROR_MESSAGES,
  isTerminalOperationState,
  operationStatusSchema,
  type ErrorCode,
  type OperationStatusV1,
  type SafeError,
} from "@clipbuilder/contracts";

import { abortError, type Clock } from "./fakeClock.js";

type SuccessFixture<T> = {
  outcome: "success";
  value: T;
  latencyMs: number;
};

type FailureFixture = {
  outcome: "error" | "timeout";
  code: ErrorCode;
  ruleId: string;
  latencyMs: number;
};

export type FakeFixture<T> = SuccessFixture<T> | FailureFixture;

export type FakeOpaqueIdPrefix =
  | "ses"
  | "upl"
  | "op"
  | "med"
  | "ana"
  | "cand"
  | "asm"
  | "prop"
  | "rnd"
  | "rev"
  | "trk"
  | "shot"
  | "face"
  | "focus"
  | "vreq"
  | "vcue"
  | "ast";

export class FakeIdSource {
  readonly #ordinals = new Map<string, number>();

  next(prefix: FakeOpaqueIdPrefix): string {
    const ordinal = (this.#ordinals.get(prefix) ?? 0) + 1;
    this.#ordinals.set(prefix, ordinal);
    return `${prefix}_${ordinal.toString(36).padStart(22, "0")}`;
  }

  nextRequestId(): string {
    const ordinal = (this.#ordinals.get("req") ?? 0) + 1;
    this.#ordinals.set("req", ordinal);
    return `req_${ordinal.toString(16).padStart(32, "0")}`;
  }
}

export class FakeFixtureFailure extends Error {
  constructor(readonly safeError: SafeError) {
    super(safeError.message);
    this.name = "FakeFixtureFailure";
  }
}

function requestId(ordinal: number): string {
  return `req_${ordinal.toString(16).padStart(32, "0")}`;
}

export class FakeFixtureProvider<T> {
  readonly #calls = new Map<string, number>();
  readonly #clock: Clock;
  readonly #fixtures: Readonly<Record<string, FakeFixture<T>>>;
  #requestOrdinal = 0;

  constructor(
    readonly label: "provider" | "job" | "storage",
    clock: Clock,
    fixtures: Readonly<Record<string, FakeFixture<T>>>,
  ) {
    this.#clock = clock;
    this.#fixtures = fixtures;
  }

  callCount(key?: string): number {
    if (key !== undefined) return this.#calls.get(key) ?? 0;
    return [...this.#calls.values()].reduce((total, count) => total + count, 0);
  }

  async load(key: string, signal?: AbortSignal): Promise<T> {
    const fixture = this.#fixtures[key];
    if (fixture === undefined) {
      throw new FakeFixtureFailure({
        code: "INVALID_REQUEST",
        message: SAFE_ERROR_MESSAGES.INVALID_REQUEST,
        retryable: false,
        requestId: requestId(++this.#requestOrdinal),
        ruleId: "fixture.unknown-key",
      });
    }
    this.#calls.set(key, (this.#calls.get(key) ?? 0) + 1);
    await this.#clock.sleep(fixture.latencyMs, signal);
    if (fixture.outcome === "success") return fixture.value;

    throw new FakeFixtureFailure({
      code: fixture.code,
      message: SAFE_ERROR_MESSAGES[fixture.code],
      retryable: fixture.outcome === "timeout",
      requestId: requestId(++this.#requestOrdinal),
      ruleId: fixture.ruleId,
    });
  }
}

export type FakeOperationDefinition = {
  kind: OperationStatusV1["kind"];
  stages: readonly string[];
  latencyMs: number;
  terminal:
    | { state: "succeeded"; resultRevision: string }
    | { state: "failed"; code: ErrorCode; ruleId: string };
};

type OperationRecord = {
  fixtureKey: string;
  definition: FakeOperationDefinition;
  stageIndex: number;
  status: OperationStatusV1;
};

export class FakeOperationStore {
  readonly #records = new Map<string, OperationRecord>();
  readonly #calls = new Map<string, number>();
  readonly #clock: Clock;
  readonly #definitions: Readonly<Record<string, FakeOperationDefinition>>;
  readonly #ids: FakeIdSource;
  #ordinal = 0;

  constructor(
    clock: Clock,
    definitions: Readonly<Record<string, FakeOperationDefinition>>,
    ids = new FakeIdSource(),
  ) {
    this.#clock = clock;
    this.#definitions = definitions;
    this.#ids = ids;
  }

  callCount(key?: string): number {
    if (key !== undefined) return this.#calls.get(key) ?? 0;
    return [...this.#calls.values()].reduce((total, count) => total + count, 0);
  }

  start(key: string): OperationStatusV1 {
    const definition = this.#definitions[key];
    if (definition === undefined || definition.stages.length === 0) {
      throw new FakeFixtureFailure({
        code: "INVALID_REQUEST",
        message: SAFE_ERROR_MESSAGES.INVALID_REQUEST,
        retryable: false,
        requestId: requestId(++this.#ordinal),
        ruleId: "fixture.unknown-operation",
      });
    }
    this.#calls.set(key, (this.#calls.get(key) ?? 0) + 1);
    const operationId = this.#ids.next("op");
    this.#ordinal += 1;
    const timestamp = this.#clock.now().toISOString();
    const status = operationStatusSchema.parse({
      operationId,
      kind: definition.kind,
      state: definition.stages[0]?.endsWith(".queued") ? "queued" : "running",
      stageCode: definition.stages[0],
      startedAt: definition.stages[0]?.endsWith(".queued") ? null : timestamp,
      updatedAt: timestamp,
      completedAt: null,
      pollAfterMs: 1_000,
      resultRevision: null,
      error: null,
    });
    this.#records.set(operationId, {
      fixtureKey: key,
      definition,
      stageIndex: 0,
      status,
    });
    return status;
  }

  get(operationId: string): OperationStatusV1 | null {
    return this.#records.get(operationId)?.status ?? null;
  }

  async advance(
    operationId: string,
    signal?: AbortSignal,
  ): Promise<OperationStatusV1> {
    const record = this.#records.get(operationId);
    if (record === undefined) {
      throw new FakeFixtureFailure({
        code: "OPERATION_NOT_FOUND",
        message: SAFE_ERROR_MESSAGES.OPERATION_NOT_FOUND,
        retryable: false,
        requestId: requestId(++this.#ordinal),
        ruleId: "fixture.operation-missing",
      });
    }
    if (isTerminalOperationState(record.status.state)) {
      return record.status;
    }
    await this.#clock.sleep(record.definition.latencyMs, signal);
    if (signal?.aborted === true) throw abortError();
    if (isTerminalOperationState(record.status.state)) return record.status;
    const nextIndex = Math.min(
      record.stageIndex + 1,
      record.definition.stages.length - 1,
    );
    const atLastStage = nextIndex === record.definition.stages.length - 1;
    const timestamp = this.#clock.now().toISOString();
    const terminal = atLastStage ? record.definition.terminal : null;
    const failure =
      terminal?.state === "failed"
        ? {
            code: terminal.code,
            message: SAFE_ERROR_MESSAGES[terminal.code],
            retryable: false,
            requestId: requestId(++this.#ordinal),
            ruleId: terminal.ruleId,
          }
        : null;
    const next = operationStatusSchema.parse({
      ...record.status,
      state: terminal?.state ?? "running",
      startedAt: record.status.startedAt ?? timestamp,
      stageCode: record.definition.stages[nextIndex],
      updatedAt: timestamp,
      completedAt: terminal === null ? null : timestamp,
      resultRevision:
        terminal?.state === "succeeded" ? terminal.resultRevision : null,
      error: failure,
    });
    record.stageIndex = nextIndex;
    record.status = Object.freeze(next);
    return record.status;
  }
}
