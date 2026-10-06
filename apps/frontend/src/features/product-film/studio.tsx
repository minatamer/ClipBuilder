import { Composition, registerRoot } from "remotion";
import { ProductFilm } from "./product-film";
import { FILM_FORMAT, filmDuration } from "./film-timeline";

function FilmStudio() {
  return (
    <>
      <Composition
        id="ClipBuilderWalkthrough"
        component={ProductFilm}
        {...FILM_FORMAT}
        durationInFrames={filmDuration("walkthrough")}
        defaultProps={{ variant: "walkthrough" as const }}
      />
      <Composition
        id="ClipBuilderMotionTest"
        component={ProductFilm}
        {...FILM_FORMAT}
        durationInFrames={filmDuration("style")}
        defaultProps={{ variant: "style" as const }}
      />
    </>
  );
}
registerRoot(FilmStudio);
