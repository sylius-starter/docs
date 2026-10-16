# Sylius Starter documentation

The website of the [Sylius Starter](https://github.com/sylius-starter/sylius-starter) documentation, built with
[Astro Starlight](https://starlight.astro.build): [https://sylius-starter.github.io/docs/](https://sylius-starter.github.io/docs/).

The pages are **not** in this repository: they live in the `docs/` folder of the
[sylius-starter/sylius-starter](https://github.com/sylius-starter/sylius-starter/tree/main/docs) monorepo, next to the
code they describe, and read on GitHub too. Open documentation issues and pull requests there.

## Prerequisites

- Node.js 22.12+
- The monorepo cloned next to this repository (`../sylius-starter`), or `DOCS_DIR` pointing to its `docs/` folder

## Commands

```bash
npm install     # install dependencies
npm run dev     # http://localhost:4321/docs/, follows the changes of the monorepo docs/
npm run build   # output to dist/
npm run preview # http://localhost:4321/docs/ after build
```

## How it works

| What | Where |
|------|-------|
| Pages | `docs/` of the monorepo |
| Sidebar | `starlight.sidebar` in `astro.config.mjs` |
| Styles | `src/styles/docs.css` (palette of the [landing](https://sylius-starter.github.io/)) |
| Copy of the pages | `src/integrations/monorepo-docs.mjs` |
| Links rewriting | `src/integrations/rehype-docs-links.mjs` |

On `dev` and `build`, `src/integrations/monorepo-docs.mjs` copies the monorepo pages to `src/content/docs/`
(git-ignored) and adds an `editUrl` pointing back to the monorepo to each page; in dev, it follows the changes. The
images are also copied to `public/images/` for the raw HTML `<img>` tags.

`src/integrations/rehype-docs-links.mjs` turns the relative GitHub links (`../commands/themes.md#anchor`) into site URLs
(`/docs/commands/themes/#anchor`), and `starlight-links-validator` fails the build on a broken link.
`starlight-llms-txt` publishes `llms.txt`, `llms-full.txt` and `llms-small.txt` for AI agents.

A new folder of the monorepo `docs/` needs a sidebar group in `astro.config.mjs`. The order of the pages in a group
comes from their `sidebar.order` frontmatter.

## Deployment

The workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) checks out this repository and the `docs/`
folder of the monorepo (`DOCS_DIR=.monorepo/docs`), builds the site with `withastro/action` and deploys `dist/` with
`actions/deploy-pages`. It runs:

- on push to `main`;
- on the `docs-updated` repository dispatch, sent by the `Publish the documentation` workflow of the monorepo when
  `docs/` changes on its `main` (requires its `DOCS_DISPATCH_TOKEN` secret);
- manually (*Run workflow*).

In the repository settings, **Settings → Pages → Build and deployment → Source** must be set to **GitHub Actions**.

## License

[MIT](LICENSE)
