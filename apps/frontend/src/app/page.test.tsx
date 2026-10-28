import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import HomePage from "./page";
import robots from "./robots";
import { PrivacyDialog } from "./privacy-dialog";

describe("visual approval prototype", () => {
  it("discloses media use, mode-specific storage, AI transfer and deletion boundaries", () => {
    const markup = renderToStaticMarkup(
      <PrivacyDialog localMedia cloudMedia />,
    );
    expect(markup.match(/<section\b/g)).toHaveLength(2);
    expect(markup).toContain("Your files");
    expect(markup).toContain("AI processing");
    expect(markup).toContain(
      "aren’t published, used in marketing or kept as demos",
    );
    expect(markup).toContain("short audio/video copy to Google Gemini");
    expect(markup).toContain("retention rules are separate");
    expect(markup).toContain("Device and cloud copies are temporary");
    expect(markup).toContain("Exit starts deletion");
    expect(markup).toContain("delays are possible");
    expect(markup).toContain("Downloaded files remain");
    expect(markup).not.toContain("Media stays on this device");
    expect(markup).not.toContain("Preview mode:");
    expect(markup).toContain(
      "Wikimedia Commons receives short scene descriptions from your clip",
    );
    expect(markup).toContain("Your video isn’t sent to Wikimedia");
    expect(markup).toContain("Gemini may generate a fallback image");

    const localMarkup = renderToStaticMarkup(<PrivacyDialog localMedia />);
    expect(localMarkup).toContain("Media stays on this device");
    expect(localMarkup).toContain("closing the tab doesn’t");
    expect(localMarkup).toContain("best-effort");
    expect(localMarkup).not.toContain("cloud copies");
    expect(localMarkup).not.toContain("Preview mode:");

    const previewMarkup = renderToStaticMarkup(<PrivacyDialog />);
    expect(previewMarkup).toContain(
      "Preview mode: selected files aren’t read or uploaded",
    );
    expect(previewMarkup).toContain(
      "Real processing uses temporary private storage",
    );
    expect(previewMarkup).not.toContain("Wikimedia");
    const generatedMarkup = renderToStaticMarkup(
      <PrivacyDialog localMedia cloudMedia illustrativePictures />,
    );
    expect(generatedMarkup).toContain(
      "Gemini generates pictures from short scene descriptions of your selected clip",
    );
    expect(generatedMarkup).not.toContain("Wikimedia");
    for (const value of [markup, localMarkup, previewMarkup, generatedMarkup]) {
      expect(value).not.toContain("01</span>");
      expect(value).not.toContain("instant deletion");
      expect(value).not.toContain("never stored");
    }
  });
  it.each([undefined, "secondary"] as const)(
    "preserves one named privacy-dialog trigger with variant %s",
    (triggerVariant) => {
      const markup = renderToStaticMarkup(
        <PrivacyDialog {...(triggerVariant ? { triggerVariant } : {})} />,
      );
      expect(markup.match(/aria-haspopup="dialog"/g)).toHaveLength(1);
      expect(markup).toMatch(/type="button"[^>]*>Privacy<\/button>/);
      expect(markup.match(/<dialog\b/g)).toHaveLength(1);
      expect(markup).toContain("Close privacy");
      expect(markup).not.toContain("The local development preview simulates");
      expect(markup).toContain("selected files aren’t read or uploaded");
      expect(markup).not.toContain("Maximum: 20 minutes and 500 MiB");
      expect(markup).not.toContain("Visible bounds");
    },
  );
  it("renders the revised rotating two-line promise without the removed prototype labels", () => {
    const markup = renderToStaticMarkup(<HomePage />);

    expect(markup.match(/<h1\b/g)).toHaveLength(1);
    expect(markup).toContain(
      'aria-label="We find you the moment. You get the final cut."',
    );
    expect(markup).toContain("We find you the");
    expect(markup).toContain("You get the final cut.");
    expect(markup).not.toContain("Keep the final word.");
    for (const word of [
      "moment",
      "hook",
      "insight",
      "punchline",
      "takeaway",
      "story",
    ]) {
      expect(markup).toContain(word);
    }
    expect(markup).toContain("You bring the conversation.");
    expect(markup.match(/data-hero-brand="true"/g)).toHaveLength(1);
    expect(markup).toContain(
      "ClipBuilder finds the complete ideas worth clipping and turns your choice into a polished vertical cut, grounded in the source from first frame to final word.",
    );
    expect(markup).not.toContain("Pause rotating headline");
    expect(markup).not.toContain("Play rotating headline");
    expect(markup).not.toContain("aria-pressed");
    expect(markup).not.toContain("Your conversation becomes one grounded cut.");
    expect(markup).not.toContain("Visual prototype · sample only");
    expect(markup).not.toContain("No upload or processing runs on this page.");
  });

  it("uses one unified flow and presents privacy without upload limits in a dialog", () => {
    const markup = renderToStaticMarkup(<HomePage />);

    expect(markup).toContain('href="#how-it-works"');
    expect(markup).not.toContain('href="#product-proof"');
    expect(markup.match(/>Get Started</g)).toHaveLength(1);
    expect(markup).toContain("<dialog");
    expect(markup).toContain('aria-haspopup="dialog"');
    expect(markup).toContain("Your media stays yours.");
    expect(markup).toContain("Your files");
    expect(markup).toContain(
      "aren’t published, used in marketing or kept as demos",
    );
    expect(markup).not.toContain("MP4 under 10 minutes and 250 MiB");
  });

  it("keeps the animated flow semantic and fully present in server markup", () => {
    const markup = renderToStaticMarkup(<HomePage />);

    expect(markup).toContain("Turn long-form video into a clip worth sharing.");
    expect(markup).toContain(
      "AI finds the standout moments in interviews, podcasts, speeches, and more. You choose one. We finish it with captions and visuals.",
    );
    expect(markup.match(/data-process-step="true"/g)).toHaveLength(3);
    expect(markup.match(/aria-current="step"/g)).toHaveLength(1);
    expect(markup).toContain("Upload a conversation with potential");
    expect(markup).toContain(
      "Drop in a long-form video you own and believe holds a clip-worthy moment.",
    );
    expect(markup).toContain("Reading the conversation");
    expect(markup).toContain("Bringing the cut to life");
    expect(markup).toContain(
      "Transcript bars resolve line by line while the vertical output stays muted.",
    );
    expect(markup).toContain(
      "Color, framing, captions, light, and timeline motion turn the phone into a living preview.",
    );
    expect(markup.match(/data-upload-card="true"/g)).toHaveLength(1);
    expect(markup.match(/data-conversation-speaker="true"/g)).toHaveLength(2);
    expect(markup.match(/data-speaker-arm="true"/g)).toHaveLength(4);
    expect(markup.match(/data-speaker-upper-arm="true"/g)).toHaveLength(4);
    expect(markup.match(/data-speaker-forearm="true"/g)).toHaveLength(4);
    expect(markup.match(/data-speaker-hand="true"/g)).toHaveLength(4);
    expect(markup.match(/data-speaker-shoulder-mold="true"/g)).toHaveLength(2);
    expect(markup.match(/data-boom-microphone="true"/g)).toHaveLength(2);
    expect(markup).toContain("How many digits does pi have?");
    expect(markup).toContain("Infinitely many—it never ends or repeats.");
    expect(markup).toContain('data-pi-visual="true"');
    expect(markup).toContain("π");
    expect(markup).toContain("= 3.14159…");
    expect(markup).toContain('data-video-timeline="true"');
    expect(markup).not.toContain("That&#x27;s where the story turns.");
    expect(markup).not.toContain("And that is the moment.");
    expect(markup).not.toContain("Moving the grounded moment");
    expect(markup).not.toContain(
      "One energy cue carries the selected idea across into the vertical frame.",
    );
    expect(markup).toContain('aria-live="polite"');
    expect(markup).toContain('data-active-step="0"');
    expect(markup).toContain('data-handoff="false"');
  });

  it("omits the removed proposed-edit section", () => {
    const markup = renderToStaticMarkup(<HomePage />);

    expect(markup).not.toContain("A first cut you can question.");
    expect(markup).not.toContain("Proposed edit");
    expect(markup).not.toContain("Apply 3 changes");
    expect(markup).not.toContain(
      "Illustrative controls for the future editor.",
    );
  });

  it("presents the clipping market without implying partnership or guaranteed earnings", () => {
    const markup = renderToStaticMarkup(<HomePage />);

    expect(markup).toContain("The clipping economy is live");
    expect(markup).toContain(
      "Brands and creators fund paid clipping campaigns",
    );
    expect(markup.match(/data-platform-logo="true"/g)).toHaveLength(3);
    for (const platform of ["Whop", "Clipster", "Picsart"]) {
      expect(markup).toContain(`alt="${platform}"`);
      expect(markup).toContain(
        `src="/platforms/${platform.toLowerCase()}.svg"`,
      );
    }
    const market = markup.match(
      /<section[^>]*data-market-section[^>]*>[\s\S]*?<\/section>/,
    )?.[0];
    expect(market).toBeDefined();
    expect(market).not.toMatch(/<a\b|<button\b|tabindex=|Explore/);
    expect(markup).toContain(
      "ClipBuilder is not affiliated with or partnered with these platforms.",
    );
    expect(markup).toContain("No earnings guarantee.");
    expect(markup).toContain('data-campaign-wall="true"');
    expect(markup).not.toContain("From conversation to grounded cut.");
  });

  it("keeps the time example and accessible final values without the removed goal badge", () => {
    const markup = renderToStaticMarkup(<HomePage />);
    expect(markup).toContain('aria-labelledby="time-title"');
    expect(markup).toContain(
      'aria-label="What would you do with 50 minutes back?"',
    );
    expect(markup.match(/data-minutes-back="true"/g)).toHaveLength(2);
    expect(
      markup.match(
        /data-count-target="50" data-count-from="0" data-count-digits="2"/g,
      ),
    ).toHaveLength(2);
    expect(markup).not.toContain("Illustrative goal");
    expect(markup).toContain("Five-clip example:");
    expect(markup).toContain("The five-clip what-if");
    expect(markup).toContain("not a measured result");
    expect(markup).not.toContain("An example for a batch of");
    expect(markup).not.toContain(
      "Actual time depends on your footage, edits and processing.",
    );
    expect(markup).toContain(
      "60 minutes manually compared with a 10-minute ClipBuilder target",
    );
    expect(markup).toContain(
      "About 17 percent of the time: 50 minutes back, roughly 83 percent saved",
    );
    expect(markup).toContain("of the time.");
    expect(markup).not.toContain("less hands-on time.");
    for (const [value, from] of [
      [17, 100],
      [60, 60],
      [10, 60],
    ]) {
      expect(markup).toContain(
        `data-count-target="${value}" data-count-from="${from}">${value}</span>`,
      );
    }
  });

  it("keeps smooth-scroll destinations available as real anchors", () => {
    const markup = renderToStaticMarkup(<HomePage />);

    expect(markup).toContain('id="top"');
    expect(markup).toContain('id="how-it-works"');
    expect(markup.match(/href="#top"/g)?.length).toBeGreaterThanOrEqual(2);
  });

  it("keeps the footer focused on one centered home link", () => {
    const markup = renderToStaticMarkup(<HomePage />);
    const footerMarkup = markup.match(/<footer[\s\S]*?<\/footer>/)?.[0];

    expect(footerMarkup).toContain('aria-label="ClipBuilder home"');
    expect(footerMarkup).not.toContain(
      "AI-assisted clipping · one grounded vertical edit",
    );
    expect(footerMarkup).not.toContain("Back to top");
  });

  it("keeps the unfinished application out of search indexes", () => {
    expect(robots()).toEqual({
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    });
  });
});
