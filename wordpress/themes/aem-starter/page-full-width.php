<?php
/**
 * Template Name: Full Width
 * Description: Full-width layout for microfrontend-heavy pages.
 */

get_header();
?>

<main class="flex-1 w-full px-4 py-8">
    <?php if (have_posts()): while (have_posts()): the_post(); ?>
        <div class="prose-headings:mb-4 max-w-none">
            <?php the_content(); ?>
        </div>
    <?php endwhile; endif; ?>
</main>

<?php get_footer(); ?>
