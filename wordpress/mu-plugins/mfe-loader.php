<?php
/**
 * Plugin Name: Microfrontend Loader
 * Description: Registry and loader for microfrontend IIFE bundles served as web components.
 * Version: 1.0.0
 */

defined('ABSPATH') || exit;

define('MFE_BUNDLES_DIR', __DIR__ . '/mfe-bundles');
define('MFE_BUNDLES_URL', content_url('mu-plugins/mfe-bundles'));
define('MFE_OPTION_KEY', 'mfe_registered_bundles');

/* ─── Default bundles (registered on first load) ─────────────────────── */

function mfe_get_defaults(): array {
    return [
        'aem-articles' => [
            'label'    => 'AEM Articles',
            'script'   => MFE_BUNDLES_URL . '/aem-articles/web-components.js',
            'elements' => ['aem-headless-app', 'aem-article-list', 'aem-article-detail'],
            'load_on'  => 'all',
        ],
    ];
}

function mfe_get_bundles(): array {
    $bundles = get_option(MFE_OPTION_KEY);
    if (!is_array($bundles) || empty($bundles)) {
        $bundles = mfe_get_defaults();
        update_option(MFE_OPTION_KEY, $bundles);
    }
    return $bundles;
}

/* ─── Script enqueuing ───────────────────────────────────────────────── */

add_action('wp_enqueue_scripts', function () {
    $bundles = mfe_get_bundles();
    foreach ($bundles as $slug => $bundle) {
        if ($bundle['load_on'] === 'all' || mfe_page_uses_bundle($slug, $bundle)) {
            wp_enqueue_script(
                "mfe-{$slug}",
                $bundle['script'],
                [],
                null,
                true
            );
        }
    }
});

function mfe_page_uses_bundle(string $slug, array $bundle): bool {
    global $post;
    if (!$post) return false;
    foreach ($bundle['elements'] as $el) {
        if (has_shortcode($post->post_content, 'mfe') && strpos($post->post_content, $el) !== false) {
            return true;
        }
    }
    return false;
}

/* ─── [mfe] shortcode ────────────────────────────────────────────────── */

add_shortcode('mfe', function ($atts) {
    $atts = shortcode_atts([
        'element' => '',
        'attrs'   => '',
        'style'   => 'display:block;min-height:200px',
    ], $atts);

    $element = sanitize_key($atts['element']);
    if (!$element) return '<!-- mfe: missing element attribute -->';

    // Parse key=value pairs from attrs
    $html_attrs = '';
    if ($atts['attrs']) {
        foreach (explode(' ', $atts['attrs']) as $pair) {
            $parts = explode('=', $pair, 2);
            if (count($parts) === 2) {
                $html_attrs .= sprintf(' %s="%s"', esc_attr($parts[0]), esc_attr($parts[1]));
            }
        }
    }

    return sprintf(
        '<%s%s style="%s"></%s>',
        $element,
        $html_attrs,
        esc_attr($atts['style']),
        $element
    );
});

/* ─── Gutenberg block: mfe/component ─────────────────────────────────── */

add_action('init', function () {
    if (!function_exists('register_block_type')) return;

    // Register editor script (no build step — uses wp globals)
    wp_register_script(
        'mfe-block-editor',
        content_url('mu-plugins/mfe-block-editor.js'),
        ['wp-blocks', 'wp-element', 'wp-block-editor', 'wp-components'],
        filemtime(MFE_BUNDLES_DIR . '/../mfe-block-editor.js'),
        true
    );

    // Pass registered elements to JS for the dropdown
    $elements = [];
    foreach (mfe_get_bundles() as $slug => $bundle) {
        foreach ($bundle['elements'] as $el) {
            $elements[] = ['element' => $el, 'bundle' => $bundle['label']];
        }
    }
    wp_localize_script('mfe-block-editor', 'mfeBlockData', [
        'elements'   => $elements,
        'previewUrl' => home_url('/'),
    ]);

    register_block_type('mfe/component', [
        'api_version'     => 3,
        'editor_script'   => 'mfe-block-editor',
        'render_callback' => 'mfe_render_block',
        'attributes'      => [
            'element' => ['type' => 'string', 'default' => ''],
            'attrs'   => ['type' => 'string', 'default' => ''],
            'style'   => ['type' => 'string', 'default' => 'display:block;min-height:200px'],
        ],
    ]);
});

function mfe_render_block(array $attributes): string {
    return do_shortcode(sprintf(
        '[mfe element="%s" attrs="%s" style="%s"]',
        esc_attr($attributes['element']),
        esc_attr($attributes['attrs']),
        esc_attr($attributes['style'])
    ));
}

/* ─── MFE Preview endpoint (used by block editor iframe) ─────────────── */

add_action('template_redirect', function () {
    if (empty($_GET['mfe_preview']) || $_GET['mfe_preview'] !== '1') return;

    $element = isset($_GET['element']) ? sanitize_key($_GET['element']) : '';
    if (!$element) {
        wp_die('Missing element parameter', 'MFE Preview Error', ['response' => 400]);
    }

    $raw_attrs = isset($_GET['attrs']) ? sanitize_text_field(wp_unslash($_GET['attrs'])) : '';
    $style     = isset($_GET['style']) ? esc_attr(sanitize_text_field(wp_unslash($_GET['style']))) : 'display:block;min-height:200px';

    // Build HTML attributes string
    $html_attrs = '';
    if ($raw_attrs) {
        foreach (explode(' ', $raw_attrs) as $pair) {
            $parts = explode('=', $pair, 2);
            if (count($parts) === 2) {
                $html_attrs .= sprintf(' %s="%s"', esc_attr($parts[0]), esc_attr($parts[1]));
            }
        }
    }

    // Find the matching bundle script URL
    $script_url = '';
    foreach (mfe_get_bundles() as $bundle) {
        if (in_array($element, $bundle['elements'], true)) {
            $script_url = $bundle['script'];
            break;
        }
    }

    // Render minimal HTML page
    header('Content-Type: text/html; charset=utf-8');
    echo '<!DOCTYPE html><html><head>';
    echo '<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">';
    echo '<script src="https://cdn.tailwindcss.com"></' . 'script>';
    echo '<style>body{margin:16px;font-family:system-ui,sans-serif}</style>';
    echo '</head><body>';
    echo sprintf('<%s%s style="%s"></%s>', $element, $html_attrs, $style, $element);
    if ($script_url) {
        echo sprintf('<script src="%s"></' . 'script>', esc_url($script_url));
    }
    echo '</body></html>';
    exit;
});

/* ─── Admin settings page ────────────────────────────────────────────── */

add_action('admin_menu', function () {
    add_options_page(
        'Microfrontends',
        'Microfrontends',
        'manage_options',
        'mfe-settings',
        'mfe_settings_page'
    );
});

function mfe_settings_page(): void {
    if (!current_user_can('manage_options')) return;

    // Handle form save
    if (isset($_POST['mfe_save']) && check_admin_referer('mfe_settings')) {
        $bundles = mfe_get_bundles();
        // Handle new bundle addition
        if (!empty($_POST['mfe_new_slug'])) {
            $slug = sanitize_key($_POST['mfe_new_slug']);
            $bundles[$slug] = [
                'label'    => sanitize_text_field($_POST['mfe_new_label'] ?? $slug),
                'script'   => esc_url_raw($_POST['mfe_new_script'] ?? ''),
                'elements' => array_map('sanitize_key', array_filter(explode(',', $_POST['mfe_new_elements'] ?? ''))),
                'load_on'  => sanitize_key($_POST['mfe_new_load_on'] ?? 'all'),
            ];
        }
        update_option(MFE_OPTION_KEY, $bundles);
        echo '<div class="notice notice-success"><p>Settings saved.</p></div>';
    }

    // Handle delete
    if (isset($_GET['mfe_delete']) && check_admin_referer('mfe_delete')) {
        $bundles = mfe_get_bundles();
        unset($bundles[sanitize_key($_GET['mfe_delete'])]);
        update_option(MFE_OPTION_KEY, $bundles);
        echo '<div class="notice notice-success"><p>Bundle removed.</p></div>';
    }

    $bundles = mfe_get_bundles();
    ?>
    <div class="wrap">
        <h1>Microfrontend Bundles</h1>
        <p>Registered IIFE bundles that provide web component custom elements.</p>

        <table class="widefat striped" style="max-width:900px">
            <thead>
                <tr>
                    <th>Slug</th>
                    <th>Label</th>
                    <th>Script URL</th>
                    <th>Elements</th>
                    <th>Load On</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($bundles as $slug => $b): ?>
                <tr>
                    <td><code><?php echo esc_html($slug); ?></code></td>
                    <td><?php echo esc_html($b['label']); ?></td>
                    <td style="max-width:250px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="<?php echo esc_attr($b['script']); ?>">
                        <?php echo esc_html($b['script']); ?>
                    </td>
                    <td><code><?php echo esc_html(implode(', ', $b['elements'])); ?></code></td>
                    <td><?php echo esc_html($b['load_on']); ?></td>
                    <td>
                        <a href="<?php echo wp_nonce_url(admin_url("options-general.php?page=mfe-settings&mfe_delete={$slug}"), 'mfe_delete'); ?>"
                           onclick="return confirm('Remove this bundle?')"
                           class="button button-small">Remove</a>
                    </td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>

        <h2 style="margin-top:2em">Register New Bundle</h2>
        <form method="post">
            <?php wp_nonce_field('mfe_settings'); ?>
            <table class="form-table">
                <tr>
                    <th><label for="mfe_new_slug">Slug</label></th>
                    <td><input type="text" id="mfe_new_slug" name="mfe_new_slug" class="regular-text" placeholder="my-widget" /></td>
                </tr>
                <tr>
                    <th><label for="mfe_new_label">Label</label></th>
                    <td><input type="text" id="mfe_new_label" name="mfe_new_label" class="regular-text" placeholder="My Widget" /></td>
                </tr>
                <tr>
                    <th><label for="mfe_new_script">Script URL</label></th>
                    <td><input type="url" id="mfe_new_script" name="mfe_new_script" class="large-text" placeholder="<?php echo esc_attr(MFE_BUNDLES_URL); ?>/my-widget/bundle.js" /></td>
                </tr>
                <tr>
                    <th><label for="mfe_new_elements">Custom Elements</label></th>
                    <td><input type="text" id="mfe_new_elements" name="mfe_new_elements" class="regular-text" placeholder="my-widget,my-other-widget" />
                    <p class="description">Comma-separated list of custom element tag names.</p></td>
                </tr>
                <tr>
                    <th><label for="mfe_new_load_on">Load On</label></th>
                    <td>
                        <select id="mfe_new_load_on" name="mfe_new_load_on">
                            <option value="all">All pages</option>
                            <option value="shortcode">Only pages using its elements</option>
                        </select>
                    </td>
                </tr>
            </table>
            <p><input type="submit" name="mfe_save" class="button button-primary" value="Register Bundle" /></p>
        </form>

        <h2 style="margin-top:2em">Usage</h2>
        <p><strong>Shortcode:</strong></p>
        <pre>[mfe element="aem-headless-app" attrs="aem-host=http://localhost:3000"]</pre>
        <p><strong>Gutenberg:</strong> Add an "MFE Component" block and set the element name and attributes.</p>
    </div>
    <?php
}
