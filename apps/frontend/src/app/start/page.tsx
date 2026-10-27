import { LocalEditingExperience } from "../../features/local-editing/experience";
import { controlIsLocal } from "../../server/control-api";

export const dynamic = "force-dynamic";

export default function StartPage() {
  const local = controlIsLocal();
  return <LocalEditingExperience hosted={!local} />;
}
