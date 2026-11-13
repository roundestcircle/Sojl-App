/**
 * Camera overlay rectangle definitions, shared between the UI overlay
 * (PictureTaker.tsx) and the color extractor (soilColorExtractor.ts).
 *
 * The extractor reads pixels from these regions; the UI draws white rectangles
 * over the camera preview so the user lines up the grey card / soil sample.
 *
 * NOTE: greyCard.height differs between UI and sampling — the UI shows a taller
 * rectangle (50 % of frame height) so the user has slack to line up; the
 * sampler reads a smaller centered band (35 %) to avoid edge artifacts.
 */

export type OverlayRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

/** Coordinates expressed as fractions of frame width/height (0–1). */
export const OVERLAY_FRACTIONS = {
  greyCard: {
    display: { top: 0.25, left: 0.2, width: 0.6, height: 0.5 },
    sample: { top: 0.25, left: 0.2, width: 0.6, height: 0.35 },
  },
  soilSample: {
    display: { top: 0.65, left: 0.42, width: 0.16, height: 0.1 },
    sample: { top: 0.65, left: 0.42, width: 0.16, height: 0.1 },
  },
} as const;

/**
 * Returns absolute pixel coordinates for an extractor-sample rectangle.
 *
 * The camera preview fills the screen with a center-crop ("cover"): only the
 * portion of the sensor frame matching the preview's aspect ratio is visible,
 * yet the captured photo keeps the full frame. The overlay fractions are
 * defined relative to what the user sees, so we first derive the visible
 * (center-cropped) region of the photo for the given preview aspect ratio and
 * place the fractional rectangle inside it. This makes the sampled pixels line
 * up with the guide boxes the user aimed with.
 *
 * `previewAspect` (width / height of the on-screen preview) is optional; when
 * omitted the fractions apply to the full photo (legacy behavior).
 */
export function getSamplingRect(
  type: "greyCard" | "soilSample",
  imageWidth: number,
  imageHeight: number,
  previewAspect?: number,
): OverlayRect {
  // Determine the visible (center-cropped) region of the photo.
  let visWidth = imageWidth;
  let visHeight = imageHeight;
  let offsetX = 0;
  let offsetY = 0;

  if (previewAspect && previewAspect > 0) {
    const photoAspect = imageWidth / imageHeight;
    if (photoAspect > previewAspect) {
      // Photo is wider than the preview -> sides are cropped off.
      visWidth = imageHeight * previewAspect;
      offsetX = (imageWidth - visWidth) / 2;
    } else {
      // Photo is taller than the preview -> top/bottom are cropped off.
      visHeight = imageWidth / previewAspect;
      offsetY = (imageHeight - visHeight) / 2;
    }
  }

  const f = OVERLAY_FRACTIONS[type].sample;
  return {
    top: Math.floor(offsetY + visHeight * f.top),
    left: Math.floor(offsetX + visWidth * f.left),
    width: Math.floor(visWidth * f.width),
    height: Math.floor(visHeight * f.height),
  };
}
