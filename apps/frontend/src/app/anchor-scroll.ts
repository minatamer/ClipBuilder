let activeAnimation: number | undefined;
let restoreScrollBehavior: (() => void) | undefined;

export function scrollToAnchor(href: `#${string}`) {
  const target = document.querySelector(href);

  if (!(target instanceof HTMLElement)) {
    return false;
  }

  if (activeAnimation !== undefined) {
    window.cancelAnimationFrame(activeAnimation);
    restoreScrollBehavior?.();
  }

  const start = window.scrollY;
  const destination = target.getBoundingClientRect().top + start;
  const distance = destination - start;
  const duration = Math.min(900, Math.max(480, Math.abs(distance) * 0.55));
  const startTime = window.performance.now();
  const root = document.documentElement;
  const previousInlineBehavior = root.style.scrollBehavior;

  root.style.scrollBehavior = "auto";
  restoreScrollBehavior = () => {
    root.style.scrollBehavior = previousInlineBehavior;
    restoreScrollBehavior = undefined;
  };

  const drawFrame = (time: number) => {
    const progress = Math.min(1, (time - startTime) / duration);
    const easedProgress = 1 - Math.pow(1 - progress, 4);

    window.scrollTo(0, start + distance * easedProgress);

    if (progress < 1) {
      activeAnimation = window.requestAnimationFrame(drawFrame);
      return;
    }

    activeAnimation = undefined;
    restoreScrollBehavior?.();
  };

  activeAnimation = window.requestAnimationFrame(drawFrame);
  return true;
}
