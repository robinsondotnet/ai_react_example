import { yoga } from "@/lib/graphql";
import type { NextRequest } from "next/server";

async function handler(request: NextRequest): Promise<Response> {
  return yoga.handleRequest(request, {});
}

export { handler as GET, handler as POST, handler as OPTIONS };
