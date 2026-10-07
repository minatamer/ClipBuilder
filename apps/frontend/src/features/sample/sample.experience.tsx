"use client";
import { ConnectionFailureNotice, WorkflowRecovery } from "./workflow-recovery";
import { reportBrowserDiagnostic } from "../diagnostics/browser.diagnostics";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  useEffectEvent,
  type ReactNode,
} from "react";
import { ArrowRight, Film, Upload, X } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
  exitClippingSession,
  finishPendingExit,
} from "../session/session.exit";
import {
  type PublicConfigResponse,
  type SafeError,
  type ProcessingChallengeAction,
} from "@clipbuilder/contracts";
import { PrivacyDialog } from "../../app/privacy-dialog";
import { Button } from "../../shared/ui/button";
import { BrandMark } from "../../shared/ui/brand-mark";
import { Progress } from "../../shared/ui/progress";
import { WorkflowFrame } from "../../shared/ui/workflow-frame";
import {
  ClippingSessionProvider,
  useClippingSession,
} from "../session/session.provider";
import {
  selectAvailableActions,
  selectStageTitle,
} from "../session/session.selectors";
import { CandidateReview } from "./candidate.review";
import { ClipReview } from "./clip.review";
import { runSelectedAssembly } from "../assembly/selected-assembly.flow";
import { CloudResult } from "./cloud-result";
import { runFinalRender } from "../render/final-render.flow";
import { ResultPreview } from "./result-preview";
import { ProcessingStatus } from "./processing-status";
import { developmentInput } from "./development.input";
import {
  developmentOperationFraction,
  confirmDevelopmentAnalysis,
  developmentStageLabel,
  runDevelopmentStage,
} from "./development.progress";
import {
  SampleApiFailure,
  sampleApi,
  sampleFailure,
  type SampleApi,
} from "./sample.api";
import styles from "./sample.module.css";
import { localMediaFailure } from "../media/media.errors";
import { localSessionIdentity } from "../media/workspace.restore";
import { SourcePreview } from "./source-preview";
import { createSourceAnalysisApi } from "../source-analysis/source-analysis.api";
import { AnalysisChallenge } from "../source-analysis/analysis-challenge";
import { runSourceAnalysis } from "../source-analysis/source-analysis.flow";
import type { CloudUploadProgress } from "../source-analysis/cloud-upload";
import {
  openSampleReplay,
  prepareSampleReplay,
} from "../source-analysis/sample-replay.flow";

const CloudClipReview = dynamic(
  () => import("./cloud-clip.review").then((module) => module.CloudClipReview),
  { loading: () => <p role="status">Loading clip playback</p> },
);

function Workspace({
  children,
  clear,
  localMode = false,
  cloudMode = false,
}: {
  children: ReactNode;
  clear?: () => void;
  localMode?: boolean;
  cloudMode?: boolean;
}) {
  return (
    <div className={styles.workspace}>
      <a className={styles.skipLink} href="#sample-main">
        Skip to main content
      </a>
      <header className={styles.header}>
        <a
          href="/"
          className={styles.brand}
          aria-label="ClipBuilder home"
          onClick={
            clear
              ? (event) => {
                  event.preventDefault();
                  clear();
                }
              : undefined
          }
        >
          <BrandMark className={styles.brandMark} />
          <span className={styles.brandText}>ClipBuilder</span>
        </a>
        <div className={styles.headerActions}>
          <PrivacyDialog
            localMedia={localMode}
            cloudMedia={cloudMode}
            triggerVariant="secondary"
            triggerClassName={styles.headerButton}
          />
          {clear !== undefined && (
            <Button
              variant="secondary"
              className={styles.headerButton}
              onClick={clear}
            >
              Exit
            </Button>
          )}
        </div>
      </header>
      {children}
    </div>
  );
}

export function SampleExperience({
  api = sampleApi,
  sampleRequested = false,
}: {
  api?: SampleApi;
  sampleRequested?: boolean;
}) {
  const [config, setConfig] = useState<PublicConfigResponse | null>(null);
  const [configFailed, setConfigFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    void finishPendingExit()
      .then(() => api.config(controller.signal))
      .then(
        (value) => {
          if (!controller.signal.aborted) {
            setConfig(value);
            setConfigFailed(false);
          }
        },
        () => {
          if (!controller.signal.aborted) setConfigFailed(true);
        },
      );
    return () => controller.abort();
  }, [api, attempt]);
  const localMode = config?.mode === "live" && config.localMediaEnabled;
  const enabled =
    (config?.mode === "fake" && config.sampleEnabled) || localMode;
  const availability = useMemo(
    () => ({
      sample: !!(
        (config?.mode === "fake" && config.sampleEnabled) ||
        (localMode && config?.retainedSampleEnabled)
      ),
      upload: enabled,
    }),
    [
      enabled,
      localMode,
      config?.mode,
      config?.sampleEnabled,
      config?.retainedSampleEnabled,
    ],
  );
  if (config === null)
    return (
      <Workspace>
        <WorkflowFrame
          title="Choose your video"
          step={0}
          footer={
            configFailed ? (
              <Button onClick={() => setAttempt((value) => value + 1)}>
                Retry connection
              </Button>
            ) : null
          }
        >
          <section className={styles.processing}>
            {configFailed ? (
              <p role="alert">The local service is unavailable.</p>
            ) : (
              <>
                <Progress label="Checking availability" />
                <p className={styles.modeNote}>Checking local availability</p>
              </>
            )}
          </section>
        </WorkflowFrame>
      </Workspace>
    );
  if (!enabled)
    return (
      <Workspace>
        <WorkflowFrame title="Choose your video" step={0} footer={null}>
          <section className={styles.empty}>
            <Film size={40} aria-hidden="true" />
            <h2>Processing is not connected yet.</h2>
            <p>
              Real upload and processing require the remaining implementation
              and readiness gates.
            </p>
            <p className={styles.modeNote}>
              Real processing is unavailable. No development fallback.
            </p>
            <Button icon={Upload} disabled>
              Choose a video
            </Button>
          </section>
        </WorkflowFrame>
      </Workspace>
    );
  return (
    <ClippingSessionProvider
      availability={availability}
      loadServerEvidence={api.evidence}
      localMode={localMode}
    >
      <SampleScreen
        api={api}
        availability={availability}
        config={config}
        sampleRequested={sampleRequested}
      />
    </ClippingSessionProvider>
  );
}

function SampleScreen({
  api,
  availability,
  config,
  sampleRequested,
}: {
  api: SampleApi;
  availability: { sample: boolean; upload: boolean };
  config: PublicConfigResponse;
  sampleRequested: boolean;
}) {
  const { state, dispatch, effects, workspace, retryRestore } =
    useClippingSession();
  const localMode = workspace !== null;
  const cloudApi = useMemo(() => createSourceAnalysisApi(), []);
  const [analysisLabel, setAnalysisLabel] = useState("Preparing analysis");
  const [uploadProgress, setUploadProgress] =
    useState<CloudUploadProgress | null>(null);
  const [challenge, setChallenge] = useState<{
    sessionId: string;
    action: ProcessingChallengeAction;
  } | null>(null);
  const challengePromise = useRef<{
    resolve(token: string): void;
    reject(): void;
  } | null>(null);
  const onToken = useCallback((token: string) => {
    challengePromise.current?.resolve(token);
    setChallenge(null);
  }, []);
  const onChallengeFailure = useCallback(() => {
    challengePromise.current?.reject();
    setChallenge(null);
  }, []);
  const [busy, setBusy] = useState(false);
  const [analysisStartedAt, setAnalysisStartedAt] = useState<number | null>(
    null,
  );
  const [failure, setFailure] = useState<SafeError | null>(null);
  const visibleFailure = failure ?? ("failure" in state ? state.failure : null);
  const failureCode = visibleFailure?.code;
  const failureRequestId = visibleFailure?.requestId;
  useEffect(() => {
    if (failureCode && failureRequestId)
      void reportBrowserDiagnostic({
        kind: "workflow-failed",
        code: failureCode,
        sourceRequestId: failureRequestId,
      });
  }, [failureCode, failureRequestId]);
  const router = useRouter();
  const exiting = useRef(false);
  const [evidenceAttempt, setEvidenceAttempt] = useState(0);
  const [deliveryFooter, setDeliveryFooter] = useState<HTMLDivElement | null>(
    null,
  );
  const pending = useRef<AbortController | null>(null);
  const phase = useRef<{ key: string; controller: AbortController } | null>(
    null,
  );
  const title = useRef<HTMLHeadingElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const sampleEntryHandled = useRef(false);
  const actions = selectAvailableActions(state);
  const analysisWaitStartedAt =
    state.stage === "analyzing" ||
    (busy && state.stage === "analysis-confirmation")
      ? analysisStartedAt
      : null;
  const identity = "identity" in state ? state.identity : null;
  const snapshot = "analysis" in state ? state.analysis : null;
  const review =
    state.stage === "clip-review" || state.stage === "render-failed"
      ? state.review
      : null;
  const assembly =
    state.stage === "clip-review" || state.stage === "render-failed"
      ? state.assembly
      : null;

  useEffect(() => {
    title.current?.focus();
  }, [state.stage]);
  useEffect(
    () => () => {
      pending.current?.abort();
      phase.current?.controller.abort();
      challengePromise.current?.reject();
    },
    [],
  );
  useEffect(() => {
    if (identity === null || localMode) return;
    const timer = setTimeout(
      () => {
        effects.clear();
        pending.current?.abort();
        phase.current?.controller.abort();
        dispatch({ type: "SESSION_EXPIRED" });
      },
      Math.max(0, Date.parse(identity.expiresAt) - Date.now()),
    );
    return () => clearTimeout(timer);
  }, [dispatch, effects, identity, localMode]);

  useEffect(() => {
    if (localMode) return;
    const operationId = "operation" in state ? state.operation.operationId : "";
    const key = `${state.stage}:${operationId}:${evidenceAttempt}`;
    if (phase.current?.key === key) return;
    phase.current?.controller.abort();
    const controller = new AbortController();
    phase.current = { key, controller };
    const stop = effects.registerStopper(() => controller.abort());
    void runDevelopmentStage(state, api, dispatch, controller.signal)
      .catch((error) => {
        if (!controller.signal.aborted)
          setFailure(
            error instanceof SampleApiFailure ? error.failure : sampleFailure(),
          );
      })
      .finally(stop);
  }, [api, dispatch, effects, evidenceAttempt, state, localMode]);

  useEffect(() => {
    if (
      localMode ||
      identity === null ||
      snapshot === null ||
      (snapshot.bundle !== null && (review === null || assembly !== null))
    )
      return;
    const controller = new AbortController();
    void (async () => {
      const analysis = await api.analysis(
        snapshot.analysisId,
        controller.signal,
      );
      if (review !== null) {
        const bundle = await api.assembly(
          review.assemblyReference.assemblyId,
          controller.signal,
        );
        if (!controller.signal.aborted)
          dispatch({
            type: "REVIEW_BUNDLES_REFRESHED",
            analysis,
            assembly: bundle,
          });
      } else if (!controller.signal.aborted)
        dispatch({
          type: "ANALYSIS_REFRESHED",
          sessionId: identity.sessionId,
          analysis,
        });
    })().catch(() => {
      if (!controller.signal.aborted) setFailure(sampleFailure());
    });
    return () => controller.abort();
  }, [
    api,
    assembly,
    dispatch,
    identity,
    snapshot,
    review,
    evidenceAttempt,
    localMode,
  ]);

  async function requestChallenge(
    sessionId: string,
    action: ProcessingChallengeAction,
    signal: AbortSignal,
  ) {
    signal.throwIfAborted();
    return new Promise<string>((resolve, reject) => {
      const abort = () => {
        challengePromise.current = null;
        setChallenge(null);
        reject(new Error("analysis-canceled"));
      };
      signal.addEventListener("abort", abort, { once: true });
      challengePromise.current = {
        resolve: (token) => {
          signal.removeEventListener("abort", abort);
          challengePromise.current = null;
          resolve(token);
        },
        reject: () => {
          signal.removeEventListener("abort", abort);
          challengePromise.current = null;
          reject(new Error("challenge-failed"));
        },
      };
      setChallenge({ sessionId, action });
    });
  }
  const analyzeSource = () => {
    if (
      !workspace ||
      state.stage !== "analysis-confirmation" ||
      !config.liveAnalysisEnabled ||
      !config.processingSiteKey ||
      ((!workspace.snapshot?.source || !workspace.sourceFile) &&
        !workspace.snapshot?.retainedSample) ||
      workspace.snapshot.cloudAnalysis
    )
      return;
    void run(async (signal) => {
      setAnalysisStartedAt(Date.now());
      try {
        await runSourceAnalysis({
          workspace,
          api: cloudApi,
          signal,
          challenge: requestChallenge,
          event: dispatch,
          label: setAnalysisLabel,
          uploadProgress: (value) => {
            if (!signal.aborted && !exiting.current) setUploadProgress(value);
          },
        });
      } finally {
        if (!signal.aborted && !exiting.current) {
          setAnalysisStartedAt(null);
          setUploadProgress(null);
        }
      }
    });
  };

  async function run(action: (signal: AbortSignal) => Promise<void>) {
    if (pending.current !== null) return;
    const controller = new AbortController();
    pending.current = controller;
    setBusy(true);
    setFailure(null);
    try {
      await action(controller.signal);
    } catch (error) {
      if (!controller.signal.aborted)
        setFailure(
          error instanceof SampleApiFailure ? error.failure : sampleFailure(),
        );
    } finally {
      if (pending.current === controller) {
        pending.current = null;
        setBusy(false);
      }
    }
  }
  const selectCandidate = (candidateId: string | null) => {
    if (state.stage !== "candidates" || pending.current !== null) return;
    const previousId = workspace
      ? (workspace.snapshot?.selectedId ?? null)
      : state.selectedId;
    const publish = (id: string | null) =>
      dispatch(
        id === null
          ? { type: "CANDIDATE_PREVIEW_CLOSED" }
          : { type: "CANDIDATE_SELECTED", candidateId: id },
      );
    publish(candidateId);
    if (workspace)
      void run(async (signal) => {
        try {
          await workspace.select(candidateId);
          signal.throwIfAborted();
        } catch (error) {
          if (!signal.aborted) publish(previousId);
          throw new SampleApiFailure(localMediaFailure(error));
        }
      });
  };
  const clear = () => {
    if (exiting.current) return;
    exiting.current = true;
    setAnalysisStartedAt(null);
    setUploadProgress(null);
    let storage: Storage | null = null;
    try {
      storage = window.sessionStorage;
    } catch {
      /* Exit works without storage. */
    }
    void exitClippingSession({
      storage,
      workspaceEpoch: workspace?.snapshot?.epoch,
      stop: () => {
        pending.current?.abort();
        phase.current?.controller.abort();
        challengePromise.current?.reject();
        pending.current = null;
        effects.clear();
      },
      cleanup: async () => {
        if (workspace) await workspace.exit();
      },
      navigate: () => router.replace("/"),
    });
  };
  const leaveCleanup = useEffectEvent(clear);
  useEffect(() => {
    if (state.stage === "clearing" || state.stage === "cleanup-partial")
      leaveCleanup();
  }, [state.stage]);
  const selectInput = (file: File) => {
    if (state.stage !== "intake") return;
    if (workspace) {
      if (!file) return;
      try {
        const preparation = workspace.prepare(file, (bytes) =>
          dispatch({
            type: "LOCAL_COPY_PROGRESS",
            epoch: workspace.snapshot?.epoch ?? "",
            bytes,
          }),
        );
        dispatch({
          type: "LOCAL_PREPARATION_STARTED",
          identity: localSessionIdentity(preparation.pending),
          epoch: preparation.pending.epoch,
          artifact: preparation.pending.artifacts[0]!,
        });
        void preparation.completion.then(
          (record) => {
            if (record.source)
              dispatch({
                type: "LOCAL_SOURCE_READY",
                epoch: record.epoch,
                media: record.source.media,
              });
          },
          (error) => {
            const failure = localMediaFailure(error);
            dispatch({
              type: "LOCAL_SOURCE_FAILED",
              epoch: preparation.pending.epoch,
              failure,
            });
            void workspace.clear().catch(() => {
              dispatch({ type: "CLEAR" });
            });
          },
        );
      } catch (error) {
        setFailure(localMediaFailure(error));
      }
      return;
    }
    dispatch({
      type: "FILE_SELECTED",
      localSource: developmentInput(file),
    });
  };
  const selectSample = () => {
    if (state.stage !== "intake" || !availability.sample || pending.current)
      return;
    if (config.mode === "fake") {
      dispatch({ type: "FILE_SELECTED", localSource: developmentInput() });
      return;
    }
    if (!workspace) return;
    void run(async (signal) => {
      const record = await workspace.prepareRetainedSample(signal);
      signal.throwIfAborted();
      dispatch({
        type: "RETAINED_SAMPLE_READY",
        identity: localSessionIdentity(record),
      });
    });
  };
  const startRequestedSample = useEffectEvent(selectSample);
  const simulateSample = () => {
    if (
      !workspace ||
      state.stage !== "intake" ||
      !availability.sample ||
      !config.sampleReplayEnabled ||
      pending.current
    )
      return;
    void run(async (signal) => {
      const record = await openSampleReplay({
        workspace,
        api: cloudApi,
        signal,
      });
      signal.throwIfAborted();
      if (!record.analysis) throw new Error("sample-replay-unavailable");
      dispatch({
        type: "SAMPLE_SELECTED",
        identity: localSessionIdentity(record),
        analysis: record.analysis,
      });
    });
  };
  useEffect(() => {
    if (
      !sampleRequested ||
      state.stage !== "intake" ||
      sampleEntryHandled.current
    )
      return;
    sampleEntryHandled.current = true;
    if (availability.sample) startRequestedSample();
  }, [sampleRequested, state.stage, availability.sample]);

  const findMoments = () => {
    if (localMode) analyzeSource();
    else if (state.stage === "analysis-confirmation")
      void run(async (signal) => {
        setAnalysisStartedAt(Date.now());
        await confirmDevelopmentAnalysis(state, api, dispatch, signal);
      });
  };
  const build = () => {
    if (
      workspace &&
      state.stage === "candidates" &&
      state.selectedId &&
      config.liveAssemblyEnabled &&
      config.processingSiteKey &&
      !workspace.snapshot?.cloudAssembly
    ) {
      const candidateId = state.selectedId;
      void run(async (signal) => {
        dispatch({ type: "CLOUD_ASSEMBLY_STARTED", candidateId });
        try {
          if (
            workspace.snapshot?.sampleReplayRevision &&
            !workspace.snapshot.cloudAnalysis
          ) {
            await prepareSampleReplay({
              workspace,
              api: cloudApi,
              signal,
              challenge: requestChallenge,
              label: setAnalysisLabel,
            });
          }
          const result = await runSelectedAssembly({
            workspace,
            candidateId,
            api: cloudApi,
            signal,
            challenge: requestChallenge,
            label: setAnalysisLabel,
          });
          if (!signal.aborted)
            dispatch({ type: "CLOUD_ASSEMBLY_COMPLETED", result });
        } catch (error) {
          if (!signal.aborted)
            dispatch({
              type: "CLOUD_ASSEMBLY_FAILED",
              failure: localMediaFailure(error),
            });
          throw error;
        }
      });
      return;
    }
    if (
      localMode ||
      state.stage !== "candidates" ||
      !actions.includes("build-selection")
    )
      return;
    const selected = state.analysis.bundle?.candidates.find(
      (item) => item.id === state.selectedId,
    );
    if (selected === undefined) return;
    void run(async (signal) => {
      const result = await api.build(
        {
          analysisId: state.analysis.analysisId,
          selection: {
            candidateId: selected.id,
            startWordId: selected.startWordId,
            endWordId: selected.endWordId,
          },
          turnstileToken: "local-synthetic-fixture",
        },
        signal,
      );
      if (!signal.aborted)
        dispatch({
          type: "BUILD_SELECTED",
          operation: result.operation,
          startWordId: selected.startWordId,
          endWordId: selected.endWordId,
        });
    });
  };
  const restoreOutput = () => {
    if (!workspace || state.stage !== "cloud-render-failed") return;
    const assembled = state.assembly;
    void run(async (signal) => {
      const session = await cloudApi.session(signal);
      if (session.sessionId !== assembled.binding.sessionId) throw new Error();
      const result = await cloudApi.renderResult(assembled, signal);
      await workspace.storeFinalRender(result, signal);
      if (!signal.aborted) dispatch({ type: "CLOUD_RENDER_COMPLETED", result });
    });
  };
  const render = () => {
    if (
      workspace &&
      state.stage === "cloud-review" &&
      config.liveRenderEnabled &&
      config.processingSiteKey &&
      !workspace.snapshot?.cloudRender
    ) {
      void run(async (signal) => {
        dispatch({ type: "CLOUD_RENDER_STARTED" });
        try {
          const result = await runFinalRender({
            workspace,
            api: cloudApi,
            signal,
            challenge: requestChallenge,
            label: setAnalysisLabel,
          });
          if (!signal.aborted)
            dispatch({ type: "CLOUD_RENDER_COMPLETED", result });
        } catch (error) {
          if (!signal.aborted)
            dispatch({
              type: "CLOUD_RENDER_FAILED",
              failure: localMediaFailure(error),
            });
          throw error;
        }
      });
      return;
    }
    if (
      localMode ||
      state.stage !== "clip-review" ||
      !actions.includes("confirm-render") ||
      state.assembly === null
    )
      return;
    const assemblyId = state.assembly.assemblyId;
    void run(async (signal) => {
      const result = await api.render(
        {
          analysisId: state.analysis.analysisId,
          assemblyId,
          manifestHash: state.review.manifestReference.manifestHash,
          turnstileToken: "local-synthetic-fixture",
        },
        signal,
      );
      if (!signal.aborted)
        dispatch({ type: "RENDER_CONFIRMED", operation: result.operation });
    });
  };
  const stageTitles: Partial<Record<typeof state.stage, string>> = {
    intake: "Choose your video",
    "analysis-confirmation": "Preview your video",
    uploading: "Uploading video",
    analyzing: "Finding the best moments",
    candidates: "Pick one moment",
    assembling: "Building your clip",
    "cloud-assembling": "Building your clip",
    "cloud-review": "Review your clip",
    "clip-review": "Review your clip",
    rendering: "Exporting your clip",
    result: "Your clip",
  };
  const loading =
    state.stage === "bootstrapping" ||
    state.stage === "clearing" ||
    (snapshot !== null &&
      (snapshot.bundle === null || (review !== null && assembly === null)));
  const processing =
    analysisWaitStartedAt !== null ||
    state.stage === "uploading" ||
    state.stage === "upload-authorizing" ||
    state.stage === "media-inspecting" ||
    state.stage === "analyzing" ||
    state.stage === "assembling" ||
    state.stage === "cloud-assembling" ||
    state.stage === "cloud-rendering" ||
    state.stage === "rendering" ||
    (state.stage === "local-inspection" &&
      state.localSource.validation.status === "accepted");
  const processingLabel =
    state.stage === "cloud-assembling" || state.stage === "cloud-rendering"
      ? analysisLabel
      : state.stage === "uploading"
        ? "Uploading video"
        : "operation" in state
          ? developmentStageLabel(state.operation.stageCode)
          : "Preparing your video";
  const processingFraction =
    state.stage === "uploading" && state.upload.status === "requesting"
      ? state.upload.bytesSent / state.upload.totalBytes
      : "operation" in state
        ? developmentOperationFraction(state.operation)
        : undefined;
  const rejected =
    state.stage === "local-inspection" &&
    state.localSource.validation.status === "rejected";
  return (
    <Workspace
      localMode={localMode}
      cloudMode={config.liveAnalysisEnabled}
      clear={clear}
    >
      <WorkflowFrame
        title={stageTitles[state.stage] ?? selectStageTitle(state)}
        bounded={
          [
            "candidates",
            "clip-review",
            "cloud-review",
            "cloud-rendering",
            "cloud-render-failed",
            "cloud-result",
            "result",
            "local-preparing",
          ].includes(state.stage) && !loading
        }
        headingRef={title}
        subtitle={
          state.stage === "intake"
            ? "One conversation. One finished clip."
            : state.stage === "candidates"
              ? workspace?.snapshot?.sampleReplayRevision
                ? "Saved sample moments. No new analysis calls; Proceed runs paid assembly."
                : "Choose the conversation you want to keep."
              : undefined
        }
        step={
          [
            "assembling",
            "cloud-assembling",
            "cloud-review",
            "cloud-rendering",
            "cloud-render-failed",
            "cloud-result",
            "cloud-assembly-failed",
            "assembly-failed",
            "clip-review",
            "rendering",
            "render-failed",
            "result",
          ].includes(state.stage)
            ? 2
            : [
                  "analyzing",
                  "analysis-failed",
                  "candidates",
                  "no-candidates",
                ].includes(state.stage)
              ? 1
              : 0
        }
        footer={
          state.stage === "candidates" && state.selectedId === null ? null : (
            <div className={styles.footerActions} ref={setDeliveryFooter}>
              {state.stage === "analysis-confirmation" && (
                <>
                  <Button variant="secondary" onClick={clear}>
                    Choose another video
                  </Button>
                  <Button
                    onClick={findMoments}
                    disabled={
                      busy ||
                      !!failure ||
                      (localMode &&
                        (!config.liveAnalysisEnabled ||
                          !config.processingSiteKey))
                    }
                  >
                    Find moments
                  </Button>
                </>
              )}
              {state.stage === "candidates" && state.selectedId !== null && (
                <Button
                  icon={ArrowRight}
                  onClick={build}
                  disabled={
                    busy ||
                    (localMode
                      ? !config.liveAssemblyEnabled ||
                        !config.processingSiteKey ||
                        !!workspace?.snapshot?.cloudAssembly
                      : !actions.includes("build-selection"))
                  }
                >
                  {busy ? "Starting build..." : "Proceed"}
                </Button>
              )}
              {processing && (
                <Button
                  variant="secondary"
                  icon={X}
                  onClick={(event) => {
                    // A second confirmation click can land here after the stage changes.
                    if (event.detail <= 1) clear();
                  }}
                >
                  {localMode ? "Cancel preparation" : "Cancel preview"}
                </Button>
              )}
              {(state.stage === "clip-review" ||
                state.stage === "cloud-review") && (
                <Button
                  icon={ArrowRight}
                  disabled={
                    busy ||
                    loading ||
                    (state.stage === "cloud-review"
                      ? !config.liveRenderEnabled ||
                        !config.processingSiteKey ||
                        !!workspace?.snapshot?.cloudRender
                      : localMode || !actions.includes("confirm-render"))
                  }
                  onClick={render}
                >
                  Confirm export
                </Button>
              )}
              {(state.stage === "result" || state.stage === "cloud-result") && (
                <>
                  <Button variant="secondary" onClick={clear}>
                    Start over
                  </Button>
                </>
              )}
              {(rejected ||
                [
                  "no-candidates",
                  "expired",
                  "cleanup-partial",
                  "analysis-failed",
                  "assembly-failed",
                  "cloud-assembly-failed",
                  "cloud-render-failed",
                  "render-failed",
                ].includes(state.stage)) && (
                <Button disabled={busy} onClick={clear}>
                  {state.stage === "cleanup-partial" ? "Exit" : "Start over"}
                </Button>
              )}
              {state.stage === "fatal" && actions.includes("retry-restore") && (
                <Button onClick={retryRestore}>Reconnect</Button>
              )}
              {state.stage === "fatal" &&
                !actions.includes("retry-restore") && (
                  <Button onClick={clear}>Start over</Button>
                )}
            </div>
          )
        }
      >
        {failure !== null && (
          <ConnectionFailureNotice
            failure={failure}
            busy={busy}
            onClear={clear}
            onRetry={() => {
              setFailure(null);
              setEvidenceAttempt((value) => value + 1);
            }}
          />
        )}
        {loading && (
          <section className={styles.processing}>
            <Progress
              label={
                state.stage === "clearing"
                  ? "Clearing the preview"
                  : "Restoring preview data"
              }
              active={failure === null}
            />
          </section>
        )}
        {processing && !loading && (
          <ProcessingStatus
            key={
              analysisWaitStartedAt !== null
                ? "source-analysis"
                : "operation" in state
                  ? state.operation.operationId
                  : state.stage
            }
            label={
              localMode && state.stage === "analyzing"
                ? analysisLabel
                : processingLabel
            }
            mode={localMode ? "real" : "fake"}
            active={failure === null && !exiting.current}
            {...(uploadProgress === null ? {} : { uploadProgress })}
            findingMoments={
              analysisWaitStartedAt !== null || state.stage === "analyzing"
            }
            {...(analysisWaitStartedAt === null
              ? {}
              : { startedAtMs: analysisWaitStartedAt })}
            {...("operation" in state ? { operation: state.operation } : {})}
            {...(processingFraction === undefined
              ? {}
              : { fraction: processingFraction })}
          />
        )}
        {state.stage === "local-preparing" && (
          <section className={styles.processing} aria-label="Local preparation">
            <Progress
              label="Preparing video on this device"
              fraction={state.copiedBytes / state.artifact.bytes}
            />
            {workspace?.sourceUrl && (
              <SourcePreview sourceUrl={workspace.sourceUrl} />
            )}
          </section>
        )}
        {state.stage === "analysis-confirmation" &&
          analysisWaitStartedAt === null && (
            <>
              <SourcePreview
                {...(workspace?.sourceUrl
                  ? { sourceUrl: workspace.sourceUrl }
                  : {})}
                {...(state.media ? { durationMs: state.media.durationMs } : {})}
              />
              {!localMode && (
                <p className={styles.modeNote}>
                  This is a simulated source preview. Selected video bytes are
                  not read or uploaded; Find moments continues the fixture
                  journey.
                </p>
              )}
            </>
          )}
        {challenge && config.processingSiteKey && (
          <AnalysisChallenge
            key={`${challenge.sessionId}:${challenge.action}`}
            siteKey={config.processingSiteKey}
            sessionId={challenge.sessionId}
            action={challenge.action}
            onToken={onToken}
            onFailure={onChallengeFailure}
          />
        )}
        {state.stage === "intake" && (
          <section className={styles.intake} aria-label="Video intake">
            <div
              className={styles.dropzone}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = "copy";
              }}
              onDrop={(event) => {
                event.preventDefault();
                if (pending.current) return;
                const file = event.dataTransfer.files[0];
                if (event.dataTransfer.files.length === 1 && file)
                  selectInput(file);
                else
                  setFailure({
                    ...sampleFailure(),
                    message: "Choose exactly one MP4 video.",
                  });
              }}
            >
              <Upload aria-hidden="true" />
              <h2>Drop your conversation here</h2>
              <p>MP4 · 15 seconds to 20 minutes</p>
              <input
                ref={fileInput}
                className={styles.screenReaderText}
                type="file"
                tabIndex={-1}
                aria-label={
                  localMode ? "Local input video" : "Development input video"
                }
                accept="video/mp4"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (file !== undefined && !pending.current) selectInput(file);
                }}
              />
              <div className={styles.intakeActions}>
                <Button
                  icon={Film}
                  disabled={busy}
                  onClick={() => fileInput.current?.click()}
                >
                  Choose a video
                </Button>
                {availability.sample && (
                  <Button
                    variant="secondary"
                    disabled={busy}
                    onClick={selectSample}
                    aria-describedby={
                      config.mode === "fake" ? "sample-preview-note" : undefined
                    }
                  >
                    Use sample
                  </Button>
                )}
                {availability.sample && config.sampleReplayEnabled && (
                  <Button
                    variant="secondary"
                    disabled={busy}
                    onClick={simulateSample}
                  >
                    Simulate find moments for sample
                  </Button>
                )}
              </div>
              {config.mode === "fake" && (
                <p id="sample-preview-note" className={styles.sampleNotice}>
                  Sample previews and results are simulated.
                </p>
              )}
              {busy && (
                <div role="status" className={styles.sampleLoading}>
                  <Progress label="Opening sample video" />
                  <Button variant="quiet" onClick={clear}>
                    Cancel sample
                  </Button>
                </div>
              )}
            </div>
            <p className={styles.limits}>
              <span>
                Recommended <strong>&lt;10 min / 250 MiB</strong>
              </span>
              <span>
                Maximum <strong>20 min AND 500 MiB</strong>
              </span>
              <span>
                Final clip <strong>10-60 seconds</strong>
              </span>
            </p>
            <p className={styles.rights}>
              For the best results, choose a clear conversation with focused
              topics, complete ideas, and minimal background noise.
            </p>
            {localMode && (
              <p className={styles.rights}>
                {config.liveAnalysisEnabled
                  ? "Video is kept in one temporary device workspace for up to two hours. Find moments uploads the original to private temporary storage; bounded audiovisual proxies go to Google AI. Provider retention is separate. Exit starts quiet server and device cleanup. Closing the tab does not guarantee deletion; independent server expiry and device cleanup on the next visit apply."
                  : `Chosen files stay on this device in one temporary workspace for up to two hours. Exit starts cleanup in the background. Closing the tab does not guarantee deletion; expired files are cleaned while open or on the next visit. Browser storage may be removed sooner.${config.retainedSampleEnabled ? " The sample streams from private storage." : ""}`}
              </p>
            )}
          </section>
        )}
        {rejected && (
          <section className={styles.empty}>
            <h2>This input is not supported.</h2>
            <p>
              Choose one nonempty MP4 under 500 MiB. No file was read or
              uploaded.
            </p>
          </section>
        )}
        {state.stage === "candidates" && state.analysis.bundle !== null && (
          <CandidateReview
            analysis={state.analysis.bundle}
            selectedId={state.selectedId}
            onSelect={selectCandidate}
            onClose={() => selectCandidate(null)}
            busy={busy}
            {...(localMode && workspace?.sourceUrl
              ? { sourceUrl: workspace.sourceUrl }
              : {})}
          />
        )}
        {state.stage === "no-candidates" && (
          <section className={styles.empty}>
            <h2>No moments available.</h2>
            <p>
              The analysis did not return usable moments. Start over to try
              again.
            </p>
          </section>
        )}
        {review !== null &&
          snapshot?.bundle !== null &&
          snapshot?.bundle !== undefined &&
          assembly !== null && (
            <ClipReview
              key={state.stage}
              analysis={snapshot.bundle}
              assembly={assembly}
              playbackTimeMs={review.playback.currentTimeMs}
              onPosition={(currentTimeMs) => {
                if (state.stage !== "clip-review") return;
                dispatch({ type: "PLAYBACK_REQUESTED", currentTimeMs });
                dispatch({ type: "PLAYBACK_UPDATED", currentTimeMs });
              }}
            />
          )}
        {state.stage === "cloud-review" && state.analysis.bundle && (
          <CloudClipReview
            key={state.result.manifestHash}
            analysis={state.analysis.bundle}
            result={state.result}
            api={cloudApi}
          />
        )}
        <WorkflowRecovery
          state={state}
          localMode={localMode}
          busy={busy}
          onRestoreOutput={restoreOutput}
        />
        {state.stage === "cloud-result" && (
          <CloudResult
            key={state.result.output.artifactId}
            result={state.result}
            assembly={state.assembly}
            api={cloudApi}
            deliveryFooter={deliveryFooter}
          />
        )}
        {state.stage === "result" && (
          <ResultPreview
            summary={state.clipSummary}
            api={api}
            deliveryFooter={deliveryFooter}
          />
        )}
      </WorkflowFrame>
    </Workspace>
  );
}
