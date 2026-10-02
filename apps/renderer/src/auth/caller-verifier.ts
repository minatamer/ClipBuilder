import { OAuth2Client } from "google-auth-library";
import { MediaFailure } from "../media/media.failure.js";
export type CallerPurpose = "control" | "expiry";
export interface CallerVerifier {
  verify(authorization: string | undefined): Promise<CallerPurpose>;
}
export class GoogleCallerVerifier implements CallerVerifier {
  private readonly client = new OAuth2Client({
    transporterOptions: { timeout: 10_000, retry: false },
  });
  constructor(
    private readonly audience: string,
    private readonly control: string,
    private readonly expiry: string,
  ) {}
  async verify(authorization: string | undefined): Promise<CallerPurpose> {
    if (
      !authorization ||
      authorization.length > 8192 ||
      !/^Bearer [A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(
        authorization,
      )
    )
      throw new MediaFailure("unauthorized");
    try {
      const ticket = await this.client.verifyIdToken({
          idToken: authorization.slice(7),
          audience: this.audience,
        }),
        claims = ticket.getPayload();
      if (!claims?.email || !claims.email_verified) throw new Error("invalid");
      if (claims.email === this.control) return "control";
      if (claims.email === this.expiry) return "expiry";
    } catch {
      throw new MediaFailure("unauthorized");
    }
    throw new MediaFailure("unauthorized");
  }
}
