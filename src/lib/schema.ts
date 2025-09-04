import * as v from "valibot";

export const MAX_SECRET_LENGTH = 50000; // This caps secret AND size of all attached files
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

export interface FileData {
  name: string;
  dataUri: string;
  size: number;
}

export interface SecretData {
  text: string;
  files: FileData[];
}

export interface CreateSecretFormData {
  secret: string;
  passphrase: string;
  destruct: boolean;
  oneClick: boolean;
  expire: { value: number; label: string };
  files: FileData[];
}

export interface StoredSecretData {
  secret: string;
  destruct: boolean;
}

export const createSecretSchema = v.pipe(
  v.strictObject({
    secret: v.pipe(v.string(), v.minLength(0), v.maxLength(MAX_SECRET_LENGTH)),
    passphrase: v.pipe(
      v.string(),
      v.minLength(MIN_PASS_LENGTH),
      v.maxLength(MAX_PASS_LENGTH)
    ),
    destruct: v.boolean(),
    oneClick: v.boolean(),
    expire: v.picklist(expireValues),
    files: v.array(
      v.object({
        name: v.string(),
        dataUri: v.string(),
        size: v.number(),
      })
    ),
  }),
  v.check((data) => {
    const hasText = data.secret.trim().length > 0;
    const hasFiles = data.files.length > 0;

    return hasText || hasFiles;
  }, "Please provide either text content or attach files to create a secret"),
  v.transform(({ secret, files, ...rest }) => ({
    ...rest,
    secret: JSON.stringify({
      text: secret,
      files,
    }),
  }))
);

export type CreateSecretPayload = v.InferOutput<typeof createSecretSchema>;

export const validateSecretSchema = v.strictObject({
  secret: v.pipe(
    v.string(),
    v.minLength(1),
    v.maxLength((MAX_PASS_LENGTH + MAX_SECRET_LENGTH) * 2)
  ),
  destruct: v.boolean(),
  expire: v.picklist(expireValues),
});

function assertTuple(_args: any): asserts _args is [string, ...string[]] {
  return;
}

export function calculateSecretSize(text: string, files: FileData[]): number {
  const textSize = new TextEncoder().encode(text).length;
  const filesSize = files.reduce((total, file) => total + file.size, 0);
  return textSize + filesSize;
}

export function formatSecretSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} bytes`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
