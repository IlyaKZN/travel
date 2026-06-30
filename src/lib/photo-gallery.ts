import PhotoSwipe from "photoswipe";
import "photoswipe/style.css";

export type PhotoGalleryItem = {
  src: string;
  width?: number;
  height?: number;
  alt?: string;
};

export type OpenPhotoGalleryOptions = {
  items: PhotoGalleryItem[];
  index?: number;
  thumbElement?: HTMLElement | null;
};

let activeInstance: PhotoSwipe | null = null;

function thumbImage(thumbElement?: HTMLElement | null) {
  if (!thumbElement) return undefined;
  return thumbElement instanceof HTMLImageElement
    ? thumbElement
    : thumbElement.querySelector("img") ?? thumbElement;
}

function loadImageSize(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = src;
  });
}

async function resolveItems(items: PhotoGalleryItem[]) {
  return Promise.all(
    items.map(async (item) => {
      if (item.width && item.height) {
        return { ...item, width: item.width, height: item.height };
      }

      try {
        const size = await loadImageSize(item.src);
        return { ...item, ...size };
      } catch {
        return { ...item, width: 1600, height: 1200 };
      }
    }),
  );
}

export async function openPhotoGallery({
  items,
  index = 0,
  thumbElement,
}: OpenPhotoGalleryOptions) {
  if (items.length === 0) return;

  closePhotoGallery();

  const safeIndex = Math.min(Math.max(index, 0), items.length - 1);
  const resolved = await resolveItems(items);
  const thumb = thumbImage(thumbElement);

  const dataSource = resolved.map((item, i) => ({
    src: item.src,
    width: item.width!,
    height: item.height!,
    alt: item.alt ?? "изображение",
    element: i === safeIndex ? thumb : undefined,
  }));

  const pswp = new PhotoSwipe({
    dataSource,
    index: safeIndex,
    bgOpacity: 0.92,
    showHideAnimationType: "zoom",
    pinchToClose: true,
    closeOnVerticalDrag: true,
    padding: { top: 16, bottom: 24, left: 16, right: 16 },
    loop: items.length > 1,
    zoom: true,
    maxZoomLevel: 4,
    initialZoomLevel: "fit",
    secondaryZoomLevel: 2,
  });

  pswp.on("destroy", () => {
    if (activeInstance === pswp) {
      activeInstance = null;
    }
  });

  activeInstance = pswp;
  pswp.init();
}

export function closePhotoGallery() {
  activeInstance?.close();
  activeInstance = null;
}
