import {
  createContext,
  useContext,
  useId,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { ControlTabs } from "./control-tabs";

const InspectorSlots = createContext<
  | {
      inspector: HTMLElement | null;
      collection: HTMLElement | null;
    }
  | undefined
>(undefined);

/** One canonical form: alongside its collection on wide screens, switched in place on narrow screens. */
export function EditorInspectorLayout({
  children,
  label,
  selectionKey,
  paneRequest,
  title,
  context,
  collectionLabel,
}: {
  children: ReactNode;
  label: string;
  selectionKey?: string | undefined;
  paneRequest?: "collection" | "properties" | undefined;
  title: string;
  context?: string;
  collectionLabel: string;
}) {
  const [inspector, setInspector] = useState<HTMLElement | null>(null);
  const [collection, setCollection] = useState<HTMLDivElement | null>(null);
  const [navigation, setNavigation] = useState({
    selectionKey,
    paneRequest,
    view: paneRequest ?? "properties",
  });
  if (
    navigation.selectionKey !== selectionKey ||
    navigation.paneRequest !== paneRequest
  ) {
    setNavigation({
      selectionKey,
      paneRequest,
      view: paneRequest ?? (selectionKey ? "properties" : navigation.view),
    });
  }
  const id = useId();
  return (
    <InspectorSlots value={{ inspector, collection }}>
      <div
        className="editor-inspector-layout"
        data-view={navigation.view}
        data-primary={paneRequest ?? "properties"}
      >
        <header className="editor-workarea-heading">
          <h2>{title}</h2>
          {context && <span className="editor-scope-badge">{context}</span>}
        </header>
        <div className="editor-narrow-navigation">
          <ControlTabs
            id={id}
            label={label}
            items={[
              { value: "collection", label: "Layers" },
              { value: "properties", label: "Properties" },
            ]}
            value={navigation.view}
            onChange={(view) =>
              setNavigation((current) => ({ ...current, view }))
            }
          />
          {context && <span className="editor-scope-badge">{context}</span>}
        </div>
        <div
          className="editor-collection"
          id={`${id}-collection-panel`}
          role="tabpanel"
          aria-labelledby={`${id}-collection`}
        >
          <h3 className="editor-collection-heading">{collectionLabel}</h3>
          <div>{children}</div>
          <div ref={setCollection} />
        </div>
        <aside
          id={`${id}-properties-panel`}
          role="tabpanel"
          aria-labelledby={`${id}-properties`}
          className="editor-context-inspector"
          aria-label={label}
          ref={setInspector}
        />
      </div>
    </InspectorSlots>
  );
}

export function EditorInspector({
  children,
  title,
  disabled = false,
}: {
  children: ReactNode;
  title: string;
  disabled?: boolean;
}) {
  const slots = useContext(InspectorSlots);
  const content = (
    <fieldset disabled={disabled} className="editor-properties">
      <legend className="local-sr-only">{title}</legend>
      {children}
    </fieldset>
  );
  return slots
    ? slots.inspector && createPortal(content, slots.inspector)
    : content;
}

export function EditorCollection({
  children,
  disabled = false,
}: {
  children: ReactNode;
  disabled?: boolean;
}) {
  const slots = useContext(InspectorSlots);
  const content = (
    <fieldset className="editor-collection-detail" disabled={disabled}>
      {children}
    </fieldset>
  );
  return slots
    ? slots.collection && createPortal(content, slots.collection)
    : content;
}
