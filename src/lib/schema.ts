import { z } from "zod";

export const MAX_SECRET_LENGTH = 500;
export const MAX_PASS_LENGTH = 100;
export const MIN_PASS_LENGTH = 8;

export const expireOptions = [
  { label: "7 days", value: 3600 * 24 * 7 },
  { label: "1 day", value: 3600 * 24 },
  { label: "8 hours", value: 3600 * 8 },
  { label: "4 hours", value: 3600 * 4 },
  { label: "1 hour", value: 3600 },
] as const;

const expireValues = expireOptions.map((option) => String(option.value));

assertTuple(expireValues);

export interface CreateSecretFormData {
  secret: string;
  passphrase: string;
  destruct: boolean;
  expire: { value: number; label: string };
}

export interface StoredSecretData {
  secret: string;
  destruct: boolean;
}

export const createSecretSchema = z
  .object({
    secret: z.string().min(1).max(MAX_SECRET_LENGTH),
    passphrase: z.string().min(MIN_PASS_LENGTH).max(MAX_PASS_LENGTH),
    destruct: z.boolean(),
    expire: z.enum(expireValues),
  })
  .strict();

export type CreateSecretPayload = z.infer<typeof createSecretSchema>;

export const validateSecretSchema = z.object({
  secret: z
    .string()
    .min(1)
    .max((MAX_PASS_LENGTH + MAX_SECRET_LENGTH) * 2),
  destruct: z.boolean(),
  expire: z.enum(expireValues),
});

function assertTuple(args: any): asserts args is [string, ...string[]] {
  return;
}
