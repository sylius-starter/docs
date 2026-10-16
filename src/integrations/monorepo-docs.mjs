import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, watch, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Copies the Markdown documentation of the sylius-starter monorepo into the Starlight content collection.
 *
 * The monorepo `docs/` folder stays the source of truth, so its pages keep reading on GitHub: the copy lands in
 * `src/content/docs/` (git-ignored) with its images, each page gets an `editUrl` pointing back to the monorepo, and the
 * images are also copied to `public/images/` for the raw HTML `<img>` tags of the pages. In dev, the copy follows the
 * changes.
 */
export default function monorepoDocs({ source, repository, branch = 'main' }) {
    return {
        name: 'monorepo-docs',
        hooks: {
            'astro:config:setup': ({ command, config, logger }) => {
                const root = fileURLToPath(config.root);
                const sourceDir = resolve(root, source);
                const contentDir = join(root, 'src/content/docs');
                const imagesDir = join(root, 'public/images');

                if (!existsSync(sourceDir)) {
                    throw new Error(
                        `Documentation not found in "${sourceDir}". Clone sylius-starter/sylius-starter next to this repository, or set DOCS_DIR.`,
                    );
                }

                const copyPage = (file) => {
                    const path = relative(sourceDir, file);
                    const target = join(contentDir, path);
                    mkdirSync(dirname(target), { recursive: true });
                    writeFileSync(target, withEditUrl(readFileSync(file, 'utf8'), `https://github.com/${repository}/edit/${branch}/docs/${path}`));
                };

                const sync = () => {
                    rmSync(contentDir, { recursive: true, force: true });
                    rmSync(imagesDir, { recursive: true, force: true });
                    markdownFiles(sourceDir).forEach(copyPage);
                    if (existsSync(join(sourceDir, 'images'))) {
                        // Markdown images are optimized by Astro next to the pages, raw HTML ones are served as is.
                        cpSync(join(sourceDir, 'images'), join(contentDir, 'images'), { recursive: true });
                        cpSync(join(sourceDir, 'images'), imagesDir, { recursive: true });
                    }
                };

                sync();
                logger.info(`Synced the documentation from ${sourceDir}`);

                if (command !== 'dev') {
                    return;
                }

                watch(sourceDir, { recursive: true }, (_event, filename) => {
                    if (!filename) {
                        return;
                    }
                    const file = join(sourceDir, filename);
                    if (filename.endsWith('.md') && existsSync(file)) {
                        copyPage(file);
                    } else {
                        sync();
                    }
                });
            },
        },
    };
}

function markdownFiles(dir) {
    return readdirSync(dir).flatMap((name) => {
        const path = join(dir, name);
        if (statSync(path).isDirectory()) {
            return markdownFiles(path);
        }

        return name.endsWith('.md') ? [path] : [];
    });
}

function withEditUrl(content, editUrl) {
    if (!content.startsWith('---\n') || /^editUrl:/m.test(content.split('\n---\n')[0])) {
        return content;
    }

    return content.replace('---\n', `---\neditUrl: ${editUrl}\n`);
}
