import { z } from "zod";

// Configure before application modules construct schemas: even Zod's caught
// code-generation probe violates the production script policy.
z.config({ jitless: true });
