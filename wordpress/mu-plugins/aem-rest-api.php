<?php
/**
 * Plugin Name: AEM REST API
 * Description: WP REST endpoints for articles + AEM-compatible persisted query URL aliases.
 * Version: 1.0.0
 */

defined('ABSPATH') || exit;

/* ─── CORS headers for all AEM API responses ─────────────────────────── */

function aem_cors_headers(): array {
    return [
        'Access-Control-Allow-Origin'  => '*',
        'Access-Control-Allow-Methods' => 'GET, OPTIONS',
        'Access-Control-Allow-Headers' => 'Content-Type',
    ];
}

function aem_json_response($data, int $status = 200): WP_REST_Response {
    $response = new WP_REST_Response($data, $status);
    foreach (aem_cors_headers() as $k => $v) {
        $response->header($k, $v);
    }
    return $response;
}

/* ─── Primary REST endpoints: /wp-json/aem/v1/articles ───────────────── */

add_action('rest_api_init', function () {
    $ns = 'aem/v1';

    // GET /wp-json/aem/v1/articles
    register_rest_route($ns, '/articles', [
        'methods'             => 'GET',
        'callback'            => 'aem_api_list_articles',
        'permission_callback' => '__return_true',
    ]);

    // GET /wp-json/aem/v1/articles/(?P<path>.+)
    register_rest_route($ns, '/articles/(?P<path>.+)', [
        'methods'             => 'GET',
        'callback'            => 'aem_api_get_article',
        'permission_callback' => '__return_true',
    ]);
});

function aem_api_list_articles(): WP_REST_Response {
    $posts = get_posts([
        'post_type'      => 'article',
        'posts_per_page' => 100,
        'post_status'    => 'publish',
        'orderby'        => 'date',
        'order'          => 'DESC',
    ]);

    $items = array_map('aem_article_to_model', $posts);
    return aem_json_response($items);
}

function aem_api_get_article(WP_REST_Request $request): WP_REST_Response {
    $path = '/' . ltrim($request->get_param('path'), '/');

    $posts = get_posts([
        'post_type'      => 'article',
        'posts_per_page' => 1,
        'post_status'    => 'publish',
        'meta_key'       => '_aem_path',
        'meta_value'     => $path,
    ]);

    if (empty($posts)) {
        return aem_json_response(null, 404);
    }

    return aem_json_response(aem_article_to_model($posts[0]));
}

/* ─── AEM-compatible aliases ─────────────────────────────────────────── */
/* These match the URL pattern web components use when pointing at AEM:  */
/*   /graphql/execute.json/aem-headless-demo/all-articles                */
/*   /graphql/execute.json/aem-headless-demo/article-by-path?_path=...   */

add_action('init', function () {
    add_rewrite_rule(
        '^graphql/execute\.json/aem-headless-demo/all-articles/?$',
        'index.php?aem_query=all-articles',
        'top'
    );
    add_rewrite_rule(
        '^graphql/execute\.json/aem-headless-demo/article-by-path/?$',
        'index.php?aem_query=article-by-path',
        'top'
    );
});

add_filter('query_vars', function (array $vars): array {
    $vars[] = 'aem_query';
    return $vars;
});

add_action('template_redirect', function () {
    $query = get_query_var('aem_query');
    if (!$query) return;

    // Set CORS headers
    foreach (aem_cors_headers() as $k => $v) {
        header("{$k}: {$v}");
    }

    // Handle OPTIONS preflight
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        status_header(204);
        exit;
    }

    header('Content-Type: application/json; charset=utf-8');

    if ($query === 'all-articles') {
        $posts = get_posts([
            'post_type'      => 'article',
            'posts_per_page' => 100,
            'post_status'    => 'publish',
            'orderby'        => 'date',
            'order'          => 'DESC',
        ]);

        echo wp_json_encode([
            'data' => [
                'articleList' => [
                    'items' => array_map('aem_article_to_model', $posts),
                ],
            ],
        ]);
        exit;
    }

    if ($query === 'article-by-path') {
        $path = sanitize_text_field($_GET['_path'] ?? '');
        $item = null;

        if ($path) {
            $posts = get_posts([
                'post_type'      => 'article',
                'posts_per_page' => 1,
                'post_status'    => 'publish',
                'meta_key'       => '_aem_path',
                'meta_value'     => $path,
            ]);
            if (!empty($posts)) {
                $item = aem_article_to_model($posts[0]);
            }
        }

        echo wp_json_encode([
            'data' => [
                'articleByPath' => [
                    'item' => $item,
                ],
            ],
        ]);
        exit;
    }

    status_header(404);
    echo wp_json_encode(['error' => 'Unknown persisted query']);
    exit;
});

/* ─── Flush rewrite rules on activation ──────────────────────────────── */

add_action('admin_init', function () {
    if (get_option('aem_rest_api_flushed')) return;
    flush_rewrite_rules();
    update_option('aem_rest_api_flushed', true);
});
