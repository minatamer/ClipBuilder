import { z } from "zod";

// Configure before any browser contract is constructed. Even a caught Zod
// code-generation probe violates the production script policy.
z.config({ jitless: true });
