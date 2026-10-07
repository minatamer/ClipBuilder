import { OAuth2Client } from "google-auth-library";
import { ApplicationError } from "./errorMapper.js";
export interface FrontendCallerVerifier {
  verify(authorization: string | undefined): Promise<boolean>;
}
export class GoogleFrontendCaller implements FrontendCallerVerifier {
  private readonly client = new OAuth2Client({
    transporterOptions: { timeout: 5000, retry: false },
  });
  constructor(
    private readonly audience: string,
    private readonly email: string,
  ) {}
  async verify(authorization: string | undefined) {
    if (
      !authorization ||
      authorization.length > 8192 ||
      !/^Bearer [A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(
        authorization,
      )
    )
      return false;
    try {
      const ticket = await this.client.verifyIdToken({
        idToken: authorization.slice(7),
        audience: this.audience,
      });
      const claims = ticket.getPayload();
      return claims?.email === this.email && claims.email_verified === true;
    } catch {
      return false;
    }
  }
}
export const rejectFrontendCaller = () =>
  new ApplicationError({ code: "ABUSE_CHECK_FAILED" });
