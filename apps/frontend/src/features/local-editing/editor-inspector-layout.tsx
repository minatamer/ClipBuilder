import {
  createContext,
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { ControlTabs } from "./control-tabs";

const InspectorSlots = createContext<
  | {
      inspector: HTMLElement | null;
      collection: HTMLElement | null;
      registerInspector: () => () => void;
      disclosure: {
        available: boolean;
        expanded: boolean;
        panelId: string;
        setExpanded: (expanded: boolean) => void;
      };
    }
  | undefined
>(undefined);

export function useEditorInspectorDisclosure() {
  return useContext(InspectorSlots)?.disclosure;
}

/** One canonical form: alongside its collection on wide screens, switched in place on narrow screens. */
export function EditorInspectorLayout({
  children,
  label,
  selectionKey,
  title,
  context,
  collectionLabel,
  revealKey = 0,
  collapsible = false,
}: {
  children: ReactNode;
  label: string;
  selectionKey?: string | undefined;
  title: string;
  context?: string;
  collectionLabel: string;
  revealKey?: number;
  collapsible?: boolean;
}) {
  const [inspector, setInspector] = useState<HTMLElement | null>(null);
  const [collection, setCollection] = useState<HTMLDivElement | null>(null);
  const [inspectorCount, setInspectorCount] = useState(0);
  const registerInspector = useCallback(() => {
    setInspectorCount((count) => count + 1);
    return () => setInspectorCount((count) => count - 1);
  }, []);
  const [navigation, setNavigation] = useState<{
    selectionKey: string | undefined;
    view: "collection" | "properties";
    expanded: boolean;
    revealKey: number;
  }>({
    selectionKey,
    view: "properties",
    expanded: true,
    revealKey,
  });
  if (
    navigation.selectionKey !== selectionKey ||
    navigation.revealKey !== revealKey
  ) {
    setNavigation({
      selectionKey,
      view:
        selectionKey || navigation.revealKey !== revealKey
          ? "properties"
          : navigation.view,
      expanded: true,
      revealKey,
    });
  }
  const setExpanded = useCallback((expanded: boolean) => {
    setNavigation((current) => ({
      ...current,
      expanded,
      view: expanded ? "properties" : "collection",
    }));
  }, []);
  const id = useId();
  return (
    <InspectorSlots
      value={{
        inspector,
        collection,
        registerInspector,
        disclosure: {
          available: inspectorCount > 0,
          expanded: navigation.expanded,
          panelId: `${id}-properties-panel`,
          setExpanded,
        },
      }}
    >
      <div className="editor-inspector-layout" data-view={navigation.view}>
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
            onChange={(view) => {
              if (collapsible) setExpanded(view === "properties");
              else setNavigation((current) => ({ ...current, view }));
            }}
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
          hidden={!navigation.expanded}
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
  const register = slots?.registerInspector;
  useLayoutEffect(() => register?.(), [register]);
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

/** Collection suggestions/actions only; editable forms use EditorInspector. */
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
