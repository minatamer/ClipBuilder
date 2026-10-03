"use client";

import {
  createContext,
  useCallback,
  type Dispatch,
  type ReactNode,
  useContext,
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";

import { SessionEffectRegistry } from "./session.effects";
import {
  clearSessionProjection,
  SESSION_CLEANUP_KEY,
  isSessionCleanupRequired,
  persistSessionState,
  readSessionProjection,
  shouldClearSessionProjectionForState,
  type SessionStoragePort,
} from "./session.persistence";
import {
  reconcileSessionProjection,
  restoreEvidenceUnavailableFailure,
  type ServerSessionEvidence,
} from "./session.reconciliation";
import { clippingSessionReducer } from "./session.reducer";
import {
  initialClippingSessionState,
  type ClippingSessionEvent,
  type ClippingSessionState,
  type SessionAvailability,
} from "./session.types";
import {
  createBrowserWorkspace,
  type BrowserWorkspace,
} from "../media/browser.workspace";
import { restoreLocalWorkspace } from "../media/workspace.restore";
import { localMediaFailure } from "../media/media.errors";

type SessionContextValue = {
  state: ClippingSessionState;
  dispatch: Dispatch<ClippingSessionEvent>;
  effects: SessionEffectRegistry;
  workspace: BrowserWorkspace | null;
  retryRestore(): void;
};

const SessionContext = createContext<SessionContextValue | null>(null);
const systemNow = () => new Date();

export type ClippingSessionProviderProps = {
  children: ReactNode;
  availability: SessionAvailability;
  loadServerEvidence: (
    sessionId: string,
    signal: AbortSignal,
  ) => Promise<ServerSessionEvidence | null>;
  storage?: SessionStoragePort;
  now?: () => Date;
  localMode?: boolean;
};

function browserSessionStorage(): SessionStoragePort | null {
  try {
    return typeof window === "undefined" ? null : window.sessionStorage;
  } catch {
    return null;
  }
}

export function ClippingSessionProvider({
  children,
  availability,
  loadServerEvidence,
  storage,
  now = systemNow,
  localMode = false,
}: ClippingSessionProviderProps) {
  const [state, dispatch] = useReducer(
    clippingSessionReducer,
    initialClippingSessionState,
  );
  const [effects] = useState(() => new SessionEffectRegistry());
  const [workspace, setWorkspace] = useState<BrowserWorkspace | null>(null);
  const disposal = useRef<Promise<void>>(Promise.resolve());
  const [restoreAttempt, setRestoreAttempt] = useState(0);
  const retryRestore = useCallback(() => {
    dispatch({ type: "RETRY_RESTORE" });
    if (localMode) setRestoreAttempt((value) => value + 1);
  }, [localMode]);
  const otherReleased = useEffectEvent(() => {
    if (
      state.stage === "fatal" &&
      state.failure.code === "ACTIVE_SESSION_EXISTS"
    ) {
      dispatch({ type: "RETRY_RESTORE" });
      setRestoreAttempt((value) => value + 1);
    }
  });

  useEffect(() => {
    if (!localMode) return;
    let mounted = true;
    let owner: BrowserWorkspace | null = null;
    const activeStorage = storage ?? browserSessionStorage();
    void disposal.current
      .then(async () => {
        if (!mounted) return;
        if (!activeStorage) throw new Error("local-storage-unavailable");
        owner = createBrowserWorkspace({
          onOtherRelease: () => otherReleased(),
          releaseConsumers: () => effects.clear(),
          cleanupRequired: () => isSessionCleanupRequired(activeStorage),
          markCleanup: () =>
            activeStorage.setItem(SESSION_CLEANUP_KEY, "required"),
          finishCleanup: () => {
            clearSessionProjection(activeStorage);
            activeStorage.removeItem(SESSION_CLEANUP_KEY);
          },
        });
        setWorkspace(owner);
        const record = await owner.initialize();
        if (!mounted) return;
        owner.onExpiry(() => dispatch({ type: "CLEAR" }));
        dispatch(
          record || owner.remoteCleanup
            ? {
                type: "RESTORE_VALID",
                state: restoreLocalWorkspace(record, owner.remoteCleanup),
              }
            : { type: "RESTORE_EMPTY", availability },
        );
      })
      .catch((error) => {
        if (mounted)
          dispatch({
            type: "RESTORE_FATAL",
            failure: localMediaFailure(error),
          });
      });
    return () => {
      mounted = false;
      if (owner) disposal.current = owner.dispose();
    };
  }, [localMode, availability, effects, storage, dispatch, restoreAttempt]);

  useEffect(() => {
    if (!localMode || !workspace) return;
    const check = () => workspace.checkExpiry();
    document.addEventListener("visibilitychange", check);
    window.addEventListener("pageshow", check);
    return () => {
      document.removeEventListener("visibilitychange", check);
      window.removeEventListener("pageshow", check);
    };
  }, [localMode, workspace]);

  useEffect(() => {
    if (localMode || state.stage !== "bootstrapping") return;
    const activeStorage = storage ?? browserSessionStorage();
    if (activeStorage === null) {
      dispatch({ type: "RESTORE_EMPTY", availability });
      return;
    }

    const controller = new AbortController();
    if (isSessionCleanupRequired(activeStorage)) {
      dispatch({
        type: "RESTORE_VALID",
        state: {
          stage: "clearing",
          previousStage: "cleanup-partial",
          cleanup: { status: "requesting" },
          diagnosticCode: null,
        },
      });
      return () => controller.abort();
    }
    const read = readSessionProjection(activeStorage, now());
    if (read.status === "empty") {
      dispatch({ type: "RESTORE_EMPTY", availability });
      return () => controller.abort();
    }
    if (read.status !== "valid") {
      clearSessionProjection(activeStorage);
      dispatch(
        read.status === "expired"
          ? { type: "RESTORE_EXPIRED", localStatePresent: true }
          : { type: "RESTORE_EMPTY", availability },
      );
      return () => controller.abort();
    }

    void loadServerEvidence(
      read.projection.session.sessionId,
      controller.signal,
    ).then(
      (evidence) => {
        if (controller.signal.aborted) return;
        const reconciled = reconcileSessionProjection(
          read.projection,
          evidence,
          now(),
          availability,
        );
        if (reconciled.status === "restored") {
          dispatch({ type: "RESTORE_VALID", state: reconciled.state });
          return;
        }
        clearSessionProjection(activeStorage);
        effects.clear();
        if (reconciled.status === "expired") {
          dispatch({ type: "RESTORE_EXPIRED", localStatePresent: true });
        } else {
          dispatch({ type: "RESTORE_FATAL", failure: reconciled.failure });
        }
      },
      () => {
        if (!controller.signal.aborted) {
          dispatch({
            type: "RESTORE_FATAL",
            failure: restoreEvidenceUnavailableFailure(),
          });
        }
      },
    );
    return () => controller.abort();
  }, [
    availability,
    effects,
    loadServerEvidence,
    now,
    state.stage,
    storage,
    localMode,
  ]);

  // Save cleanup intent before child passive effects can start the clear request.
  useLayoutEffect(() => {
    const activeStorage = storage ?? browserSessionStorage();
    if (activeStorage === null || state.stage === "bootstrapping") return;
    if (
      !localMode ||
      state.stage === "clearing" ||
      state.stage === "cleanup-partial" ||
      state.stage === "intake"
    )
      try {
        persistSessionState(activeStorage, state, now());
      } catch {
        // Local cleanup still has its IDB fence; storage denial cannot skip media release.
      }
    if (shouldClearSessionProjectionForState(state)) effects.clear();
  }, [effects, now, state, storage, localMode]);

  useEffect(
    () => () => {
      effects.clear();
    },
    [effects],
  );

  const value = useMemo<SessionContextValue>(
    () => ({ state, dispatch, effects, workspace, retryRestore }),
    [effects, state, workspace, retryRestore],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useClippingSession(): SessionContextValue {
  const value = useContext(SessionContext);
  if (value === null) {
    throw new Error("ClippingSessionProvider is required.");
  }
  return value;
}

export function useSessionEffects(): SessionEffectRegistry | null {
  return useContext(SessionContext)?.effects ?? null;
}
