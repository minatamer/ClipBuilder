"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { ArrowRight, Clapperboard, Film, Upload, X } from "lucide-react";
import {
  type PublicConfigResponse,
  type SafeError,
} from "@clipbuilder/contracts";
import { PrivacyDialog } from "../../app/privacy-dialog";
import { Button } from "../../shared/ui/button";
import { Progress } from "../../shared/ui/progress";
import { WorkflowFrame } from "../../shared/ui/workflow-frame";
import {
  ClippingSessionProvider,
  useClippingSession,
} from "../session/session.provider";
import {
  selectAvailableActions,
  selectIsClearable,
  selectStageTitle,
} from "../session/session.selectors";
import { CandidateReview } from "./candidate.review";
import { ClipReview } from "./clip.review";
import { CloudClipReview } from "./cloud-clip.review";
import { runSelectedAssembly } from "../assembly/selected-assembly.flow";
import { CloudResult } from "./cloud-result";
import { runFinalRender } from "../render/final-render.flow";
import { ResultPreview } from "./result-preview";
import { ProcessingStatus } from "./processing-status";
import { developmentInput } from "./development.input";
import {
  developmentOperationFraction,
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
import {
  clearAnalysisMedia,
  runSourceAnalysis,
} from "../source-analysis/source-analysis.flow";

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
        <a href="/" className={styles.brand}>
          <Clapperboard size={24} aria-hidden="true" />
          ClipBuilder
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
              Clear media
            </Button>
          )}
        </div>
      </header>
      {children}
    </div>
  );
}

export function SampleExperience({ api = sampleApi }: { api?: SampleApi }) {
  const [config, setConfig] = useState<PublicConfigResponse | null>(null);
  const [configFailed, setConfigFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    void api.config(controller.signal).then(
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
    () => ({ sample: false, upload: enabled }),
    [enabled],
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
            ) : (
              <p className={styles.modeNote}>Checking local availability</p>
            )
          }
        >
          <section className={styles.processing}>
            {configFailed ? (
              <p role="alert">The local service is unavailable.</p>
            ) : (
              <Progress label="Checking availability" />
            )}
          </section>
        </WorkflowFrame>
      </Workspace>
    );
  if (!enabled)
    return (
      <Workspace>
        <WorkflowFrame
          title="Choose your video"
          step={0}
          footer={
            <p className={styles.modeNote}>
              Real processing is unavailable. No development fallback.
            </p>
          }
        >
          <section className={styles.empty}>
            <Film size={40} aria-hidden="true" />
            <h2>Processing is not connected yet.</h2>
            <p>
              Real upload and processing require the remaining implementation
              and readiness gates.
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
      <SampleScreen api={api} availability={availability} config={config} />
    </ClippingSessionProvider>
  );
}

function SampleScreen({
  api,
  availability,
  config,
}: {
  api: SampleApi;
  availability: { sample: boolean; upload: boolean };
  config: PublicConfigResponse;
}) {
  const { state, dispatch, effects, workspace, retryRestore } =
    useClippingSession();
  const localMode = workspace !== null;
  const cloudApi = useMemo(() => createSourceAnalysisApi(), []);
  const [consent, setConsent] = useState(false);
  const [analysisLabel, setAnalysisLabel] = useState("Preparing analysis");
  const [challenge, setChallenge] = useState<{
    sessionId: string;
    action: "transcription" | "candidate-analysis" | "visual-plan" | "render";
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
  const [failure, setFailure] = useState<SafeError | null>(null);
  const [evidenceAttempt, setEvidenceAttempt] = useState(0);
  const pending = useRef<AbortController | null>(null);
  const phase = useRef<{ key: string; controller: AbortController } | null>(
    null,
  );
  const title = useRef<HTMLHeadingElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const actions = selectAvailableActions(state);
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

  useEffect(() => {
    if (state.stage !== "clearing") return;
    const controller = new AbortController();
    effects.clear();
    void (async () => {
      if (workspace) {
        const cleanup = await clearAnalysisMedia({
          workspace,
          api: cloudApi,
          signal: controller.signal,
          cloudPending:
            !!workspace.snapshot?.cloudAnalysis || !!workspace.remoteCleanup,
          allowMissingSession:
            workspace.remoteCleanup?.allowMissingSession ??
            !workspace.snapshot?.cloudAnalysis?.cleanupRequired,
        });
        if (!cleanup.complete) throw new SampleApiFailure(sampleFailure());
      } else await api.clear(controller.signal);
    })().then(
      () => {
        if (!controller.signal.aborted)
          dispatch({ type: "CLEAR_SUCCEEDED", availability });
      },
      () => {
        if (!controller.signal.aborted)
          dispatch({ type: "CLEAR_PARTIAL", failure: sampleFailure() });
      },
    );
    return () => controller.abort();
  }, [api, availability, cloudApi, dispatch, effects, state.stage, workspace]);

  async function requestChallenge(
    sessionId: string,
    action: "transcription" | "candidate-analysis" | "visual-plan" | "render",
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
      !consent ||
      !config.liveAnalysisEnabled ||
      !config.processingSiteKey ||
      !workspace.snapshot?.source ||
      !workspace.sourceFile ||
      workspace.snapshot.cloudAnalysis
    )
      return;
    void run((signal) =>
      runSourceAnalysis({
        workspace,
        api: cloudApi,
        signal,
        challenge: requestChallenge,
        event: dispatch,
        label: setAnalysisLabel,
      }),
    );
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
  const clear = () => {
    if (
      localMode &&
      state.stage === "fatal" &&
      state.failure.code === "ACTIVE_SESSION_EXISTS"
    )
      return;
    pending.current?.abort();
    phase.current?.controller.abort();
    pending.current = null;
    setBusy(false);
    setFailure(null);
    dispatch({ type: "CLEAR" });
  };
  const selectInput = (file?: File) => {
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
          const result = await runSelectedAssembly({
            workspace,
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
    state.stage === "uploading" ||
    state.stage === "upload-authorizing" ||
    state.stage === "media-inspecting" ||
    (state.stage === "analysis-confirmation" && !localMode) ||
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
      {...(selectIsClearable(state) &&
      !(
        localMode &&
        state.stage === "fatal" &&
        state.failure.code === "ACTIVE_SESSION_EXISTS"
      )
        ? { clear }
        : {})}
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
            "analysis-confirmation",
          ].includes(state.stage) && !loading
        }
        headingRef={title}
        subtitle={
          state.stage === "intake"
            ? "One conversation. One finished clip."
            : state.stage === "candidates"
              ? "Choose the conversation you want to keep."
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
                  "analysis-confirmation",
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
            <div className={styles.footerActions}>
              {state.stage === "intake" && !localMode && (
                <Button
                  variant="secondary"
                  icon={ArrowRight}
                  onClick={() => selectInput()}
                >
                  Use prepared input
                </Button>
              )}
              {state.stage === "analysis-confirmation" &&
                localMode &&
                config.liveAnalysisEnabled && (
                  <Button
                    onClick={analyzeSource}
                    disabled={!consent || busy || !config.processingSiteKey}
                  >
                    Find moments
                  </Button>
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
                <Button onClick={clear}>
                  {state.stage === "cleanup-partial"
                    ? "Retry cleanup"
                    : "Start over"}
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
          <div role="alert" className={styles.error}>
            <p>{failure.message}</p>
            <Button
              variant="quiet"
              onClick={() => {
                setFailure(null);
                setEvidenceAttempt((value) => value + 1);
              }}
            >
              Retry connection
            </Button>
            {failure.code === "ACTIVE_SESSION_EXISTS" && (
              <Button variant="quiet" disabled={busy} onClick={clear}>
                Clear existing preview
              </Button>
            )}
          </div>
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
              "operation" in state ? state.operation.operationId : state.stage
            }
            label={
              localMode && state.stage === "analyzing"
                ? analysisLabel
                : processingLabel
            }
            mode={localMode ? "real" : "fake"}
            active={failure === null}
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
          localMode &&
          workspace?.sourceUrl && (
            <>
              <SourcePreview
                sourceUrl={workspace.sourceUrl}
                durationMs={state.media.durationMs}
              />
              <p className={styles.modeNote}>
                {config.liveAnalysisEnabled
                  ? "Your video will be uploaded to temporary private storage. A smaller video and audio proxy is sent for AI analysis. Source access expires after two hours; cleanup is best effort and provider retention is separate."
                  : "Video prepared locally. Moment analysis requires enabled processing gates."}
              </p>
              {config.liveAnalysisEnabled && (
                <label>
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(event) => setConsent(event.target.checked)}
                  />{" "}
                  I own or have licensed this conversation and consent to these
                  transfers and paid analysis.
                </label>
              )}
            </>
          )}
        {challenge && config.processingSiteKey && (
          <AnalysisChallenge
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
                if (event.dataTransfer.files.length === 1)
                  selectInput(event.dataTransfer.files[0]);
                else
                  setFailure({
                    ...sampleFailure(),
                    message: "Choose exactly one MP4 or WebM video.",
                  });
              }}
            >
              <Upload aria-hidden="true" />
              <h2>Drop your conversation here</h2>
              <p>MP4 or WebM · 15 seconds to 20 minutes</p>
              <input
                ref={fileInput}
                className={styles.screenReaderText}
                type="file"
                tabIndex={-1}
                aria-label={
                  localMode ? "Local input video" : "Development input video"
                }
                accept="video/mp4,video/webm"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (file !== undefined) selectInput(file);
                }}
              />
              <Button icon={Film} onClick={() => fileInput.current?.click()}>
                Choose a video
              </Button>
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
              Only videos, voices and music you own or have permission to edit.
              {localMode
                ? config.liveAnalysisEnabled
                  ? " Video is kept in one temporary device workspace for up to two hours. After your consent, the original is uploaded to private temporary storage; bounded audiovisual proxies go to Google AI. Provider retention is separate. Clear requests server cleanup and attempts device deletion. Closing the tab does not guarantee deletion; independent server expiry and device cleanup on the next visit apply."
                  : " Video stays on this device in one temporary workspace for up to two hours. Clear media attempts to remove it. Closing the tab does not guarantee deletion; expired files are cleaned while open or on the next visit. Browser storage may be removed sooner."
                : " Real media will be temporary, with clear and expiry."}
            </p>
          </section>
        )}
        {rejected && (
          <section className={styles.empty}>
            <h2>This input is not supported.</h2>
            <p>
              Choose one nonempty MP4 or WebM under 500 MiB. No file was read or
              uploaded.
            </p>
          </section>
        )}
        {state.stage === "candidates" && state.analysis.bundle !== null && (
          <CandidateReview
            analysis={state.analysis.bundle}
            selectedId={state.selectedId}
            onSelect={(candidateId) => {
              dispatch({ type: "CANDIDATE_SELECTED", candidateId });
              if (workspace)
                void workspace
                  .select(candidateId)
                  .catch((error) => setFailure(localMediaFailure(error)));
            }}
            onClose={() => {
              dispatch({ type: "CANDIDATE_PREVIEW_CLOSED" });
              if (workspace)
                void workspace
                  .select(null)
                  .catch((error) => setFailure(localMediaFailure(error)));
            }}
            busy={busy}
            {...(localMode && workspace?.sourceUrl
              ? { sourceUrl: workspace.sourceUrl }
              : {})}
          />
        )}
        {state.stage === "no-candidates" && (
          <section className={styles.empty}>
            <h2>No complete moment stood out.</h2>
            <p>
              A strong opening, context and clear payoff must fit within 10-60
              seconds. No weak choices were added to fill a quota.
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
        {state.stage === "cloud-review" && (
          <p className={styles.rights}>
            Confirm one final 1080 � 1920, 30 fps H.264/AAC MP4 export. This
            uses private cloud compute, makes zero AI calls, and deletes
            temporary server source and preview copies after validated
            publication. The output remains available for ten minutes or until
            session expiry, whichever comes first.
          </p>
        )}
        {state.stage === "cloud-render-failed" && (
          <section className={styles.empty}>
            <p role="alert">
              Export could not be confirmed. Checking for an existing output
              will never start another render.
            </p>
            <Button onClick={restoreOutput} disabled={busy}>
              Check completed export
            </Button>
          </section>
        )}
        {state.stage === "cloud-result" && (
          <CloudResult
            key={state.result.output.artifactId}
            result={state.result}
            assembly={state.assembly}
            api={cloudApi}
          />
        )}
        {state.stage === "result" && (
          <ResultPreview summary={state.clipSummary} api={api} />
        )}
        {state.stage === "fatal" && (
          <section className={styles.empty}>
            <p role="alert">{state.failure.message}</p>
            {localMode && state.failure.code === "ACTIVE_SESSION_EXISTS" && (
              <p>Close the other workspace tab, then reconnect here.</p>
            )}
          </section>
        )}
        {state.stage === "expired" && (
          <section className={styles.empty}>
            <p>This temporary preview has expired. Start fresh.</p>
          </section>
        )}
        {state.stage === "cleanup-partial" && (
          <section className={styles.empty}>
            <p role="alert">
              {localMode
                ? "Local deletion could not be confirmed. Keep this tab open and retry cleanup."
                : "Local data is cleared. Service cleanup could not be confirmed."}
            </p>
          </section>
        )}
        {(state.stage === "analysis-failed" ||
          state.stage === "assembly-failed" ||
          state.stage === "cloud-assembly-failed" ||
          state.stage === "render-failed") && (
          <section className={styles.empty}>
            <p role="alert">{state.failure.message}</p>
          </section>
        )}
      </WorkflowFrame>
    </Workspace>
  );
}
