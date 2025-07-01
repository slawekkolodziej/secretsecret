import * as v from 'valibot';

export const MAX_SECRET_LENGTH = 5000;
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
  oneClick: boolean;
  expire: { value: number; label: string };
}

export interface StoredSecretData {
  secret: string;
  destruct: boolean;
}

export const createSecretSchema = v
  .strictObject({
    secret: v.pipe(v.string(), v.minLength(0), v.maxLength(MAX_SECRET_LENGTH)),
    passphrase: v.pipe(v.string(), v.minLength(MIN_PASS_LENGTH), v.maxLength(MAX_PASS_LENGTH)),
    destruct: v.boolean(),
    oneClick: v.boolean(),
    expire: v.picklist(expireValues),
  })

export type CreateSecretPayload = v.InferInput<typeof createSecretSchema>;

export const validateSecretSchema = v.strictObject({
  secret: v.pipe(
    v.string(),
    v.minLength(1),
    v.maxLength((MAX_PASS_LENGTH + MAX_SECRET_LENGTH) * 2)
  ),
  destruct: v.boolean(),
  expire: v.picklist(expireValues),
});

function assertTuple(args: any): asserts args is [string, ...string[]] {
  return;
}
