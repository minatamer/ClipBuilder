import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ArrowRight } from "lucide-react";

import { Button, IconButton } from "./button";
import { Progress } from "./progress";
import { WorkflowFrame } from "./workflow-frame";

describe("shared workflow primitives", () => {
  it.each([
    { step: 0 as const, title: "Choose your video", number: 1 },
    { step: 1 as const, title: "Pick one moment", number: 2 },
    { step: 2 as const, title: "Building your clip", number: 3 },
  ])(
    "combines step $number and its title in one focusable heading without a separate tracker",
    ({ step, title, number }) => {
      const markup = renderToStaticMarkup(
        <WorkflowFrame
          title={title}
          step={step}
          footer={<Button disabled>Build this clip</Button>}
        >
          <p>Prepared choices</p>
        </WorkflowFrame>,
      );
      expect(markup.match(/<main/g)).toHaveLength(1);
      expect(markup.match(/<h1/g)).toHaveLength(1);
      expect(markup).toContain(
        `tabindex="-1">Step ${number} of 3: ${title}</h1>`,
      );
      expect(markup).not.toContain("Clip preparation steps");
      expect(markup).not.toContain('aria-current="step"');
      expect(markup).toContain("<footer");
      expect(markup).toContain('disabled=""');
    },
  );
  it("names icon controls and defaults commands to non-submit buttons", () => {
    const markup = renderToStaticMarkup(
      <IconButton icon={ArrowRight} label="Next candidate" />,
    );
    expect(markup).toContain('aria-label="Next candidate"');
    expect(markup).toContain('title="Next candidate"');
    expect(markup).toContain('type="button"');
    expect(markup).toContain('aria-hidden="true"');
  });
  it("keeps the visible fill and accessible percentage in sync, bounds values and supports unknown progress", () => {
    const measured = renderToStaticMarkup(
      <Progress label="Uploading video" fraction={0.42} />,
    );
    expect(measured).toContain('role="progressbar"');
    expect(measured).toContain('aria-valuenow="42"');
    expect(measured).toContain('aria-valuemin="0"');
    expect(measured).toContain('aria-valuemax="100"');
    expect(measured).toContain("42%");
    expect(measured).toContain("transform:scaleX(0.42)");
    expect(
      renderToStaticMarkup(<Progress label="Uploading video" fraction={2} />),
    ).toContain('aria-valuenow="100"');
    expect(
      renderToStaticMarkup(<Progress label="Uploading video" fraction={-1} />),
    ).toContain('aria-valuenow="0"');
    const unknown = renderToStaticMarkup(
      <Progress label="Adding captions" fraction={Number.NaN} active={false} />,
    );
    expect(unknown).not.toContain("aria-valuenow");
    expect(unknown).not.toContain("%");
    expect(unknown).toContain('data-active="false"');
    expect(unknown).toContain('data-determinate="false"');
  });
});
