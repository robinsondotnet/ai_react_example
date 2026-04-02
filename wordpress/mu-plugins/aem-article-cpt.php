<?php
/**
 * Plugin Name: AEM Article CPT
 * Description: Registers the Article custom post type mirroring AEM Content Fragment Model.
 * Version: 1.0.0
 */

defined('ABSPATH') || exit;

/* ─── Register CPT + Taxonomy ────────────────────────────────────────── */

add_action('init', function () {
    register_post_type('article', [
        'labels' => [
            'name'          => 'Articles',
            'singular_name' => 'Article',
            'add_new_item'  => 'Add New Article',
            'edit_item'     => 'Edit Article',
        ],
        'public'       => true,
        'show_in_rest' => true,
        'menu_icon'    => 'dashicons-media-text',
        'supports'     => ['title', 'editor', 'custom-fields'],
        'has_archive'  => true,
        'rewrite'      => ['slug' => 'articles'],
    ]);

    register_taxonomy('article_tag', 'article', [
        'labels' => [
            'name'          => 'Article Tags',
            'singular_name' => 'Article Tag',
        ],
        'public'       => true,
        'show_in_rest' => true,
        'hierarchical' => false,
        'rewrite'      => ['slug' => 'article-tag'],
    ]);
});

/* ─── Register meta fields ───────────────────────────────────────────── */

add_action('init', function () {
    $meta_fields = [
        '_aem_path'      => 'string',
        'body_html'      => 'string',
        'body_plaintext' => 'string',
        'author_name'    => 'string',
        'publish_date'   => 'string',
    ];

    foreach ($meta_fields as $key => $type) {
        register_post_meta('article', $key, [
            'type'          => $type,
            'single'        => true,
            'show_in_rest'  => true,
            'auth_callback' => fn() => current_user_can('edit_posts'),
        ]);
    }
});

/* ─── Auto-generate _aem_path on save ────────────────────────────────── */

add_action('save_post_article', function (int $post_id) {
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
    if (wp_is_post_revision($post_id)) return;

    $slug = get_post_field('post_name', $post_id);
    if (!$slug) return;

    $path = "/content/dam/aem-headless-demo/articles/{$slug}";
    $current = get_post_meta($post_id, '_aem_path', true);

    if ($current !== $path) {
        update_post_meta($post_id, '_aem_path', $path);
    }
}, 20);

/* ─── Admin meta boxes ───────────────────────────────────────────────── */

add_action('add_meta_boxes', function () {
    add_meta_box(
        'aem_article_fields',
        'AEM Content Fragment Fields',
        'aem_article_meta_box',
        'article',
        'normal',
        'high'
    );
});

function aem_article_meta_box(WP_Post $post): void {
    wp_nonce_field('aem_article_meta', 'aem_article_nonce');

    $fields = [
        '_aem_path'      => ['label' => 'AEM Path', 'type' => 'text', 'readonly' => true, 'description' => 'Auto-generated from slug'],
        'author_name'    => ['label' => 'Author Name', 'type' => 'text'],
        'publish_date'   => ['label' => 'Publish Date', 'type' => 'datetime-local'],
        'body_html'      => ['label' => 'Body (HTML)', 'type' => 'textarea'],
        'body_plaintext' => ['label' => 'Body (Plaintext)', 'type' => 'textarea'],
    ];

    echo '<table class="form-table">';
    foreach ($fields as $key => $field) {
        $value = get_post_meta($post->ID, $key, true);
        $readonly = !empty($field['readonly']) ? 'readonly style="background:#f0f0f0"' : '';
        echo '<tr>';
        echo '<th><label for="' . esc_attr($key) . '">' . esc_html($field['label']) . '</label></th>';
        echo '<td>';
        if ($field['type'] === 'textarea') {
            echo '<textarea id="' . esc_attr($key) . '" name="' . esc_attr($key) . '" rows="6" class="large-text" ' . $readonly . '>' . esc_textarea($value) . '</textarea>';
        } else {
            echo '<input type="' . esc_attr($field['type']) . '" id="' . esc_attr($key) . '" name="' . esc_attr($key) . '" value="' . esc_attr($value) . '" class="regular-text" ' . $readonly . ' />';
        }
        if (!empty($field['description'])) {
            echo '<p class="description">' . esc_html($field['description']) . '</p>';
        }
        echo '</td></tr>';
    }
    echo '</table>';
}

/* ─── Save meta box data ─────────────────────────────────────────────── */

add_action('save_post_article', function (int $post_id) {
    if (!isset($_POST['aem_article_nonce'])) return;
    if (!wp_verify_nonce($_POST['aem_article_nonce'], 'aem_article_meta')) return;
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;

    $editable = ['author_name', 'publish_date', 'body_html', 'body_plaintext'];
    foreach ($editable as $key) {
        if (isset($_POST[$key])) {
            update_post_meta($post_id, $key, sanitize_textarea_field($_POST[$key]));
        }
    }
}, 10);

/* ─── Helper: Convert article post to ArticleModel array ─────────────── */

function aem_article_to_model(WP_Post $post): array {
    $tags = wp_get_object_terms($post->ID, 'article_tag', ['fields' => 'slugs']);

    return [
        '_path'       => get_post_meta($post->ID, '_aem_path', true) ?: "/content/dam/aem-headless-demo/articles/{$post->post_name}",
        'title'       => $post->post_title,
        'body'        => [
            'html'      => get_post_meta($post->ID, 'body_html', true) ?: apply_filters('the_content', $post->post_content),
            'plaintext' => get_post_meta($post->ID, 'body_plaintext', true) ?: wp_strip_all_tags($post->post_content),
        ],
        'author'      => get_post_meta($post->ID, 'author_name', true) ?: '',
        'publishDate' => get_post_meta($post->ID, 'publish_date', true) ?: get_the_date('c', $post),
        'tags'        => is_array($tags) ? $tags : [],
    ];
}
