import { z } from "zod";

export const secretSchema = z
  .object({
    secret: z.string().min(1).max(500),
    passphrase: z.string().min(8).max(100),
  })
  .strict();
