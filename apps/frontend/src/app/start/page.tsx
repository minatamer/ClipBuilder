import { SampleExperience } from "../../features/sample/sample.experience";
import { LocalEditingExperience } from "../../features/local-editing/experience";
import { controlIsLocal } from "../../server/control-api";

export const dynamic = "force-dynamic";

export default async function StartPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  if (controlIsLocal() && query.source !== "sample")
    return <LocalEditingExperience />;
  return <SampleExperience sampleRequested={query.source === "sample"} />;
}
