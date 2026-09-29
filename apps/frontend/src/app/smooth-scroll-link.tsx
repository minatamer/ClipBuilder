"use client";

import type {
  ComponentPropsWithoutRef,
  MouseEvent as ReactMouseEvent,
} from "react";

import { scrollToAnchor } from "./anchor-scroll";

type SmoothScrollLinkProperties = Omit<
  ComponentPropsWithoutRef<"a">,
  "href"
> & {
  href: `#${string}`;
};

export function SmoothScrollLink({
  href,
  onClick,
  ...linkProperties
}: SmoothScrollLinkProperties) {
  const handleClick = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);

    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey
    ) {
      return;
    }

    if (scrollToAnchor(href)) {
      event.preventDefault();
    }
  };

  return <a href={href} onClick={handleClick} {...linkProperties} />;
}
