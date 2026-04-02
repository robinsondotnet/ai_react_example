<!DOCTYPE html>
<html <?php language_attributes(); ?> class="h-full">
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <?php wp_head(); ?>
</head>
<body <?php body_class('min-h-full flex flex-col bg-gray-50 text-gray-900 antialiased'); ?>>
<?php wp_body_open(); ?>

<header class="bg-white border-b border-gray-200">
    <div class="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <a href="<?php echo esc_url(home_url('/')); ?>" class="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
            <?php bloginfo('name'); ?>
        </a>
        <?php if (has_nav_menu('primary')): ?>
        <nav>
            <?php wp_nav_menu([
                'theme_location' => 'primary',
                'container'      => false,
                'menu_class'     => 'flex gap-6 text-sm font-medium text-gray-600',
                'depth'          => 1,
                'fallback_cb'    => false,
            ]); ?>
        </nav>
        <?php endif; ?>
    </div>
</header>
