import { Skia } from "@shopify/react-native-skia";
import { rgbToMunsell } from "./munsellLookup";
import { getSamplingRect, type OverlayRect } from "./cameraOverlay";

/**
 * RGB color object (sRGB, 0-255).
 */
interface RGBColor {
  r: number;
  g: number;
  b: number;
}

/**
 * Linear-light RGB (0..1). Color math (averaging, white balance) is done here
 * because averaging gamma-encoded sRGB bytes biases the result; only the final
 * value is re-encoded back to sRGB.
 */
interface LinearRGB {
  r: number;
  g: number;
  b: number;
}

/**
 * Munsell color object
 */
interface MunsellColor {
  full: string; // e.g., "7.5YR 6/4"
}

// sRGB <-> linear transfer functions (per channel, operating on 0..1 values).
const srgbToLinear = (c: number): number =>
  c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

const linearToSrgb = (c: number): number =>
  c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;

// Precomputed sRGB-byte -> linear lookup. Pixel data is 8-bit, so there are
// only 256 possible inputs; this turns a Math.pow per channel per pixel
// (millions over the grey-card region) into a single array index. Values are
// identical to srgbToLinear(byte / 255).
const SRGB8_TO_LINEAR = new Float32Array(256);
for (let i = 0; i < 256; i++) SRGB8_TO_LINEAR[i] = srgbToLinear(i / 255);

// Target neutral for the 18% grey card, kept equivalent to sRGB 128 but
// expressed in linear light so the correction is applied photometrically.
const TARGET_GREY_LINEAR = srgbToLinear(128 / 255);

/** Encode a linear-light color back to an sRGB 0-255 integer triplet. */
const linearToSrgb255 = (c: LinearRGB): RGBColor => {
  const enc = (v: number) =>
    Math.max(
      0,
      Math.min(
        255,
        Math.round(linearToSrgb(Math.max(0, Math.min(1, v))) * 255),
      ),
    );
  return { r: enc(c.r), g: enc(c.g), b: enc(c.b) };
};

/**
 * Calculate per-channel correction factors in linear light, based on the grey
 * card. An 18% grey card should sit at TARGET_GREY_LINEAR after correction.
 */
const calculateCorrectionFactors = (greyCardLinear: LinearRGB): LinearRGB => {
  return {
    r: greyCardLinear.r > 0 ? TARGET_GREY_LINEAR / greyCardLinear.r : 1,
    g: greyCardLinear.g > 0 ? TARGET_GREY_LINEAR / greyCardLinear.g : 1,
    b: greyCardLinear.b > 0 ? TARGET_GREY_LINEAR / greyCardLinear.b : 1,
  };
};

/**
 * Apply linear-light correction factors to a linear-light color (clamped 0..1).
 */
const applyCorrectionToColor = (
  color: LinearRGB,
  factors: LinearRGB,
): LinearRGB => {
  return {
    r: Math.max(0, Math.min(1, color.r * factors.r)),
    g: Math.max(0, Math.min(1, color.g * factors.g)),
    b: Math.max(0, Math.min(1, color.b * factors.b)),
  };
};

/**
 * Extract the average color of an image region in linear light.
 * Each sRGB byte is linearized before being summed, so the mean is a true
 * radiometric average rather than a gamma-biased one.
 */
const extractColorFromRegion = async (
  pixels: Uint8Array | Float32Array,
  rect: OverlayRect,
  imageWidth: number,
  imageHeight: number,
): Promise<LinearRGB> => {
  try {
    if (!pixels) {
      throw new Error("Pixels data is null or undefined");
    }

    let rSum = 0,
      gSum = 0,
      bSum = 0;
    let pixelCount = 0;

    // Ensure rect is within bounds
    const startY = Math.max(0, rect.top);
    const endY = Math.min(imageHeight, rect.top + rect.height);
    const startX = Math.max(0, rect.left);
    const endX = Math.min(imageWidth, rect.left + rect.width);

    // Assumes RGBA byte order from Skia.Image.readPixels(). This is the
    // documented default for react-native-skia on iOS and Android — if a
    // future Skia/platform returns BGRA the channel mapping below would
    // need to swap pixels[i] and pixels[i+2].
    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        // Each pixel is 4 bytes (RGBA); linearize (via LUT) before accumulating.
        const pixelIndex = (y * imageWidth + x) * 4;
        rSum += SRGB8_TO_LINEAR[pixels[pixelIndex]];
        gSum += SRGB8_TO_LINEAR[pixels[pixelIndex + 1]];
        bSum += SRGB8_TO_LINEAR[pixels[pixelIndex + 2]];
        // pixels[pixelIndex + 3] is alpha channel (ignored)
        pixelCount++;
      }
    }

    if (pixelCount === 0) {
      return { r: 0, g: 0, b: 0 };
    }

    return {
      r: rSum / pixelCount,
      g: gSum / pixelCount,
      b: bSum / pixelCount,
    };
  } catch (error) {
    console.error("Error extracting color from region:", error);
    throw error;
  }
};

/**
 * Main function: Color correct image and extract soil sample color.
 *
 * @param imageUri     URI of the captured photo.
 * @param previewAspect Width/height of the on-screen camera preview. The preview
 *   is center-cropped ("cover") to fill the screen, so the analyzed frame is
 *   constrained to this aspect ratio to make the sampled pixels match the guide
 *   boxes the user lined up against.
 */
export const extractSoilColor = async (
  imageUri: string,
  previewAspect?: number,
): Promise<{
  correctedColor: RGBColor;
  correctedColorMunsell: MunsellColor;
  greyCardColor: RGBColor;
  correctionFactors: LinearRGB;
}> => {
  const data = await Skia.Data.fromURI(imageUri);
  const image = Skia.Image.MakeImageFromEncoded(data);

  if (!image) {
    throw new Error("Failed to decode image");
  }

  try {
    const pixels = image.readPixels();

    if (!pixels) {
      throw new Error("Failed to read image pixels");
    }

    const actualWidth = image.width();
    const actualHeight = image.height();

    // Get grey card region color (linear light)
    const greyCardRect = getSamplingRect(
      "greyCard",
      actualWidth,
      actualHeight,
      previewAspect,
    );
    const greyCardLinear = await extractColorFromRegion(
      pixels,
      greyCardRect,
      actualWidth,
      actualHeight,
    );

    // Calculate correction factors (linear light)
    const correctionFactors = calculateCorrectionFactors(greyCardLinear);

    // Get soil sample region color (linear light)
    const soilSampleRect = getSamplingRect(
      "soilSample",
      actualWidth,
      actualHeight,
      previewAspect,
    );
    const soilLinear = await extractColorFromRegion(
      pixels,
      soilSampleRect,
      actualWidth,
      actualHeight,
    );

    // Apply white-balance correction in linear light, then re-encode to sRGB.
    const correctedLinear = applyCorrectionToColor(
      soilLinear,
      correctionFactors,
    );
    const correctedRGB = linearToSrgb255(correctedLinear);
    const correctedMunsell = rgbToMunsell(correctedRGB);

    return {
      correctedColor: correctedRGB,
      correctedColorMunsell: correctedMunsell,
      greyCardColor: linearToSrgb255(greyCardLinear),
      correctionFactors,
    };
  } finally {
    // Release native image memory so repeated captures don't leak.
    image.dispose();
  }
};
