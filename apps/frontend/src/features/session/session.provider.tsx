"use client";

import {
  createContext,
  type Dispatch,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";

import { SessionEffectRegistry } from "./session.effects";
import {
  clearSessionProjection,
  projectSessionState,
  readSessionProjection,
  shouldClearSessionProjectionForState,
  type SessionStoragePort,
  writeSessionProjection,
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

type SessionContextValue = {
  state: ClippingSessionState;
  dispatch: Dispatch<ClippingSessionEvent>;
  effects: SessionEffectRegistry;
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
};

function browserSessionStorage(): SessionStoragePort | null {
  return typeof window === "undefined" ? null : window.sessionStorage;
}

export function ClippingSessionProvider({
  children,
  availability,
  loadServerEvidence,
  storage,
  now = systemNow,
}: ClippingSessionProviderProps) {
  const [state, dispatch] = useReducer(
    clippingSessionReducer,
    initialClippingSessionState,
  );
  const [effects] = useState(() => new SessionEffectRegistry());

  useEffect(() => {
    if (state.stage !== "bootstrapping") return;
    const activeStorage = storage ?? browserSessionStorage();
    if (activeStorage === null) {
      dispatch({ type: "RESTORE_EMPTY", availability });
      return;
    }

    const controller = new AbortController();
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
  }, [availability, effects, loadServerEvidence, now, state.stage, storage]);

  useEffect(() => {
    const activeStorage = storage ?? browserSessionStorage();
    if (activeStorage === null || state.stage === "bootstrapping") return;
    if (shouldClearSessionProjectionForState(state)) {
      clearSessionProjection(activeStorage);
      effects.clear();
      return;
    }
    if (state.stage === "fatal") return;
    const projection = projectSessionState(state, now());
    if (projection === null) {
      clearSessionProjection(activeStorage);
    } else {
      writeSessionProjection(activeStorage, projection);
    }
  }, [effects, now, state, storage]);

  useEffect(
    () => () => {
      effects.clear();
    },
    [effects],
  );

  const value = useMemo<SessionContextValue>(
    () => ({ state, dispatch, effects }),
    [effects, state],
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
