import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(160),
    pubDate: z.date(),
    updatedDate: z.date().optional(),
    tags: z.array(z.enum(['homelab', 'claude', 'networking'])),
    draft: z.boolean().default(false),
    symptom: z.string().optional(),
    cause: z.string().optional(),
    stack: z.array(z.string()).default([]),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(160),
    url: z.string().url().optional(),
    repo: z.string().url().optional(),
    stack: z.array(z.string()).default([]),
    status: z.enum(['active', 'maintained', 'archived']).default('active'),
    order: z.number().default(0),
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts, projects };
