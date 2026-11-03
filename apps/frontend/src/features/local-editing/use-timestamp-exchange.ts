import { useEffect, useRef, useSyncExternalStore } from "react";
import { localTimestampExchangeAllowed } from "../../../../../packages/contracts/local/timestamp-exchange.ts";

const query = "(min-width: 64rem) and (pointer: fine)";
const subscribe = (update: () => void) => {
  const media = matchMedia(query);
  media.addEventListener("change", update);
  return () => media.removeEventListener("change", update);
};
const snapshot = () =>
  localTimestampExchangeAllowed(
    true,
    matchMedia(query).matches,
    navigator.userAgent,
  );
const serverSnapshot = () => false;

export function useTimestampExchange(local: boolean) {
  const desktop = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const reader = useRef<FileReader | null>(null);
  const url = useRef<string | null>(null);
  useEffect(
    () => () => {
      if (reader.current) {
        reader.current.onload = null;
        reader.current.onerror = null;
        reader.current.onabort = null;
        reader.current.abort();
      }
      if (url.current) URL.revokeObjectURL(url.current);
    },
    [],
  );
  return { enabled: local && desktop, reader, url };
}
