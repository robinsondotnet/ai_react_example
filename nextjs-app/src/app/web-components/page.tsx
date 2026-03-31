"use client";

import Script from "next/script";

export default function ExplorePage() {
  return (
    <>
      <Script src="/dist-wc/web-components.js" strategy="afterInteractive" />

      <main className="min-h-screen bg-zinc-50 py-10 px-6">
        <div className="max-w-4xl mx-auto">
          <header className="mb-10">
            <h1 className="text-3xl font-bold text-zinc-900">Web Components Explorer</h1>
            <p className="mt-2 text-zinc-500 text-sm">
              Live preview of the built IIFE bundle. Data is served by the local mock API.
            </p>
          </header>

          <Section
            tag="aem-headless-app"
            title="<aem-headless-app>"
            description="Full app with hash-based router. Navigate between article list and detail views."
          >
            <aem-headless-app style={{ display: "block", minHeight: "480px" }} />
          </Section>

          <Section
            tag="aem-article-list"
            title="<aem-article-list>"
            description="Standalone article list grid. Drop it anywhere on a page."
          >
            <aem-article-list style={{ display: "block" }} />
          </Section>

          <Section
            tag="aem-article-detail"
            title="<aem-article-detail>"
            description="Single article detail view. Pass the content fragment path via the path attribute."
          >
            <aem-article-detail
              path="/content/dam/aem-headless-demo/articles/graphql-persisted-queries-aem"
              style={{ display: "block" }}
            />
          </Section>
        </div>
      </main>
    </>
  );
}

function Section({
  title,
  description,
  children,
}: {
  tag: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-12">
      <div className="mb-3">
        <h2 className="text-lg font-semibold text-zinc-800 font-mono">{title}</h2>
        <p className="text-zinc-500 text-sm mt-0.5">{description}</p>
      </div>
      <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
        {children}
      </div>
    </section>
  );
}
