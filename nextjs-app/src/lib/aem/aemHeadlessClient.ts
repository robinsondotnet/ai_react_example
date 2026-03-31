import AEMHeadless from "@adobe/aem-headless-client-js";

const aemHost = process.env.NEXT_PUBLIC_AEM_HOST ?? "http://localhost:4502";
const graphqlEndpoint =
  process.env.NEXT_PUBLIC_AEM_GRAPHQL_ENDPOINT ??
  "/content/_cq_graphql/aem-headless-demo/endpoint.gql";

// Basic auth header for local dev (server-side only)
function getAuthHeader(): string | undefined {
  const basicAuth = process.env.AEM_BASIC_AUTH;
  if (!basicAuth) return undefined;
  return `Basic ${Buffer.from(basicAuth).toString("base64")}`;
}

export function getAEMClient(): AEMHeadless {
  return new AEMHeadless({
    serviceURL: aemHost,
    endpoint: graphqlEndpoint,
    auth: getAuthHeader(),
  });
}
