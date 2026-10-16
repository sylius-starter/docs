import { dirname, posix, relative } from 'node:path';
import { visit } from 'unist-util-visit';

/**
 * Rewrites the relative links of the documentation pages, written for GitHub (`../commands/themes.md#anchor`,
 * `../images/canvas-homepage.png`), into site URLs (`/docs/commands/themes/#anchor`, `/docs/images/canvas-homepage.png`
 * with the `/docs/` base).
 */
export default function rehypeDocsLinks({ contentDir, base = '/' }) {
    const prefix = base.endsWith('/') ? base : `${base}/`;

    return (tree, file) => {
        if (!file.path || !file.path.startsWith(contentDir)) {
            return;
        }

        const pageDir = relative(contentDir, dirname(file.path)).split('\\').join('/');

        visit(tree, (node) => {
            if (node.type === 'element' && node.tagName === 'a' && typeof node.properties.href === 'string') {
                node.properties.href = rewritePage(node.properties.href, pageDir, prefix);
            }
            if (node.type === 'element' && node.tagName === 'img' && typeof node.properties.src === 'string') {
                node.properties.src = rewriteImage(node.properties.src, pageDir, prefix);
            }
            // HTML written in the Markdown (e.g. the theme gallery) is still a raw string at this point.
            if (node.type === 'raw') {
                node.value = node.value
                    .replace(/(<a\b[^>]*\shref=")([^"]+)"/g, (_, tag, href) => `${tag}${rewritePage(href, pageDir, prefix)}"`)
                    .replace(/(<img\b[^>]*\ssrc=")([^"]+)"/g, (_, tag, src) => `${tag}${rewriteImage(src, pageDir, prefix)}"`);
            }
        });
    };
}

function isRelative(url) {
    return !/^([a-z][a-z0-9+.-]*:|\/|#)/i.test(url);
}

function rewritePage(href, pageDir, prefix) {
    const [path, hash] = href.split('#');
    if (!isRelative(href) || !path.endsWith('.md')) {
        return href;
    }

    const slug = posix.normalize(posix.join(pageDir, path)).replace(/\.md$/, '').replace(/(^|\/)index$/, '');

    return `${prefix}${slug ? `${slug}/` : ''}${hash ? `#${hash}` : ''}`;
}

function rewriteImage(src, pageDir, prefix) {
    if (!isRelative(src) || !/\.(png|jpe?g|gif|svg|webp|avif)$/i.test(src)) {
        return src;
    }

    return prefix + posix.normalize(posix.join(pageDir, src));
}
