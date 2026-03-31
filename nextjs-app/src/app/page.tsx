import Link from "next/link";

const aemHost = process.env.NEXT_PUBLIC_AEM_HOST ?? "http://localhost:4502";

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
            className="rounded-full bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
            </svg>
            Browse Articles
          </Link>
          <a
            href="/api/graphql"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-gray-300 px-6 py-3 text-gray-700 font-medium hover:bg-gray-100 transition-colors flex items-center gap-2 justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
            </svg>
            GraphQL Explorer
          </a>
          <Link
            href="/web-components"
            className="rounded-full border border-gray-300 px-6 py-3 text-gray-700 font-medium hover:bg-gray-100 transition-colors flex items-center gap-2 justify-center"
          >
            <span>🧩</span> Web Components
          </Link>
        </div>
        <p className="mt-10 text-xs text-gray-400">
          AEM Author:{" "}
          <a
            href={aemHost}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            {aemHost}
          </a>
        </p>
      </div>
    </main>
  );
}
