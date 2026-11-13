import {
  AlphaType,
  ColorType,
  Skia,
  type SkImage,
} from "@shopify/react-native-skia";
import { linearRgbToMunsell } from "@/lib/color/munsellLookup";
import {
  getSamplingRect,
  orientationMatches,
  type OverlayRect,
} from "@/lib/color/cameraOverlay";
import {
  averageLinearRgba,
  linearToSrgb255,
  srgbToLinear,
  type RGB,
} from "@/lib/color/colorMath";

/** Error whose (German) message is meant to be shown to the user as is. */
export class ColorExtractionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ColorExtractionError";
  }
}

// Target neutral for the grey card: sRGB 128 expressed in linear light, so
// the correction is applied photometrically.
const TARGET_GREY_LINEAR = srgbToLinear(128 / 255);

/**
 * Per-channel white-balance factors in linear light, scaling the measured grey
 * card onto TARGET_GREY_LINEAR.
 */
const calculateCorrectionFactors = (greyCardLinear: RGB): RGB => ({
  r: greyCardLinear.r > 0 ? TARGET_GREY_LINEAR / greyCardLinear.r : 1,
  g: greyCardLinear.g > 0 ? TARGET_GREY_LINEAR / greyCardLinear.g : 1,
  b: greyCardLinear.b > 0 ? TARGET_GREY_LINEAR / greyCardLinear.b : 1,
});

/** Apply linear-light correction factors to a linear colour (clamped 0..1). */
const applyCorrection = (color: RGB, factors: RGB): RGB => ({
  r: Math.max(0, Math.min(1, color.r * factors.r)),
  g: Math.max(0, Math.min(1, color.g * factors.g)),
  b: Math.max(0, Math.min(1, color.b * factors.b)),
});

/**
 * Mean linear-light colour of one rectangle of the image. Only that rectangle
 * is copied out of Skia (not the whole 12 MP photo), explicitly as
 * non-premultiplied RGBA_8888 so the byte order does not depend on the
 * platform's native N32 format.
 */
const readRegionLinear = (image: SkImage, rect: OverlayRect): RGB => {
  const left = Math.max(0, rect.left);
  const top = Math.max(0, rect.top);
  const width = Math.min(image.width(), rect.left + rect.width) - left;
  const height = Math.min(image.height(), rect.top + rect.height) - top;
  if (width <= 0 || height <= 0) {
    throw new Error("Sampling region lies outside the image");
  }

  const pixels = image.readPixels(left, top, {
    width,
    height,
    colorType: ColorType.RGBA_8888,
    alphaType: AlphaType.Unpremul,
  });
  if (!pixels) {
    throw new Error("Failed to read image pixels");
  }
  return averageLinearRgba(pixels);
};

export type SoilColorResult = {
  /** White-balanced colour as sRGB 0–255, for display only. */
  rgb: RGB;
  /** Nearest Munsell chip, e.g. "7.5YR 4/4". */
  munsell: string;
  /** CIEDE2000 distance to that chip (see POOR_MATCH_DELTA_E00). */
  distance: number;
};

/**
 * Colour-correct a photo with the grey card and determine the soil colour.
 *
 * @param imageUri      URI of the captured photo.
 * @param previewAspect Width/height of the on-screen camera preview. The
 *   preview is centre-cropped ("cover"), so the analysed frame is constrained
 *   to this aspect ratio to make the sampled pixels match the guide boxes.
 * @throws ColorExtractionError with a user-facing message when the photo
 *   orientation does not match the preview.
 */
export const extractSoilColor = async (
  imageUri: string,
  previewAspect: number,
): Promise<SoilColorResult> => {
  const data = await Skia.Data.fromURI(imageUri);
  const image = Skia.Image.MakeImageFromEncoded(data);

  if (!image) {
    throw new Error("Failed to decode image");
  }

  try {
    const width = image.width();
    const height = image.height();

    if (!orientationMatches(width, height, previewAspect)) {
      throw new ColorExtractionError(
        previewAspect > 1
          ? "Das Foto ist im Hochformat, die Vorschau im Querformat. Bitte im Querformat fotografieren."
          : "Das Foto ist im Querformat. Bitte im Hochformat fotografieren (Handy aufrecht halten).",
      );
    }

    const greyCardLinear = readRegionLinear(
      image,
      getSamplingRect("greyCard", width, height, previewAspect),
    );
    const soilLinear = readRegionLinear(
      image,
      getSamplingRect("soilSample", width, height, previewAspect),
    );

    // White balance in linear light. Match directly from the linear colour
    // (no 8-bit re-encode, which would quantise dark colours and inflate their
    // chroma); the sRGB triplet is only for display.
    const correctedLinear = applyCorrection(
      soilLinear,
      calculateCorrectionFactors(greyCardLinear),
    );
    const { munsell, distance } = linearRgbToMunsell(correctedLinear);

    return { rgb: linearToSrgb255(correctedLinear), munsell, distance };
  } finally {
    // Release native image memory so repeated captures don't leak.
    image.dispose();
  }
};
