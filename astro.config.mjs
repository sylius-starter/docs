import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import starlight from '@astrojs/starlight';
import starlightLinksValidator from 'starlight-links-validator';
import starlightLlmsTxt from 'starlight-llms-txt';
import monorepoDocs from './src/integrations/monorepo-docs.mjs';
import rehypeDocsLinks from './src/integrations/rehype-docs-links.mjs';

// GitHub Pages project site of sylius-starter/docs: https://sylius-starter.github.io/docs/
const site = process.env.SITE_URL ?? 'https://sylius-starter.github.io';
const base = process.env.ASTRO_BASE ?? '/docs/';
// The docs/ folder of the sylius-starter/sylius-starter monorepo, checked out next to this repository by default.
const docsDir = process.env.DOCS_DIR ?? '../sylius-starter/docs';
const repository = 'sylius-starter/sylius-starter';

export default defineConfig({
  site,
  base,
  outDir: 'dist',
  markdown: {
    processor: unified({
      rehypePlugins: [
        [rehypeDocsLinks, { contentDir: fileURLToPath(new URL('./src/content/docs/', import.meta.url)), base }],
      ],
    }),
  },
  integrations: [
    monorepoDocs({ source: docsDir, repository }),
    starlight({
      title: 'Sylius Starter',
      description: 'Castor packages to build, configure and operate a Sylius application.',
      customCss: ['./src/styles/docs.css'],
      components: { MarkdownContent: './src/components/MarkdownContent.astro' },
      head: [
        { tag: 'link', attrs: { rel: 'preconnect', href: 'https://fonts.googleapis.com' } },
        { tag: 'link', attrs: { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true } },
        {
          tag: 'link',
          attrs: {
            rel: 'stylesheet',
            href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
          },
        },
      ],
      social: [{ icon: 'github', label: 'GitHub', href: `https://github.com/${repository}` }],
      sidebar: [
        { label: 'Introduction', slug: 'index' },
        { label: 'Getting started', items: [{ autogenerate: { directory: 'getting-started' } }] },
        { label: 'Commands', items: [{ autogenerate: { directory: 'commands' } }] },
        { label: 'Themes', collapsed: true, items: [{ autogenerate: { directory: 'themes' } }] },
        { label: 'E-commerce import', items: [{ autogenerate: { directory: 'import' } }] },
        { label: 'Extending', items: [{ autogenerate: { directory: 'extending' } }] },
        { label: 'Storefront slots', items: [{ autogenerate: { directory: 'storefront' } }] },
        { label: 'Contributing', collapsed: true, items: [{ autogenerate: { directory: 'contributing' } }] },
        { label: 'Sylius Starter website', link: 'https://sylius-starter.github.io/', attrs: { target: '_blank' } },
      ],
      plugins: [starlightLinksValidator(), starlightLlmsTxt()],
    }),
  ],
});
