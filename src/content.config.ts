import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    image: z.string().optional(),
    imageBg: z.string().optional(),
    imagePosition: z.string().optional(),
    logoMode: z.boolean().optional(),
    images: z.array(z.string()).optional(),
    video: z.string().optional(),
    link: z.string().optional(),
    github: z.string().optional(),
    report: z.string().optional(),
    tags: z.array(z.string()).optional(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    date: z.string().optional(),
  }),
});

export const collections = { projects };
