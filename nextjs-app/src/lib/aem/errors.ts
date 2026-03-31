export type AEMErrorCode =
  | "network"
  | "unauthorized"
  | "not_found"
  | "server"
  | "unknown";

export class AEMRequestError extends Error {
  constructor(
    /** Raw technical message (HTTP status line, original TypeError, etc.) */
    message: string,
    public readonly code: AEMErrorCode,
    public readonly status?: number,
    public readonly url?: string,
    /** Human-friendly explanation shown prominently in the UI */
    public readonly description?: string
  ) {
    super(message);
    this.name = "AEMRequestError";
  }
}

export function httpStatusToError(status: number, url: string): AEMRequestError {
  if (status === 401 || status === 403) {
    return new AEMRequestError(
      `HTTP ${status} ${status === 401 ? "Unauthorized" : "Forbidden"}`,
      "unauthorized",
      status,
      url,
      "Your credentials were rejected by AEM. The request requires valid authentication to proceed."
    );
  }
  if (status === 404) {
    return new AEMRequestError(
      "HTTP 404 Not Found",
      "not_found",
      status,
      url,
      "AEM could not find the requested resource. The persisted query or Content Fragment path does not exist yet."
    );
  }
  if (status >= 500) {
    return new AEMRequestError(
      `HTTP ${status} Server Error`,
      "server",
      status,
      url,
      "AEM encountered an internal error while processing the request. The server may be starting up or misconfigured."
    );
  }
  return new AEMRequestError(
    `HTTP ${status}`,
    "unknown",
    status,
    url,
    "The request failed with an unexpected status code."
  );
}

export function toAEMError(e: unknown, url?: string): AEMRequestError {
  if (e instanceof AEMRequestError) return e;
  if (
    e instanceof TypeError &&
    (e.message.includes("fetch") ||
      e.message.includes("ECONNREFUSED") ||
      e.message.includes("network"))
  ) {
    return new AEMRequestError(
      e.message,
      "network",
      undefined,
      url,
      "The request never reached AEM — the connection was refused or the host is unreachable."
    );
  }
  const message = e instanceof Error ? e.message : "An unexpected error occurred.";
  return new AEMRequestError(
    message,
    "unknown",
    undefined,
    url,
    "An unexpected error occurred while communicating with AEM."
  );
}
