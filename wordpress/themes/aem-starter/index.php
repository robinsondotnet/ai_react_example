<?php get_header(); ?>

<main class="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
    <?php if (have_posts()): while (have_posts()): the_post(); ?>
        <article>
            <h2 class="text-2xl font-bold mb-2">
                <a href="<?php the_permalink(); ?>" class="hover:text-blue-600"><?php the_title(); ?></a>
            </h2>
            <div class="text-gray-600 mb-6"><?php the_excerpt(); ?></div>
        </article>
    <?php endwhile; endif; ?>
</main>

<?php get_footer(); ?>
