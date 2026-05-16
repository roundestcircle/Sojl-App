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

/** Returns absolute pixel coordinates for an extractor-sample rectangle. */
export function getSamplingRect(
  type: "greyCard" | "soilSample",
  imageWidth: number,
  imageHeight: number,
): OverlayRect {
  const f = OVERLAY_FRACTIONS[type].sample;
  return {
    top: Math.floor(imageHeight * f.top),
    left: Math.floor(imageWidth * f.left),
    width: Math.floor(imageWidth * f.width),
    height: Math.floor(imageHeight * f.height),
  };
}
