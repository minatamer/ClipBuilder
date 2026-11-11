import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { IllustratedConversation } from "../src/features/product-film/illustrated-conversation.tsx";

/** Authoring-only still from the same original artwork as the live landing. */
export function marketingConversationMarkup() {
  return renderToStaticMarkup(
    createElement(IllustratedConversation, { frame: 42, showLabel: false }),
  ).replace('width="100%" height="100%"', 'width="1280" height="720"');
}
