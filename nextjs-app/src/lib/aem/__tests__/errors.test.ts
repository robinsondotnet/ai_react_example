import { AEMRequestError, httpStatusToError, toAEMError } from "../errors";

describe("AEMRequestError", () => {
  it("sets code, status, url, description, and message correctly", () => {
    const err = new AEMRequestError(
      "HTTP 401 Unauthorized",
      "unauthorized",
      401,
      "https://aem.example.com/graphql",
      "Credentials rejected"
    );
    expect(err.message).toBe("HTTP 401 Unauthorized");
    expect(err.code).toBe("unauthorized");
    expect(err.status).toBe(401);
    expect(err.url).toBe("https://aem.example.com/graphql");
    expect(err.description).toBe("Credentials rejected");
    expect(err.name).toBe("AEMRequestError");
  });

  it("is an instance of Error", () => {
    const err = new AEMRequestError("fail", "unknown");
    expect(err).toBeInstanceOf(Error);
  });
});

describe("httpStatusToError()", () => {
  const url = "https://aem.example.com/api";

  it('maps 401 to code "unauthorized"', () => {
    const err = httpStatusToError(401, url);
    expect(err.code).toBe("unauthorized");
    expect(err.status).toBe(401);
  });

  it('maps 403 to code "unauthorized"', () => {
    const err = httpStatusToError(403, url);
    expect(err.code).toBe("unauthorized");
    expect(err.status).toBe(403);
  });

  it('maps 404 to code "not_found"', () => {
    const err = httpStatusToError(404, url);
    expect(err.code).toBe("not_found");
    expect(err.status).toBe(404);
  });

  it('maps 500 to code "server"', () => {
    const err = httpStatusToError(500, url);
    expect(err.code).toBe("server");
    expect(err.status).toBe(500);
  });

  it('maps 503 to code "server"', () => {
    const err = httpStatusToError(503, url);
    expect(err.code).toBe("server");
    expect(err.status).toBe(503);
  });

  it('maps unknown status (418) to code "unknown"', () => {
    const err = httpStatusToError(418, url);
    expect(err.code).toBe("unknown");
    expect(err.status).toBe(418);
  });

  it("sets the url property correctly", () => {
    const err = httpStatusToError(500, url);
    expect(err.url).toBe(url);
  });
});

describe("toAEMError()", () => {
  const url = "https://aem.example.com/query";

  it("returns an AEMRequestError as-is", () => {
    const original = new AEMRequestError("already wrapped", "network", 0, url);
    const result = toAEMError(original, url);
    expect(result).toBe(original);
  });

  it('maps TypeError with "fetch" in message to code "network"', () => {
    const err = toAEMError(new TypeError("Failed to fetch"), url);
    expect(err.code).toBe("network");
    expect(err.url).toBe(url);
  });

  it('maps a generic Error to code "unknown"', () => {
    const err = toAEMError(new Error("something broke"), url);
    expect(err.code).toBe("unknown");
    expect(err.message).toBe("something broke");
  });

  it('wraps a non-Error value as code "unknown"', () => {
    const err = toAEMError("string error", url);
    expect(err.code).toBe("unknown");
    expect(err).toBeInstanceOf(AEMRequestError);
  });

  it("preserves the url argument", () => {
    const err = toAEMError(new Error("oops"), url);
    expect(err.url).toBe(url);
  });
});
