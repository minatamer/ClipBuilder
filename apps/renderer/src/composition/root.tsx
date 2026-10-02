import { Composition, getInputProps, registerRoot } from "remotion";
import { ClipComposition } from "@clipbuilder/composition";
import { compositionManifestV2Schema } from "@clipbuilder/contracts";
function Root() {
  const props = getInputProps(),
    manifest = compositionManifestV2Schema.parse(props.manifest);
  if (typeof props.sourceUrl !== "string") throw new Error("invalid");
  return (
    <Composition
      id="Clip"
      component={ClipComposition}
      defaultProps={{ manifest, sourceUrl: props.sourceUrl, sourceStartMs: 0 }}
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={Math.ceil(
        ((manifest.range.endMs - manifest.range.startMs) * 30) / 1000,
      )}
    />
  );
}
registerRoot(Root);
