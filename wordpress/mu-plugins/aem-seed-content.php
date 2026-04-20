<?php
/**
 * Plugin Name: AEM Seed Content
 * Description: Seeds mock articles and demo pages into WordPress. Run once via admin notice.
 * Version: 1.0.0
 */

defined('ABSPATH') || exit;

define('AEM_SEED_OPTION', 'aem_content_seeded');

/* ─── Show admin notice if not yet seeded ────────────────────────────── */

add_action('admin_notices', function () {
    if (get_option(AEM_SEED_OPTION)) return;
    if (!current_user_can('manage_options')) return;

    $url = wp_nonce_url(admin_url('admin-post.php?action=aem_seed_content'), 'aem_seed');
    echo '<div class="notice notice-info"><p>';
    echo '<strong>AEM Headless Demo:</strong> ';
    echo '<a href="' . esc_url($url) . '" class="button button-primary">Seed Demo Content</a> ';
    echo 'Import 5 sample articles and create demo pages with microfrontend shortcodes.';
    echo '</p></div>';
});

/* ─── Seed action ────────────────────────────────────────────────────── */

add_action('admin_post_aem_seed_content', function () {
    if (!current_user_can('manage_options')) wp_die('Unauthorized');
    check_admin_referer('aem_seed');

    $articles = aem_seed_get_articles();
    $created = 0;

    foreach ($articles as $article) {
        // Skip if already exists
        $existing = get_posts([
            'post_type'      => 'article',
            'posts_per_page' => 1,
            'meta_key'       => '_aem_path',
            'meta_value'     => $article['_path'],
            'post_status'    => 'any',
        ]);
        if (!empty($existing)) continue;

        $slug = basename($article['_path']);
        $post_id = wp_insert_post([
            'post_type'    => 'article',
            'post_title'   => $article['title'],
            'post_content' => $article['body']['html'],
            'post_status'  => 'publish',
            'post_name'    => $slug,
        ]);

        if (is_wp_error($post_id)) continue;

        update_post_meta($post_id, '_aem_path', $article['_path']);
        update_post_meta($post_id, 'body_html', $article['body']['html']);
        update_post_meta($post_id, 'body_plaintext', $article['body']['plaintext']);
        update_post_meta($post_id, 'author_name', $article['author']);
        update_post_meta($post_id, 'publish_date', $article['publishDate']);

        if (!empty($article['tags'])) {
            wp_set_object_terms($post_id, $article['tags'], 'article_tag');
        }

        $created++;
    }

    // Create demo pages
    aem_seed_create_demo_pages();

    update_option(AEM_SEED_OPTION, true);

    wp_redirect(admin_url('edit.php?post_type=article&seeded=' . $created));
    exit;
});

/* ─── Demo pages ─────────────────────────────────────────────────────── */

function aem_seed_create_demo_pages(): void {
    $pages = [
        [
            'title'    => 'Article Browser',
            'content'  => '[mfe element="aem-headless-app"]',
            'template' => 'page-full-width.php',
        ],
        [
            'title'    => 'Article List',
            'content'  => '[mfe element="aem-article-list"]',
            'template' => 'page-full-width.php',
        ],
    ];

    $menu_items = [];

    foreach ($pages as $page) {
        $existing = get_page_by_title($page['title'], OBJECT, 'page');
        if ($existing) {
            $menu_items[] = $existing->ID;
            continue;
        }

        $page_id = wp_insert_post([
            'post_type'    => 'page',
            'post_title'   => $page['title'],
            'post_content' => $page['content'],
            'post_status'  => 'publish',
        ]);

        if (!is_wp_error($page_id)) {
            update_post_meta($page_id, '_wp_page_template', $page['template']);
            $menu_items[] = $page_id;
        }
    }

    // Create navigation menu
    $menu_name = 'Primary';
    $menu_exists = wp_get_nav_menu_object($menu_name);
    if (!$menu_exists) {
        $menu_id = wp_create_nav_menu($menu_name);
        if (!is_wp_error($menu_id)) {
            foreach ($menu_items as $i => $page_id) {
                wp_update_nav_menu_item($menu_id, 0, [
                    'menu-item-object-id' => $page_id,
                    'menu-item-object'    => 'page',
                    'menu-item-type'      => 'post_type',
                    'menu-item-status'    => 'publish',
                    'menu-item-position'  => $i + 1,
                ]);
            }
            $locations = get_theme_mod('nav_menu_locations', []);
            $locations['primary'] = $menu_id;
            set_theme_mod('nav_menu_locations', $locations);
        }
    }
}

/* ─── Mock article data (matches nextjs-app/src/lib/content/mock/data.ts) */

function aem_seed_get_articles(): array {
    return [
        [
            '_path'       => '/content/dam/aem-headless-demo/articles/building-design-systems-at-scale',
            'title'       => 'Building Design Systems at Scale',
            'body'        => [
                'html'      => '<p>Design systems have become the backbone of modern front-end engineering. At their core, they are collections of reusable components governed by clear standards that can be assembled to build any number of applications.</p><p><strong>Component-driven development</strong> shifts the focus from pages to building blocks. Each component — button, card, modal — is designed, built, and tested in isolation before being composed into larger features. This isolation improves quality and accelerates delivery.</p><p>The real challenge is governance: how do you keep a system consistent as it scales across dozens of teams and hundreds of engineers? The answer lies in clear contribution guidelines, automated visual regression testing, and a dedicated platform team that treats the design system as a product.</p>',
                'plaintext' => "Design systems have become the backbone of modern front-end engineering. At their core, they are collections of reusable components governed by clear standards that can be assembled to build any number of applications.\n\nComponent-driven development shifts the focus from pages to building blocks. Each component — button, card, modal — is designed, built, and tested in isolation before being composed into larger features. This isolation improves quality and accelerates delivery.\n\nThe real challenge is governance: how do you keep a system consistent as it scales across dozens of teams and hundreds of engineers? The answer lies in clear contribution guidelines, automated visual regression testing, and a dedicated platform team that treats the design system as a product.",
            ],
            'author'      => 'Elena Vasquez',
            'publishDate' => '2024-03-12T09:00:00.000Z',
            'tags'        => ['design-systems', 'frontend', 'components', 'ux'],
        ],
        [
            '_path'       => '/content/dam/aem-headless-demo/articles/headless-cms-vs-traditional',
            'title'       => 'Headless CMS vs Traditional CMS: When to Choose What',
            'body'        => [
                'html'      => '<p>The term <em>headless CMS</em> has moved from buzzword to mainstream. But choosing between headless and traditional (coupled) architectures is not always straightforward — both have valid use-cases.</p><p>A <strong>traditional CMS</strong> like WordPress or AEM Sites tightly couples content management with presentation. Authors see a WYSIWYG preview, and the CMS renders the final HTML. This model is ideal when content and layout are inseparable, and when the editorial team wants full visual control.</p><p>A <strong>headless CMS</strong> (or headless mode of AEM, Contentful, Sanity, etc.) stores content as structured data and exposes it via APIs — usually REST or GraphQL. Presentation is handled by a separate front-end: a React SPA, a mobile app, a kiosk, or all of them at once.</p>',
                'plaintext' => "The term headless CMS has moved from buzzword to mainstream. But choosing between headless and traditional (coupled) architectures is not always straightforward — both have valid use-cases.\n\nA traditional CMS like WordPress or AEM Sites tightly couples content management with presentation. Authors see a WYSIWYG preview, and the CMS renders the final HTML. This model is ideal when content and layout are inseparable, and when the editorial team wants full visual control.\n\nA headless CMS (or headless mode of AEM, Contentful, Sanity, etc.) stores content as structured data and exposes it via APIs — usually REST or GraphQL. Presentation is handled by a separate front-end: a React SPA, a mobile app, a kiosk, or all of them at once.",
            ],
            'author'      => 'Marcus Okafor',
            'publishDate' => '2024-05-28T14:30:00.000Z',
            'tags'        => ['cms', 'headless', 'architecture', 'aem'],
        ],
        [
            '_path'       => '/content/dam/aem-headless-demo/articles/graphql-persisted-queries-aem',
            'title'       => 'GraphQL Persisted Queries in AEM: Performance & Security',
            'body'        => [
                'html'      => '<p>Adobe Experience Manager exposes Content Fragment data through a built-in GraphQL API. While ad-hoc queries are great during development, <strong>persisted queries</strong> are the recommended approach for production.</p><p>A persisted query is a pre-registered GraphQL query stored on the AEM server and invoked by name (e.g., <code>/graphql/execute.json/my-project/all-articles</code>). Because the query text lives on the server, it cannot be tampered with by the client — closing a common GraphQL security concern.</p><p>Performance benefits are significant: persisted queries can be cached at the CDN/Dispatcher layer just like any GET request. This is impossible with standard POST-based GraphQL calls.</p>',
                'plaintext' => "Adobe Experience Manager exposes Content Fragment data through a built-in GraphQL API. While ad-hoc queries are great during development, persisted queries are the recommended approach for production.\n\nA persisted query is a pre-registered GraphQL query stored on the AEM server and invoked by name (e.g., /graphql/execute.json/my-project/all-articles). Because the query text lives on the server, it cannot be tampered with by the client — closing a common GraphQL security concern.\n\nPerformance benefits are significant: persisted queries can be cached at the CDN/Dispatcher layer just like any GET request. This is impossible with standard POST-based GraphQL calls.",
            ],
            'author'      => 'Priya Nair',
            'publishDate' => '2024-08-14T11:00:00.000Z',
            'tags'        => ['graphql', 'aem', 'performance', 'security'],
        ],
        [
            '_path'       => '/content/dam/aem-headless-demo/articles/nextjs-app-router-deep-dive',
            'title'       => 'Next.js App Router: A Deep Dive into Server Components',
            'body'        => [
                'html'      => '<p>Next.js 13+ introduced the <strong>App Router</strong>, a fundamental shift from the Pages Router. Built on React Server Components (RSC), it changes how we think about data fetching, rendering, and code splitting.</p><p>With the App Router every component is a Server Component by default. This means the component runs on the server, has direct access to databases and file systems, and ships zero JavaScript to the client. Only components that need interactivity — forms, click handlers, browser APIs — opt into the client with the <code>&quot;use client&quot;</code> directive.</p><p>This model dramatically reduces the JavaScript bundle sent to the browser, improving Time to Interactive (TTI) and Largest Contentful Paint (LCP).</p>',
                'plaintext' => "Next.js 13+ introduced the App Router, a fundamental shift from the Pages Router. Built on React Server Components (RSC), it changes how we think about data fetching, rendering, and code splitting.\n\nWith the App Router every component is a Server Component by default. This means the component runs on the server, has direct access to databases and file systems, and ships zero JavaScript to the client. Only components that need interactivity — forms, click handlers, browser APIs — opt into the client with the \"use client\" directive.\n\nThis model dramatically reduces the JavaScript bundle sent to the browser, improving Time to Interactive (TTI) and Largest Contentful Paint (LCP).",
            ],
            'author'      => 'Jordan Thistlewood',
            'publishDate' => '2024-11-03T08:15:00.000Z',
            'tags'        => ['nextjs', 'react', 'server-components', 'frontend'],
        ],
        [
            '_path'       => '/content/dam/aem-headless-demo/articles/content-modelling-best-practices',
            'title'       => 'Content Modelling Best Practices for Headless Delivery',
            'body'        => [
                'html'      => '<p>Good content models are the foundation of a successful headless CMS implementation. A well-designed model makes content reusable across channels and future-proof against changing requirements.</p><p><strong>Principle 1 — Model the domain, not the page.</strong> Instead of creating a "Homepage Hero" fragment, model a "Promotion" that can appear on any page, email, or app screen. This decouples content from presentation.</p><p><strong>Principle 2 — Use references over duplication.</strong> If an article references an author, store the author as a separate Content Fragment and link to it, rather than embedding author fields directly in the article model.</p>',
                'plaintext' => "Good content models are the foundation of a successful headless CMS implementation. A well-designed model makes content reusable across channels and future-proof against changing requirements.\n\nPrinciple 1 — Model the domain, not the page. Instead of creating a \"Homepage Hero\" fragment, model a \"Promotion\" that can appear on any page, email, or app screen. This decouples content from presentation.\n\nPrinciple 2 — Use references over duplication. If an article references an author, store the author as a separate Content Fragment and link to it, rather than embedding author fields directly in the article model.",
            ],
            'author'      => 'Elena Vasquez',
            'publishDate' => '2025-01-20T10:45:00.000Z',
            'tags'        => ['content-modelling', 'headless', 'best-practices', 'cms'],
        ],
    ];
}
