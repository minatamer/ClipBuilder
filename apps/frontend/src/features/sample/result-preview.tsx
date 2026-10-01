"use client";

import { useEffect, useState } from "react";
import type {
  AnalysisBundleV1,
  AssemblyBundleV1,
} from "@clipbuilder/contracts";
import type { ClippingSessionState } from "../session/session.types";
import { Button } from "../../shared/ui/button";
import { Progress } from "../../shared/ui/progress";
import { ClipReview } from "./clip.review";
import type { SampleApi } from "./sample.api";
import styles from "./sample.module.css";

type ResultSummary = Extract<
  ClippingSessionState,
  { stage: "result" }
>["clipSummary"];

export function resultBundlesMatch(
  summary: ResultSummary,
  analysis: AnalysisBundleV1,
  assembly: AssemblyBundleV1,
) {
  return (
    analysis.analysisId === summary.analysisId &&
    analysis.revision === summary.analysisRevision &&
    assembly.assemblyId === summary.assemblyId &&
    assembly.revision === summary.assemblyRevision &&
    assembly.analysisRevision === analysis.revision &&
    assembly.manifestId === summary.manifestId &&
    assembly.manifestHash === summary.manifestHash &&
    assembly.compositionManifest.baseCandidateId ===
      summary.selectedCandidateId &&
    assembly.selectedStartWordId === summary.selectedStartWordId &&
    assembly.selectedEndWordId === summary.selectedEndWordId &&
    analysis.candidates.some(
      (item) =>
        item.id === summary.selectedCandidateId &&
        item.startWordId === summary.selectedStartWordId &&
        item.endWordId === summary.selectedEndWordId,
    )
  );
}

export function ResultPreview({
  summary,
  api,
}: {
  summary: ResultSummary;
  api: SampleApi;
}) {
  const [bundles, setBundles] = useState<{
    analysis: AnalysisBundleV1;
    assembly: AssemblyBundleV1;
  } | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      const analysis = await api.analysis(
        summary.analysisId,
        controller.signal,
      );
      const assembly = await api.assembly(
        summary.assemblyId,
        controller.signal,
      );
      if (!resultBundlesMatch(summary, analysis, assembly))
        throw new Error("Preview evidence is unavailable.");
      if (!controller.signal.aborted) {
        setBundles({ analysis, assembly });
        setFailed(false);
      }
    })().catch(() => {
      if (!controller.signal.aborted) setFailed(true);
    });
    return () => controller.abort();
  }, [api, summary, attempt]);
  if (bundles) return <ClipReview {...bundles} presentation="export" />;
  return (
    <section className={styles.processing}>
      {failed ? (
        <>
          <p role="alert">The clip preview could not be restored.</p>
          <Button
            onClick={() => {
              setFailed(false);
              setAttempt((value) => value + 1);
            }}
          >
            Retry connection
          </Button>
        </>
      ) : (
        <Progress label="Loading your clip" />
      )}
    </section>
  );
}
