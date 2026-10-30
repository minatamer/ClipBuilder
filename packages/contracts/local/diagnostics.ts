import { z } from "zod";
import { requestIdSchema } from "../src/ids.schema.ts";
import { ownerIdSchema } from "./policy.ts";
import { ownerMediaJobSchema } from "./index.ts";

// Fixed code-owned reasons only. Never serialize an arbitrary message or cause.
export const ownerDiagnosticReasonSchema = z.enum([
  "invalid_audio_asset",
  "audio_output_exists",
  "audio_unavailable",
  "acquisition_bytes_invalid",
  "acquisition_component_invalid",
  "acquisition_config_invalid",
  "acquisition_dns_unavailable",
  "acquisition_egress_denied",
  "acquisition_egress_unavailable",
  "acquisition_metadata_invalid",
  "acquisition_output_exists",
  "acquisition_process_failed",
  "acquisition_progress_invalid",
  "acquisition_selection_changed",
  "acquisition_source_invalid",
  "acquisition_stale_format",
  "acquisition_streams_invalid",
  "acquisition_tools_unavailable",
  "acquisition_transfer_incomplete",
  "acquisition_unavailable",
  "analysis_mode_mismatch",
  "analysis_unavailable",
  "bundle_missing",
  "canceled",
  "codex_unavailable",
  "codex_login_required",
  "codex_subscription_required",
  "codex_input_invalid",
  "codex_output_exists",
  "codex_response_invalid",
  "codex_process_failed",
  "codex_limit",
  "local_speech_unavailable",
  "capacity",
  "clip_capacity",
  "clip_limit",
  "clip_unavailable",
  "disk_unavailable",
  "draft_canceled",
  "draft_document_invalid",
  "draft_document_large",
  "draft_file_changed",
  "draft_file_conflict",
  "draft_file_damaged",
  "draft_file_invalid",
  "draft_limit",
  "draft_output_changed",
  "draft_reference_mismatch",
  "draft_source_changed",
  "draft_unavailable",
  "duplicate_clip",
  "invalid",
  "invalid_asset",
  "invalid_clip_output",
  "invalid_cut",
  "invalid_frame_count",
  "invalid_media_result",
  "invalid_output",
  "invalid_output_path",
  "invalid_overlay_cleanup",
  "invalid_owner_picture",
  "invalid_owner_transcript",
  "invalid_path",
  "invalid_picture",
  "invalid_picture_provenance",
  "invalid_plan_clock",
  "invalid_port",
  "invalid_provider_clock",
  "invalid_provider_frames",
  "invalid_provider_media",
  "invalid_source",
  "invalid_video_clock",
  "json_required",
  "json_too_large",
  "local_backend_port_required",
  "local_cleanup_path_invalid",
  "local_cleanup_requires_recovery",
  "local_process_identity_missing",
  "local_runtime_record_unavailable",
  "local_worker_identity_missing",
  "local_worker_port_in_use",
  "local_worker_unavailable",
  "media_failed",
  "media_timeout",
  "media_unavailable",
  "missing_visual",
  "visual_plan_shortfall",
  "visual_lookup_no_match",
  "visual_lookup_failed",
  "visual_coverage_shortfall",
  "moment_missing",
  "operation_conflict",
  "operation_limit",
  "output_limit",
  "overlay_bundle_invalid",
  "overlay_capacity",
  "overlay_listener_invalid",
  "owner_agent_canceled",
  "owner_agent_conflict",
  "owner_agent_invalid_command",
  "owner_agent_operation_failed",
  "owner_agent_picture_unavailable",
  "owner_agent_target_unavailable",
  "owner_agent_unavailable",
  "owner_fake_mode_required",
  "owner_picture_digest_rejected",
  "owner_picture_not_admitted",
  "owner_picture_provenance_rejected",
  "owner_plan_rejected",
  "owner_provider_busy",
  "owner_provider_cleanup_pending",
  "owner_provider_configuration_rejected",
  "owner_provider_input_rejected",
  "owner_provider_unavailable",
  "owner_selection_policy_rejected",
  "owner_state_missing",
  "owner_storage_in_repository",
  "owner_storage_unavailable",
  "owner_youtube_audio_selection_required",
  "owner_youtube_format_unsupported",
  "owner_youtube_metadata_invalid",
  "owner_youtube_selection_stale",
  "owner_youtube_url_invalid",
  "picture_capacity",
  "picture_unavailable",
  "provider_input_rejected",
  "saved_draft_missing",
  "source_capacity",
  "source_inspection_invalid",
  "source_invalid",
  "source_locate_unavailable",
  "source_metadata_invalid",
  "source_metadata_unavailable",
  "source_operation_busy",
  "source_saved_unavailable",
  "source_selection_stale",
  "source_storage_unavailable",
  "source_thumbnail_unavailable",
  "stale_analysis",
  "stale_clip_source",
  "stale_edit_revision",
  "stale_or_busy_clip",
  "stale_or_invalid_cut",
  "stale_saved_clip",
  "stale_saved_edit",
  "stale_source",
  "stale_source_revision",
  "synthetic_acquisition_profile_unavailable",
  "timeout",
  "native_spawn_failed",
  "native_stdout_limit",
  "native_disk_full",
  "native_permission_denied",
  "native_stream_missing",
  "native_encoder_unavailable",
  "native_decoder_unavailable",
  "native_filter_unavailable",
  "native_input_invalid",
  "native_memory_exhausted",
  "gemini_quality_critique",
  "gemini_output_unusable",
  "gemini_clock_converted",
  "gemini_evidence_critique",
  "gemini_candidate_critique",
  "provider_budget_exhausted",
  "native_budget_exhausted",
  "delivery_budget_exhausted",
  "upload_incomplete",
  "upload_chunk_invalid",
  "unclassified",
  "workspace_busy",
  "workspace_closed",
  "workspace_missing",
]);
export const ownerDiagnosticOperationSchema = z.enum([
  ...ownerMediaJobSchema.options.map((item) => item.shape.operation.value),
  "http_request",
  "http_read",
  "find_moments",
  "transcribe",
  "transcript_validate",
  "candidate_select",
  "candidate_validate",
  "provider_input",
  "provider_input_read",
  "provider_input_cleanup",
  "provider_cleanup",
  "clip_build",
  "clip_prepare",
  "visual_plan",
  "focus_plan",
  "focus_compile",
  "focus_edit",
  "focus_export",
  "visual_validate",
  "image_generate",
  "image_validate",
  "output_validate",
  "draft_save",
  "stream",
  "acquisition",
  "cleanup",
  "startup",
  "worker_port",
  "native_tools",
  "acquisition_tools",
  "worker_files",
  "storage",
  "worker_spawn",
  "worker_identity",
  "worker_ready",
  "discovery",
  "worker_exit",
  "worker_request",
]);
export type OwnerDiagnosticOperation = z.infer<
  typeof ownerDiagnosticOperationSchema
>;
const systemCodeSchema = z.enum([
  "ENOENT",
  "EACCES",
  "EPERM",
  "ENOSPC",
  "EMFILE",
  "EIO",
  "EPIPE",
  "EADDRINUSE",
  "ENOTFOUND",
  "ECONNRESET",
  "ECONNREFUSED",
  "ETIMEDOUT",
  "ABORT_ERR",
  "UND_ERR_CONNECT_TIMEOUT",
  "UND_ERR_HEADERS_TIMEOUT",
  "UND_ERR_SOCKET",
  "ERR_CHILD_PROCESS_STDIO_MAXBUFFER",
]);
export const ownerDiagnosticErrorSchema = z
  .object({
    reason: ownerDiagnosticReasonSchema,
    causes: z.array(ownerDiagnosticReasonSchema).max(3).optional(),
    errorClass: z.enum([
      "Error",
      "TypeError",
      "SyntaxError",
      "ZodError",
      "AbortError",
      "TimeoutError",
    ]),
    systemCode: systemCodeSchema.optional(),
    exitCode: z.number().int().min(-2147483648).max(2147483647).optional(),
    signal: z
      .enum(["SIGINT", "SIGTERM", "SIGKILL", "SIGABRT", "SIGSEGV"])
      .optional(),
    issueCount: z.number().int().min(0).max(1000000).optional(),
  })
  .strict();
export type OwnerDiagnosticError = z.infer<typeof ownerDiagnosticErrorSchema>;
export const ownerTranscriptTimingDiagnosticSchema = z
  .object({
    returnedWords: z.number().int().min(0).max(1000000),
    acceptedWords: z.number().int().min(0).max(1000000),
    nonpositiveWords: z.number().int().min(0).max(1000000),
    outsideMediaWords: z.number().int().min(0).max(1000000),
    reorderedWords: z.number().int().min(0).max(1000000),
    outOfOrderWords: z.number().int().min(0).max(1000000).optional(),
  })
  .strict();
export type OwnerTranscriptTimingDiagnostic = z.infer<
  typeof ownerTranscriptTimingDiagnosticSchema
>;
export const ownerFocusDiagnosticSchema = z
  .object({
    returnedPeople: z.number().int().min(0).max(1000000).optional(),
    returnedDecisions: z.number().int().min(0).max(1000000).optional(),
    people: z.number().int().min(0).max(8),
    observations: z.number().int().min(0).max(120),
    decisions: z.number().int().min(0).max(120),
    shots: z.number().int().min(1).max(60),
    switches: z.number().int().min(0).max(120).optional(),
    held: z.number().int().min(0).max(120).optional(),
    fallback: z.number().int().min(0).max(120).optional(),
    rejected: z.number().int().min(0).max(1000).optional(),
    converted: z.number().int().min(0).max(1000).optional(),
  })
  .strict();
export type OwnerFocusDiagnostic = z.infer<typeof ownerFocusDiagnosticSchema>;
export function describeOwnerDiagnosticError(
  error: unknown,
): OwnerDiagnosticError {
  const result: OwnerDiagnosticError = {
    reason: "unclassified",
    errorClass: "Error",
  };
  let cause = error;
  for (
    let depth = 0;
    depth < 4 && (cause instanceof Error || cause instanceof z.ZodError);
    depth++
  ) {
    const reason = ownerDiagnosticReasonSchema.safeParse(cause.message);
    if (result.reason === "unclassified" && reason.success)
      result.reason = reason.data;
    else if (depth > 0 && reason.success && reason.data !== result.reason) {
      result.causes ??= [];
      if (!result.causes.includes(reason.data)) result.causes.push(reason.data);
    }
    const name = ownerDiagnosticErrorSchema.shape.errorClass.safeParse(
      cause.name,
    );
    if (depth === 0 && name.success) result.errorClass = name.data;
    if (cause instanceof z.ZodError)
      result.issueCount = Math.min(1000000, cause.issues.length);
    if ("code" in cause) {
      const system = systemCodeSchema.safeParse(cause.code);
      if (system.success) result.systemCode = system.data;
      const exit = ownerDiagnosticErrorSchema.shape.exitCode.safeParse(
        cause.code,
      );
      if (exit.success && exit.data !== undefined) result.exitCode = exit.data;
    }
    if ("signal" in cause) {
      const signal = ownerDiagnosticErrorSchema.shape.signal.safeParse(
        cause.signal,
      );
      if (signal.success && signal.data !== undefined)
        result.signal = signal.data;
    }
    cause = cause.cause;
  }
  return result;
}
export const ownerDiagnosticRecordSchema = z
  .object({
    event: z.literal("local_diagnostic"),
    service: z.enum(["backend", "worker"]),
    at: z.iso.datetime(),
    requestId: requestIdSchema.optional(),
    parentRequestId: requestIdSchema.optional(),
    jobId: ownerIdSchema.optional(),
    operation: ownerDiagnosticOperationSchema,
    outcome: z.enum(["started", "succeeded", "failed", "canceled", "critique"]),
    elapsedMs: z.number().int().min(0).max(86400000),
    httpStatus: z.number().int().min(100).max(599).optional(),
    error: ownerDiagnosticErrorSchema.optional(),
    transcriptTiming: ownerTranscriptTimingDiagnosticSchema.optional(),
    focus: ownerFocusDiagnosticSchema.optional(),
    droppedRecords: z.number().int().min(0).max(1000000).optional(),
  })
  .strict();
