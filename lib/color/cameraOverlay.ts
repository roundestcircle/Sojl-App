/**
 * Camera overlay rectangle definitions — the single source of the guide boxes
 * drawn over the camera preview (PictureTaker.tsx) and of the regions the
 * colour extractor (soilColorExtractor.ts) averages.
 *
 * Grey card: the guide box spans 0.25–0.75 of the visible frame height, but
 * only its top band (0.25–0.60) is sampled. The band is deliberately
 * top-aligned, not centred: the soil box (0.65–0.75) sits inside the grey-card
 * box, and a centred band (0.325–0.675) would overlap it and mix soil pixels
 * into the grey reference. The 0.60 lower edge leaves a small margin above the
 * soil box.
 *
 * Soil sample: guide box and sampled region are identical.
 */

export type OverlayRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

export type OverlayRegion = "greyCard" | "soilSample";

/** Soil box; shown and sampled with the same rectangle. */
const SOIL_SAMPLE: OverlayRect = {
  top: 0.65,
  left: 0.42,
  width: 0.16,
  height: 0.1,
};

/**
 * Guide boxes drawn over the preview, as fractions (0–1) of the visible frame
 * width/height.
 */
export const OVERLAY_DISPLAY: Readonly<Record<OverlayRegion, OverlayRect>> = {
  greyCard: { top: 0.25, left: 0.2, width: 0.6, height: 0.5 },
  soilSample: SOIL_SAMPLE,
};

/**
 * Regions the extractor averages, as fractions (0–1) of the visible frame.
 * See the file comment for why the grey-card band is top-aligned.
 */
export const OVERLAY_SAMPLE: Readonly<Record<OverlayRegion, OverlayRect>> = {
  greyCard: { top: 0.25, left: 0.2, width: 0.6, height: 0.35 },
  soilSample: SOIL_SAMPLE,
};

/**
 * True when photo and preview have the same orientation (both portrait or
 * both landscape). On Android the captured JPEG can come out in landscape
 * while the preview — and thus the overlay — is portrait; the sampling
 * rectangles would then hit the wrong part of the photo.
 */
export function orientationMatches(
  imageWidth: number,
  imageHeight: number,
  previewAspect: number,
): boolean {
  return imageWidth > imageHeight === previewAspect > 1;
}

/**
 * Returns absolute pixel coordinates for an extractor sampling rectangle.
 *
 * The camera preview fills the screen with a centre crop ("cover"): only the
 * part of the sensor frame matching the preview's aspect ratio is visible, yet
 * the captured photo keeps the full frame. The overlay fractions are relative
 * to what the user sees, so the visible (centre-cropped) region of the photo
 * is derived from `previewAspect` (width / height of the on-screen preview)
 * first, and the fractional rectangle is placed inside it. This makes the
 * sampled pixels line up with the guide boxes the user aimed with.
 */
export function getSamplingRect(
  type: OverlayRegion,
  imageWidth: number,
  imageHeight: number,
  previewAspect: number,
): OverlayRect {
  if (!(previewAspect > 0) || !Number.isFinite(previewAspect)) {
    throw new Error(`Invalid previewAspect: ${previewAspect}`);
  }

  // Visible (centre-cropped) region of the photo.
  let visWidth = imageWidth;
  let visHeight = imageHeight;
  let offsetX = 0;
  let offsetY = 0;

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

  const f = OVERLAY_SAMPLE[type];
  return {
    top: Math.floor(offsetY + visHeight * f.top),
    left: Math.floor(offsetX + visWidth * f.left),
    width: Math.floor(visWidth * f.width),
    height: Math.floor(visHeight * f.height),
  };
}
