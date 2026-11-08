import {
  useCallback,
  useEffect,
  useEffectEvent,
  useId,
  useRef,
  useState,
} from "react";
import { CircleHelp, X } from "lucide-react";
import { Button, IconButton } from "../../shared/ui/button";
import { motionDurationMs } from "../sample/use-moment-layout";
import {
  EDITOR_TOUR_STEPS,
  EDITOR_TOUR_WELCOME,
  type EditorTourStep,
} from "./editor-sections";
import {
  createTourMeasurement,
  editorTourNavigation,
  tourBoxUnion,
} from "./editor-tour-anchor";
import {
  editorTourLayout,
  editorTourMasks,
  type TourBox,
  type TourViewport,
} from "./editor-tour-layout";
import {
  editorTourSeen,
  editorTourStorage,
  rememberEditorTour,
} from "./editor-tour-preference";
import styles from "./editor-tour.module.css";

const viewport = (): TourViewport => ({
  left: window.visualViewport?.offsetLeft ?? 0,
  top: window.visualViewport?.offsetTop ?? 0,
  width: window.visualViewport?.width ?? document.documentElement.clientWidth,
  height: window.visualViewport?.height ?? window.innerHeight,
});
const typing = () =>
  document.activeElement?.matches("input,textarea,[contenteditable=true]");
type Anchor = {
  target: string;
  box: TourBox | null;
  navigation: TourBox | null;
  view: TourViewport;
};
type Phase = "preparing" | "entering" | "shown" | "leaving" | "closing";
const sameBox = (a: TourBox, b: TourBox) =>
  (["left", "top", "width", "height"] as const).every(
    (key) => Math.abs(a[key] - b[key]) < 0.5,
  );

/** One native modal and one card renderer serve every editor section. */
export function EditorTour({
  ready,
  footerTarget,
  onNavigate,
  onStart,
}: {
  ready: boolean;
  footerTarget?: HTMLElement | null | undefined;
  onNavigate: (step: EditorTourStep) => void;
  onStart: () => () => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const card = useRef<HTMLElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const restore = useRef<(() => void) | null>(null);
  const finishing = useRef(true);
  const closing = useRef(false);
  const scrolls = useRef(new Map<HTMLElement, { top: number; left: number }>());
  const focusFrame = useRef(0);
  const revealFrame = useRef(0);
  const fadeTimer = useRef(0);
  const fadeFrame = useRef(0);
  const phase = useRef<Phase>("preparing");
  const [motion, setMotion] = useState<Phase>("preparing");
  const [presented, setPresented] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [active, setActive] = useState(false);
  const [index, setIndex] = useState(0);
  const [welcome, setWelcome] = useState(true);
  const [steps, setSteps] = useState(EDITOR_TOUR_STEPS);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const id = useId();
  const step = welcome ? EDITOR_TOUR_WELCOME : steps[index]!;

  const changePhase = useCallback((value: Phase) => {
    phase.current = value;
    setMotion(value);
  }, []);
  const afterFade = useCallback((callback: () => void) => {
    window.clearTimeout(fadeTimer.current);
    cancelAnimationFrame(fadeFrame.current);
    const duration = motionDurationMs(
      getComputedStyle(
        dialog.current ?? document.documentElement,
      ).getPropertyValue("--cb-motion-hover"),
    );
    // Start the clock after React commits and the browser paints the fade.
    fadeFrame.current = requestAnimationFrame(() => {
      fadeFrame.current = requestAnimationFrame(() => {
        fadeTimer.current = window.setTimeout(callback, duration);
      });
    });
  }, []);

  function target(item: EditorTourStep): HTMLElement | null {
    const editor = root.current?.closest(".clip-editor");
    if (item.target === "clips")
      return (
        editor
          ?.closest(".batch-section")
          ?.querySelector('.clip-list [aria-selected="true"]') ?? null
      );
    if (item.target === "actions")
      return footerTarget ?? editor?.querySelector(".editor-actions") ?? null;
    if (item.target === "audio")
      return (
        editor
          ?.querySelector(".audio-inspector")
          ?.closest<HTMLElement>('[data-editor-panel="pictures"]') ?? null
      );
    const selector =
      item.target === "preview"
        ? ".editor-preview"
        : item.target === "settings"
          ? ".editor-tabs"
          : `[data-editor-panel="${item.target}"]`;
    return editor?.querySelector<HTMLElement>(selector) ?? null;
  }
  function saveScroll(node: HTMLElement | null) {
    for (let parent = node; parent; parent = parent.parentElement) {
      if (!scrolls.current.has(parent))
        scrolls.current.set(parent, {
          top: parent.scrollTop,
          left: parent.scrollLeft,
        });
    }
  }
  function begin(trigger?: HTMLElement) {
    if (
      !ready ||
      active ||
      (!trigger && typing()) ||
      document.hidden ||
      document.querySelector("dialog[open]")
    )
      return;
    opener.current =
      trigger ??
      (document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null);
    saveScroll(root.current);
    for (const node of root.current
      ?.closest(".clip-editor")
      ?.querySelectorAll<HTMLElement>(
        '[role="tabpanel"]:not([hidden]),.editor-timeline,.focus-left-column,.focus-inspector',
      ) ?? []) {
      if (node.getClientRects().length) saveScroll(node);
    }
    cancelAnimationFrame(focusFrame.current);
    finishing.current = false;
    closing.current = false;
    restore.current = onStart();
    setSteps(
      EDITOR_TOUR_STEPS.filter((item) => !item.optional || target(item)),
    );
    setIndex(0);
    setWelcome(true);
    setAnchor(null);
    changePhase("preparing");
    setPresented(false);
    setRevealed(false);
    setActive(true);
  }
  const restoreView = useCallback((after?: () => void) => {
    const restoreControls = restore.current;
    restore.current = null;
    restoreControls?.();
    const savedScrolls = [...scrolls.current];
    scrolls.current.clear();
    cancelAnimationFrame(focusFrame.current);
    focusFrame.current = requestAnimationFrame(() => {
      for (const [node, position] of savedScrolls) {
        if (node.isConnected) {
          node.scrollTop = position.top;
          node.scrollLeft = position.left;
        }
      }
      after?.();
    });
  }, []);
  const finish = useCallback(() => {
    if (finishing.current) return;
    finishing.current = true;
    window.clearTimeout(fadeTimer.current);
    cancelAnimationFrame(fadeFrame.current);
    cancelAnimationFrame(revealFrame.current);
    dialog.current?.close();
    setActive(false);
    setAnchor(null);
    restoreView(() => {
      const previous = opener.current;
      (previous?.isConnected
        ? previous
        : root.current?.querySelector("button")
      )?.focus({ preventScroll: true });
    });
  }, [restoreView]);
  const automaticStart = useEffectEvent(() => {
    if (!editorTourSeen(editorTourStorage())) begin();
  });
  const navigate = useEffectEvent(onNavigate);
  const findTarget = useEffectEvent(target);
  function dismiss() {
    rememberEditorTour(editorTourStorage());
    if (finishing.current || closing.current) return;
    closing.current = true;
    cancelAnimationFrame(revealFrame.current);
    changePhase("leaving");
    setRevealed(false);
    afterFade(() => {
      changePhase("closing");
      restoreView(() => {
        setPresented(false);
        afterFade(finish);
      });
    });
  }
  function requestStep(next: number) {
    if (phase.current !== "shown") return;
    changePhase("leaving");
    setRevealed(false);
    afterFade(() => {
      changePhase("preparing");
      setWelcome(false);
      setIndex(next);
    });
  }

  useEffect(() => {
    if (!ready || active || editorTourSeen(editorTourStorage())) return;
    let timer = 0;
    const queue = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(automaticStart, 400);
    };
    queue();
    document.addEventListener("focusout", queue);
    document.addEventListener("visibilitychange", queue);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("focusout", queue);
      document.removeEventListener("visibilitychange", queue);
    };
  }, [ready, active]);
  useEffect(() => {
    const node = dialog.current;
    if (!active || !ready) {
      node?.close();
      return;
    }
    node?.showModal();
    return () => {
      node?.close();
    };
  }, [active, ready]);
  useEffect(() => {
    if (!active) return;
    navigate(step);
    const visibleBox = createTourMeasurement();
    let frame = 0,
      last: Anchor | null = null,
      stableSince = performance.now();
    let scrolled: HTMLElement | null = null;
    let scrolledView: TourViewport | null = null;
    let published = false;
    const began = performance.now();
    const measure = (now: number) => {
      if (phase.current === "leaving" || phase.current === "closing") {
        frame = requestAnimationFrame(measure);
        return;
      }
      const node = findTarget(step),
        view = viewport();
      const controls = node ? visibleBox(node, view) : null;
      const tabs = node && step.section ? editorTourNavigation(node) : [];
      const navigation = tabs[0] ? visibleBox(tabs[0], view) : null;
      const tabBoxes = tabs.flatMap((tab) => {
        const box = visibleBox(tab, view);
        return box ? [box] : [];
      });
      // A missing control remains a missing target, even when its tab exists.
      const box = controls ? tourBoxUnion([controls, ...tabBoxes]) : null;
      const raw = node?.getBoundingClientRect();
      if (
        node &&
        raw &&
        (node !== scrolled || !scrolledView || !sameBox(view, scrolledView))
      ) {
        scrolled = node;
        scrolledView = view;
        saveScroll(node);
        for (const tab of tabs) {
          saveScroll(tab);
          tab.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "center",
          });
        }
        const placed = editorTourLayout(box, view, 320, navigation);
        const cramped =
          controls &&
          raw.height < view.height * 0.4 &&
          (!placed.spotlight ||
            placed.spotlight.height < controls.height - 0.5);
        if (
          !controls ||
          cramped ||
          (raw.height < view.height * 0.4 && controls.height < raw.height - 0.5)
        )
          node.scrollIntoView({
            behavior: "smooth",
            block: cramped ? "start" : "center",
            inline: "nearest",
          });
      }
      const current = { target: step.target, box, navigation, view };
      const unchanged =
        last &&
        ((!box && !last.box) || (box && last.box && sameBox(box, last.box))) &&
        ((!navigation && !last.navigation) ||
          (navigation &&
            last.navigation &&
            sameBox(navigation, last.navigation))) &&
        sameBox(view, last.view);
      if (!unchanged) {
        stableSince = now;
        last = current;
        if (published && phase.current === "preparing") {
          setAnchor(null);
          published = false;
        }
        if (
          published &&
          (phase.current === "shown" || phase.current === "entering")
        ) {
          changePhase("leaving");
          setRevealed(false);
          afterFade(() => {
            setAnchor(null);
            changePhase("preparing");
          });
          published = false;
        }
      }
      const visible =
        step.target === "welcome" ||
        (box &&
          box.left < view.left + view.width &&
          box.top < view.top + view.height &&
          box.left + box.width > view.left &&
          box.top + box.height > view.top);
      if (
        !published &&
        phase.current === "preparing" &&
        ((visible && now - stableSince >= 60) ||
          (!visible && now - began > 2000))
      ) {
        const settled = {
          target: step.target,
          box: visible ? box : null,
          navigation,
          view,
        };
        setAnchor(settled);
        published = true;
        rememberEditorTour(editorTourStorage());
      }
      frame = requestAnimationFrame(measure);
    };
    frame = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(frame);
  }, [active, index, step, afterFade, changePhase]);
  useEffect(() => {
    if (!active || anchor?.target !== step.target || motion !== "preparing")
      return;
    // Commit the invisible destination before starting its opacity transition.
    revealFrame.current = requestAnimationFrame(() => {
      revealFrame.current = requestAnimationFrame(() => {
        setPresented(true);
        setRevealed(true);
        changePhase("entering");
        afterFade(() => {
          changePhase("shown");
          card.current?.focus({ preventScroll: true });
        });
      });
    });
    return () => cancelAnimationFrame(revealFrame.current);
  }, [active, anchor, step, motion, afterFade, changePhase]);
  useEffect(
    () => () => {
      cancelAnimationFrame(focusFrame.current);
      cancelAnimationFrame(revealFrame.current);
      window.clearTimeout(fadeTimer.current);
      cancelAnimationFrame(fadeFrame.current);
    },
    [],
  );

  const settled = anchor?.target === step.target && motion === "shown";
  const layout = active
    ? editorTourLayout(
        anchor?.box ?? null,
        anchor?.view ?? viewport(),
        320,
        anchor?.navigation,
      )
    : null;
  const view = anchor?.view ?? (active ? viewport() : null);
  const cardLayout =
    welcome && layout && view
      ? {
          ...layout.card,
          left: view.left + view.width / 2,
          top: view.top + view.height / 2,
          transform: "translate(-50%, -50%)",
        }
      : layout?.card;
  return (
    <div ref={root} className={styles.trigger}>
      <IconButton
        icon={CircleHelp}
        label="Replay editor tour"
        disabled={!ready}
        onClick={(event) => begin(event.currentTarget)}
      />
      <dialog
        ref={dialog}
        className={styles.layer}
        aria-label="Editor tour"
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-description`}
        onKeyDown={(event) => {
          if (
            event.key !== "Tab" ||
            event.ctrlKey ||
            event.altKey ||
            event.metaKey
          )
            return;
          const buttons = [
            ...event.currentTarget.querySelectorAll<HTMLButtonElement>(
              "button:not(:disabled)",
            ),
          ];
          const first = buttons[0],
            last = buttons.at(-1),
            focused = document.activeElement;
          if (
            !event.currentTarget.contains(focused) ||
            (event.shiftKey &&
              (focused === first || focused === card.current)) ||
            (!event.shiftKey && focused === last)
          ) {
            event.preventDefault();
            (event.shiftKey ? last : first)?.focus({ preventScroll: true });
          }
        }}
        onCancel={(event) => {
          event.preventDefault();
          dismiss();
        }}
        onClose={() => {
          if (!dialog.current?.open) finish();
        }}
      >
        {active && (
          <div
            className={styles.presentation}
            data-presented={presented}
            data-revealed={revealed}
            data-editor-tour-phase={motion}
          >
            {editorTourMasks(
              layout?.spotlight ?? null,
              anchor?.view ?? viewport(),
            ).map((mask, part) => (
              <div
                key={part}
                className={styles.scrim}
                style={mask}
                aria-hidden="true"
              />
            ))}
            {layout?.spotlight && (
              <>
                <div
                  className={`${styles.scrim} ${styles.cover}`}
                  style={layout.spotlight}
                  aria-hidden="true"
                  data-editor-tour-cover=""
                />
                <div
                  className={styles.highlight}
                  style={layout.spotlight}
                  aria-hidden="true"
                  data-editor-tour-highlight=""
                  data-editor-tour-spotlight={settled ? step.target : undefined}
                />
              </>
            )}
            {layout && (
              <article
                ref={card}
                className={styles.card}
                style={cardLayout}
                tabIndex={-1}
                data-editor-tour-step={settled ? step.target : undefined}
                aria-busy={!settled}
              >
                <header>
                  <span>
                    {welcome
                      ? "EDITOR TOUR"
                      : `EDITOR TOUR · ${index + 1} OF ${steps.length}`}
                  </span>
                  <IconButton
                    icon={X}
                    label="Close editor tour"
                    onClick={dismiss}
                  />
                </header>
                {!welcome && (
                  <div className={styles.progress} aria-hidden="true">
                    {steps.map((item, position) => (
                      <span
                        key={item.target}
                        data-current={position <= index}
                      />
                    ))}
                  </div>
                )}
                <div
                  className={styles.copy}
                  tabIndex={0}
                  role="region"
                  aria-label="Tour details"
                >
                  <h2 id={`${id}-title`}>{step.title}</h2>
                  <p id={`${id}-description`}>{step.text}</p>
                  {!welcome && settled && !layout.spotlight && (
                    <p className={styles.unavailable}>
                      This control is outside the current view. You can continue
                      or close the tour.
                    </p>
                  )}
                </div>
                <footer>
                  <Button variant="quiet" onClick={dismiss}>
                    {welcome ? "Skip" : "Skip tour"}
                  </Button>
                  {!welcome && (
                    <Button
                      variant="secondary"
                      disabled={index === 0 || !settled}
                      onClick={() => requestStep(index - 1)}
                    >
                      Back
                    </Button>
                  )}
                  <Button
                    disabled={!settled}
                    onClick={() =>
                      welcome
                        ? requestStep(0)
                        : index + 1 === steps.length
                          ? dismiss()
                          : requestStep(index + 1)
                    }
                  >
                    {welcome
                      ? "Start tour"
                      : index + 1 === steps.length
                        ? "Done"
                        : "Next"}
                  </Button>
                </footer>
              </article>
            )}
          </div>
        )}
      </dialog>
    </div>
  );
}
