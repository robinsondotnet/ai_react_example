<?php
/**
 * Plugin Name: AEM Web Components
 * Description: Loads the AEM Headless web components IIFE bundle and provides shortcodes.
 * Version: 1.0.0
 */

defined('ABSPATH') || exit;

// The IIFE bundle is volume-mounted into mu-plugins/aem-wc-assets/
define('AEM_WC_ASSET_URL', content_url('mu-plugins/aem-wc-assets/web-components.js'));

// Default API host — Next.js dev server reachable from the browser (not from Docker)
define('AEM_WC_DEFAULT_HOST', '');

/**
 * Enqueue the web-components bundle on the frontend only.
 */
add_action('wp_enqueue_scripts', function () {
    wp_enqueue_script('aem-web-components', AEM_WC_ASSET_URL, [], null, true);
});

/**
 * [aem_app] — Full SPA with hash-based routing.
 *
 * Usage: [aem_app host="http://localhost:3000"]
 */
add_shortcode('aem_app', function ($atts) {
    $atts = shortcode_atts(['host' => AEM_WC_DEFAULT_HOST], $atts);
    return sprintf(
        '<aem-headless-app aem-host="%s" style="display:block;min-height:300px"></aem-headless-app>',
        esc_attr($atts['host'])
    );
});

/**
 * [aem_article_list] — Article grid.
 *
 * Usage: [aem_article_list host="http://localhost:3000"]
 */
add_shortcode('aem_article_list', function ($atts) {
    $atts = shortcode_atts(['host' => AEM_WC_DEFAULT_HOST], $atts);
    return sprintf(
        '<aem-article-list aem-host="%s" style="display:block;min-height:200px"></aem-article-list>',
        esc_attr($atts['host'])
    );
});

/**
 * [aem_article_detail] — Single article.
 *
 * Usage: [aem_article_detail path="/content/dam/articles/my-article" host="http://localhost:3000"]
 */
add_shortcode('aem_article_detail', function ($atts) {
    $atts = shortcode_atts(['path' => '', 'host' => AEM_WC_DEFAULT_HOST], $atts);
    return sprintf(
        '<aem-article-detail path="%s" aem-host="%s" style="display:block;min-height:200px"></aem-article-detail>',
        esc_attr($atts['path']),
        esc_attr($atts['host'])
    );
});
