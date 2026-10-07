import { renderToStaticMarkup } from "react-dom/server";
import { isValidElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { ERROR_CODES, SAFE_ERROR_MESSAGES } from "@clipbuilder/contracts";
import {
  failure as safeFailure,
  reviewState,
} from "../session/session.test-fixtures";
import { initialClippingSessionState } from "../session/session.types";
import { ConnectionFailureNotice, WorkflowRecovery } from "./workflow-recovery";
import { failureMessage } from "./failure-message";

describe("visitor recovery presentation", () => {
  it("never displays supplied technical text, codes or request identifiers", () => {
    for (const code of ERROR_CODES) {
      const failure = {
        ...safeFailure,
        code,
        message: "synthetic-private-stack-sentinel",
      };
      const html = renderToStaticMarkup(
        <ConnectionFailureNotice
          failure={failure}
          busy={false}
          onRetry={() => {}}
          onClear={() => {}}
        />,
      );
      expect(html).not.toContain("synthetic-private-stack-sentinel");
      expect(html).not.toContain(failure.requestId);
      expect(html).not.toContain(code);
      expect(html).toContain("Retry connection");
    }
    expect(failureMessage({ code: "INVALID_MANIFEST" })).not.toContain(
      "manifest",
    );
    expect(failureMessage({ code: "SOURCE_TOO_LARGE" })).toBe(
      SAFE_ERROR_MESSAGES.SOURCE_TOO_LARGE,
    );
  });
  it("preserves recovery actions and disables Clear while work is busy", () => {
    const retry = vi.fn(),
      clear = vi.fn();
    const failure = { ...safeFailure, code: "ACTIVE_SESSION_EXISTS" as const };
    const notice = ConnectionFailureNotice({
      failure,
      busy: true,
      onRetry: retry,
      onClear: clear,
    });
    const html = renderToStaticMarkup(notice);
    expect(html).toContain("Clear existing preview");
    expect(html).toContain('disabled=""');
    const children = notice.props.children;
    for (const child of children) {
      if (
        isValidElement<{ onClick?: () => void; disabled?: boolean }>(child) &&
        !child.props.disabled
      )
        child.props.onClick?.();
    }
    expect(retry).toHaveBeenCalledOnce();
    expect(clear).not.toHaveBeenCalled();
  });
  it("keeps the fatal/expiry/cleanup messages and renders nothing in review", () => {
    const props = { localMode: true, busy: false, onRestoreOutput: vi.fn() };
    const fatal = renderToStaticMarkup(
      <WorkflowRecovery
        {...props}
        state={{
          stage: "fatal",
          failure: { ...safeFailure, code: "ACTIVE_SESSION_EXISTS" },
          diagnosticCode: null,
        }}
      />,
    );
    expect(fatal).toContain(
      "Close the other workspace tab, then reconnect here.",
    );
    const expired = renderToStaticMarkup(
      <WorkflowRecovery
        {...props}
        state={{
          stage: "expired",
          localStatePresent: true,
          diagnosticCode: null,
        }}
      />,
    );
    expect(expired).toContain(
      "This temporary preview has expired. Start fresh.",
    );
    expect(
      renderToStaticMarkup(
        <WorkflowRecovery {...props} state={reviewState()} />,
      ),
    ).toBe("");
    expect(
      renderToStaticMarkup(
        <WorkflowRecovery {...props} state={initialClippingSessionState} />,
      ),
    ).toBe("");
    expect(props.onRestoreOutput).not.toHaveBeenCalled();
  });
});
