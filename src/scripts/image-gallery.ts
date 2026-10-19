import PhotoSwipeLightbox from 'photoswipe/lightbox';
import 'photoswipe/style.css';

/**
 * Opens the Markdown images of a page (wrapped in `a.image-link` by rehype-docs-links) in a PhotoSwipe lightbox, as one
 * gallery: arrows, keyboard and swipe go from one screenshot to the next.
 *
 * The theme screenshots are full pages, far taller than the screen: they open at the width of the screen, from the top
 * of the page, and the mouse wheel scrolls them. A click toggles the whole image.
 *
 * The thumbnails of the theme overview cards (`<a href="canvas.md"><img width="140"></a>`) join the gallery too, so the
 * homepages of every theme can be browsed in a row; the caption links to the theme page.
 */
const items = 'a.image-link, td:first-child > a:has(> img[width])';

export function initImageGallery(): void {
    const content = document.querySelector('.sl-markdown-content');

    if (!content?.querySelector(items)) {
        return;
    }

    const lightbox = new PhotoSwipeLightbox({
        gallery: content as HTMLElement,
        children: items,
        pswpModule: () => import('photoswipe'),
        initialZoomLevel: (zoomLevel) => Math.min(1, zoomLevel.panAreaSize.x / zoomLevel.elementSize.x),
        secondaryZoomLevel: 'fit',
        maxZoomLevel: 2,
        wheelToZoom: false,
        bgOpacity: 0.92,
    });

    // The image in the page is the full-size file, scaled down by CSS: it gives the real size.
    lightbox.addFilter('domItemData', (itemData, element, linkEl) => {
        const img = linkEl.querySelector('img');

        if (img) {
            itemData.src = img.src;
            itemData.msrc = img.currentSrc || img.src;
            itemData.w = img.naturalWidth || img.width;
            itemData.h = img.naturalHeight || img.height;
            itemData.alt = img.alt;
            // An overview thumbnail links to its theme page, not to the image.
            itemData.page = linkEl.classList.contains('image-link') ? undefined : linkEl.href;
        }

        return itemData;
    });

    lightbox.on('uiRegister', () => {
        lightbox.pswp?.ui?.registerElement({
            name: 'caption',
            order: 9,
            isButton: false,
            appendTo: 'root',
            onInit: (el, pswp) => {
                pswp.on('change', () => {
                    const data = pswp.currSlide?.data;

                    el.replaceChildren(data?.alt ?? '');

                    if (data?.page) {
                        const link = document.createElement('a');
                        link.href = data.page;
                        link.textContent = 'See the theme →';
                        el.append(' · ', link);
                    }
                });
            },
        });
    });

    // Start a tall screenshot at the top of the page rather than in its middle.
    lightbox.on('initialZoomPan', ({ slide }) => {
        // PhotoSwipe names the top bound "min" (pan offsets go negative as the image moves up).
        slide.pan.y = slide.bounds.min.y;
    });

    lightbox.init();
}
