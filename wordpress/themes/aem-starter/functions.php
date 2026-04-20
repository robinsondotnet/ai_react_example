<?php
defined('ABSPATH') || exit;

/* ─── Theme support ──────────────────────────────────────────────────── */

add_action('after_setup_theme', function () {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('html5', ['search-form', 'comment-form', 'gallery', 'caption', 'style', 'script']);

    register_nav_menus([
        'primary' => 'Primary Navigation',
    ]);
});

/* ─── Enqueue styles ─────────────────────────────────────────────────── */

add_action('wp_enqueue_scripts', function () {
    // Tailwind CSS via CDN for consistency with web component styles
    wp_enqueue_script(
        'tailwindcss',
        'https://cdn.tailwindcss.com',
        [],
        null,
        false
    );
    wp_enqueue_style('aem-starter', get_stylesheet_uri(), [], '1.0.0');
});
