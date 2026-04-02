<?php get_header(); ?>

<main class="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
    <?php if (have_posts()): while (have_posts()): the_post(); ?>
        <article>
            <h1 class="text-3xl font-bold mb-4"><?php the_title(); ?></h1>
            <div class="prose max-w-none">
                <?php the_content(); ?>
            </div>
        </article>
    <?php endwhile; endif; ?>
</main>

<?php get_footer(); ?>
