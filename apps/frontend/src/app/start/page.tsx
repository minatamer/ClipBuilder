import { SampleExperience } from "../../features/sample/sample.experience";

export default async function StartPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  return <SampleExperience sampleRequested={query.source === "sample"} />;
}
