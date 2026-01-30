export type ApiError = {
  code: string;
  message: string;
  details?: unknown;
};

export function buildError(code: string, message: string, details?: unknown) {
  return { error: { code, message, details } };
}
