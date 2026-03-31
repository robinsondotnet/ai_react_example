import { httpStatusToError, toAEMError } from "./errors";

const aemHost = process.env.NEXT_PUBLIC_AEM_HOST ?? "http://localhost:4502";

function authHeaders(): HeadersInit {
  const basicAuth = process.env.AEM_BASIC_AUTH;
  if (!basicAuth) return {};
  return {
    Authorization: `Basic ${Buffer.from(basicAuth).toString("base64")}`,
  };
}

/**
 * Fetch a Sling Model Exporter / Content Services JSON for a given content path.
 * e.g. getContentModel("/content/dam/aem-headless-demo/my-article")
 * resolves to: GET /content/dam/aem-headless-demo/my-article.model.json
 */
export async function getContentModel<T = unknown>(contentPath: string): Promise<T> {
  const url = `${aemHost}${contentPath}.model.json`;
  try {
    const res = await fetch(url, {
      headers: authHeaders(),
      next: { revalidate: 60 },
    });
    if (!res.ok) throw httpStatusToError(res.status, url);
    return res.json() as Promise<T>;
  } catch (e) {
    throw toAEMError(e, url);
  }
}

/**
 * Generic fetch helper for any AEM endpoint (e.g. Content Services pages).
 */
export async function fetchAEM<T = unknown>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const url = `${aemHost}${path}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...authHeaders(),
        ...(options?.headers ?? {}),
      },
    });
    if (!res.ok) throw httpStatusToError(res.status, url);
    return res.json() as Promise<T>;
  } catch (e) {
    throw toAEMError(e, url);
  }
}
