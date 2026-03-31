import type { ArticleModel } from "../types";

export const mockArticles: ArticleModel[] = [
  {
    _path: "/content/dam/aem-headless-demo/articles/building-design-systems-at-scale",
    title: "Building Design Systems at Scale",
    body: {
      html: "<p>Design systems have become the backbone of modern product development. When teams grow beyond a handful of engineers and designers, ad-hoc UI decisions compound into inconsistency that erodes user trust.</p><p><strong>Component-driven development</strong> addresses this by treating UI elements as composable, versioned artifacts. Storybook, combined with a token-based theming layer, gives teams a shared language across disciplines.</p><p>The real challenge isn't building the system — it's adoption. Document decisions, automate audits, and make the right thing the easy thing.</p>",
      plaintext:
        "Design systems have become the backbone of modern product development. When teams grow beyond a handful of engineers and designers, ad-hoc UI decisions compound into inconsistency that erodes user trust.\n\nComponent-driven development addresses this by treating UI elements as composable, versioned artifacts. Storybook, combined with a token-based theming layer, gives teams a shared language across disciplines.\n\nThe real challenge isn't building the system — it's adoption. Document decisions, automate audits, and make the right thing the easy thing.",
    },
    author: "Elena Vasquez",
    publishDate: "2024-03-12T09:00:00.000Z",
    tags: ["design-systems", "frontend", "components", "ux"],
  },
  {
    _path: "/content/dam/aem-headless-demo/articles/headless-cms-vs-traditional-cms",
    title: "Headless CMS vs Traditional CMS: Choosing the Right Architecture",
    body: {
      html: "<p>The CMS landscape has split into two distinct philosophies. Traditional CMS platforms couple content storage with presentation, making them fast to launch but difficult to extend across channels.</p><p><strong>Headless CMS</strong> decouples the content repository from the delivery layer entirely. Content authors work in a familiar interface while developers consume structured content via APIs — REST, GraphQL, or both.</p><p>For organisations managing content across web, mobile, kiosks, and voice interfaces, the headless model pays dividends quickly. The upfront investment in a content model is returned through reuse.</p>",
      plaintext:
        "The CMS landscape has split into two distinct philosophies. Traditional CMS platforms couple content storage with presentation, making them fast to launch but difficult to extend across channels.\n\nHeadless CMS decouples the content repository from the delivery layer entirely. Content authors work in a familiar interface while developers consume structured content via APIs — REST, GraphQL, or both.\n\nFor organisations managing content across web, mobile, kiosks, and voice interfaces, the headless model pays dividends quickly. The upfront investment in a content model is returned through reuse.",
    },
    author: "Marcus Okafor",
    publishDate: "2024-05-28T11:30:00.000Z",
    tags: ["headless-cms", "architecture", "content-strategy", "api"],
  },
  {
    _path: "/content/dam/aem-headless-demo/articles/graphql-persisted-queries-aem",
    title: "GraphQL Persisted Queries in AEM: Performance and Security",
    body: {
      html: "<p>Standard GraphQL gives clients the freedom to construct arbitrary queries — a double-edged sword. Unrestricted queries can hammer your persistence layer and expose unintended data shapes.</p><p><strong>Persisted queries</strong> flip this model: queries are defined and stored on the server, and clients invoke them by reference. AEM Content Fragments natively supports this pattern via the <code>/graphql/execute.json</code> endpoint.</p><p>Beyond security, persisted queries are cacheable at the CDN layer. Because the query path is deterministic, a Dispatcher rule or CDN policy can cache responses for seconds or hours, dramatically reducing origin load.</p>",
      plaintext:
        "Standard GraphQL gives clients the freedom to construct arbitrary queries — a double-edged sword. Unrestricted queries can hammer your persistence layer and expose unintended data shapes.\n\nPersisted queries flip this model: queries are defined and stored on the server, and clients invoke them by reference. AEM Content Fragments natively supports this pattern via the /graphql/execute.json endpoint.\n\nBeyond security, persisted queries are cacheable at the CDN layer. Because the query path is deterministic, a Dispatcher rule or CDN policy can cache responses for seconds or hours, dramatically reducing origin load.",
    },
    author: "Priya Nair",
    publishDate: "2024-08-14T08:00:00.000Z",
    tags: ["graphql", "aem", "performance", "security", "cdn"],
  },
  {
    _path: "/content/dam/aem-headless-demo/articles/nextjs-app-router-deep-dive",
    title: "Next.js App Router: A Deep Dive into React Server Components",
    body: {
      html: "<p>The App Router, introduced in Next.js 13 and stabilised in 14, rewrites how data fetching and rendering coexist. Server Components run on the server by default — no JavaScript sent to the browser, no hydration cost.</p><p><strong>Async Server Components</strong> can <code>await</code> data directly inside the component tree, eliminating the need for <code>getServerSideProps</code> or client-side <code>useEffect</code> waterfalls.</p><p>The mental model shift is significant: think about components as either server (data, no interactivity) or client (interactivity, no direct DB access) and compose them deliberately. Boundaries are explicit with the <code>'use client'</code> directive.</p>",
      plaintext:
        "The App Router, introduced in Next.js 13 and stabilised in 14, rewrites how data fetching and rendering coexist. Server Components run on the server by default — no JavaScript sent to the browser, no hydration cost.\n\nAsync Server Components can await data directly inside the component tree, eliminating the need for getServerSideProps or client-side useEffect waterfalls.\n\nThe mental model shift is significant: think about components as either server (data, no interactivity) or client (interactivity, no direct DB access) and compose them deliberately. Boundaries are explicit with the 'use client' directive.",
    },
    author: "Jordan Thistlewood",
    publishDate: "2024-11-03T14:00:00.000Z",
    tags: ["nextjs", "react", "server-components", "app-router", "frontend"],
  },
  {
    _path: "/content/dam/aem-headless-demo/articles/content-modelling-best-practices",
    title: "Content Modelling Best Practices for Headless Delivery",
    body: {
      html: "<p>A well-designed content model is the foundation of every successful headless implementation. Get it wrong and you'll fight the CMS at every turn; get it right and content reuse becomes effortless.</p><p><strong>Think in nouns, not pages.</strong> A <em>Product</em>, an <em>Author</em>, and an <em>Article</em> are content types. A homepage or a listing page is a presentation concern — keep it out of your content model.</p><p>Use references liberally: an article references an author fragment rather than duplicating author fields. This single-source-of-truth approach means an author's biography updates everywhere instantly. Normalise early; denormalise only when query performance demands it.</p>",
      plaintext:
        "A well-designed content model is the foundation of every successful headless implementation. Get it wrong and you'll fight the CMS at every turn; get it right and content reuse becomes effortless.\n\nThink in nouns, not pages. A Product, an Author, and an Article are content types. A homepage or a listing page is a presentation concern — keep it out of your content model.\n\nUse references liberally: an article references an author fragment rather than duplicating author fields. This single-source-of-truth approach means an author's biography updates everywhere instantly. Normalise early; denormalise only when query performance demands it.",
    },
    author: "Elena Vasquez",
    publishDate: "2025-01-20T10:00:00.000Z",
    tags: ["content-modelling", "headless-cms", "architecture", "best-practices"],
  },
];
