import { proxyLocalWorkflow } from "../../../../server/local-workflow";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
async function route(
  request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  return proxyLocalWorkflow(request, (await context.params).path);
}
export { route as GET, route as POST, route as PUT, route as DELETE };
