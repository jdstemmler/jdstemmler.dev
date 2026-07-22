import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = (await getCollection('posts', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );

  return rss({
    title: 'jdstemmler.dev',
    description:
      'Homelab, self-hosting, and Claude Code — write-ups of specific fixes, with the wrong hypothesis named first.',
    site: context.site!,
    xmlns: { atom: 'http://www.w3.org/2005/Atom' },
    customData:
      '<atom:link href="https://jdstemmler.dev/rss.xml" rel="self" type="application/rss+xml"/>',
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      link: `/posts/${post.id}/`,
      // The diagnostic strip drives the feed summary, per the site's content model.
      description:
        post.data.symptom && post.data.cause
          ? `SYMPTOM: ${post.data.symptom}\nCAUSE: ${post.data.cause}`
          : post.data.description,
    })),
  });
}
