import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-xl w-full text-center">
        <h1 className="text-4xl font-bold mb-3 text-gray-900">AEM Headless Demo</h1>
        <p className="text-gray-500 mb-8">
          Next.js App Router · TypeScript · AEM SDK (GraphQL + REST)
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/articles"
            className="rounded-full bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 transition-colors"
          >
            Browse Articles (GraphQL)
          </Link>
          <a
            href={`${process.env.NEXT_PUBLIC_AEM_HOST}/content/_cq_graphql/aem-headless-demo/endpoint.gql/explorer`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-gray-300 px-6 py-3 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
          >
            GraphiQL Explorer ↗
          </a>
        </div>
        <p className="mt-10 text-xs text-gray-400">
          AEM Author:{" "}
          <a
            href={process.env.NEXT_PUBLIC_AEM_HOST}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            {process.env.NEXT_PUBLIC_AEM_HOST}
          </a>
        </p>
      </div>
    </main>
  );
}
