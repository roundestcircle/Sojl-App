import { Skia } from "@shopify/react-native-skia";
import { rgbToMunsell } from "./munsellLookup";
import { getSamplingRect, type OverlayRect } from "./cameraOverlay";

/**
 * RGB color object
 */
interface RGBColor {
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

/**
 * Calculate color correction factors based on grey card
 * 18% grey card should have RGB values close to (128, 128, 128)
 */
const calculateCorrectionFactors = (greyCardColor: RGBColor): RGBColor => {
  const TARGET_GREY = 128; // Target value for 18% grey card in 0-255 range

  return {
    r: greyCardColor.r > 0 ? TARGET_GREY / greyCardColor.r : 1,
    g: greyCardColor.g > 0 ? TARGET_GREY / greyCardColor.g : 1,
    b: greyCardColor.b > 0 ? TARGET_GREY / greyCardColor.b : 1,
  };
};

/**
 * Apply color correction to extracted RGB values
 */
const applyCorrectionToColor = (
  color: RGBColor,
  factors: RGBColor,
): RGBColor => {
  return {
    r: Math.min(255, Math.round(color.r * factors.r)),
    g: Math.min(255, Math.round(color.g * factors.g)),
    b: Math.min(255, Math.round(color.b * factors.b)),
  };
};

/**
 * Extract average color from image region using Skia
 */
const extractColorFromRegion = async (
  pixels: Uint8Array | Float32Array,
  rect: OverlayRect,
  imageWidth: number,
  imageHeight: number,
): Promise<RGBColor> => {
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
        // Each pixel is 4 bytes (RGBA)
        const pixelIndex = (y * imageWidth + x) * 4;
        rSum += pixels[pixelIndex];
        gSum += pixels[pixelIndex + 1];
        bSum += pixels[pixelIndex + 2];
        // pixels[pixelIndex + 3] is alpha channel (ignored)
        pixelCount++;
      }
    }

    if (pixelCount === 0) {
      return { r: 0, g: 0, b: 0 };
    }

    return {
      r: Math.round(rSum / pixelCount),
      g: Math.round(gSum / pixelCount),
      b: Math.round(bSum / pixelCount),
    };
  } catch (error) {
    console.error("Error extracting color from region:", error);
    throw error;
  }
};

/**
 * Main function: Color correct image and extract soil sample color
 */
export const extractSoilColor = async (
  imageUri: string,
): Promise<{
  correctedColor: RGBColor;
  correctedColorMunsell: MunsellColor;
  greyCardColor: RGBColor;
  correctionFactors: RGBColor;
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

    // Get grey card region color
    const greyCardRect = getSamplingRect("greyCard", actualWidth, actualHeight);
    const greyCardColor = await extractColorFromRegion(
      pixels,
      greyCardRect,
      actualWidth,
      actualHeight,
    );

    // Calculate correction factors
    const correctionFactors = calculateCorrectionFactors(greyCardColor);

    // Get soil sample region color
    const soilSampleRect = getSamplingRect(
      "soilSample",
      actualWidth,
      actualHeight,
    );
    const correctedColor = await extractColorFromRegion(
      pixels,
      soilSampleRect,
      actualWidth,
      actualHeight,
    );

    // Apply manual correction to the extracted color
    const correctedRGB = applyCorrectionToColor(
      correctedColor,
      correctionFactors,
    );
    const correctedMunsell = rgbToMunsell(correctedRGB);

    return {
      correctedColor: correctedRGB,
      correctedColorMunsell: correctedMunsell,
      greyCardColor,
      correctionFactors,
    };
  } finally {
    // Release native image memory so repeated captures don't leak.
    image.dispose();
  }
};
