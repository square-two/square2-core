import { clamp } from '../math/mathUtils.js';

const HEX_COLOR_REGEX: RegExp = new RegExp(/^#([a-fA-F\d]{2})([a-fA-F\d]{2})([a-fA-F\d]{2})([a-fA-F\d]{2})$/);

/**
 * Color represents a color with red, green, blue, and alpha components.
 * The components are stored as floating point numbers between 0 and 1.
 */
export class Color {
  /**
   * The red component of the color.
   */
  red: number;

  /**
   * The green component of the color.
   */
  green: number;

  /**
   * The blue component of the color.
   */
  blue: number;

  /**
   * The alpha component of the color.
   */
  alpha: number;

  /**
   * Create a color from byte values (0 - 255).
   * @param red - The red component.
   * @param green - The green component.
   * @param blue - The blue component.
   * @param alpha - The alpha component. Defaults to 255.
   * @returns The new color.
   */
  static fromBytes(red: number, green: number, blue: number, alpha: number = 255): Color {
    const r = clamp(red, 0, 255) / 255;
    const g = clamp(green, 0, 255) / 255;
    const b = clamp(blue, 0, 255) / 255;
    const a = clamp(alpha, 0, 255) / 255;

    return new Color(r, g, b, a);
  }

  /**
   * Create a color from a hex string.
   * @param hex - The hex string.
   * @param out - Optional output color.
   * @returns The new color
   */
  static fromHex(hex: `#${string}`): Color {
    const matches = HEX_COLOR_REGEX.exec(hex);
    if (matches) {
      const r = Number.parseInt(`0x${matches[1]}`, 10);
      const g = Number.parseInt(`0x${matches[2]}`, 10);
      const b = Number.parseInt(`0x${matches[3]}`, 10);
      const a = Number.parseInt(`0x${matches[4]}`, 10);

      return Color.fromBytes(r, g, b, a);
    }

    throw new Error(`Invalid hex color: ${hex}`);
  }

  /**
   * Create a color from an integer value.
   * The integer should be in the format 0xRRGGBBAA.
   * @param color - The integer color value.
   * @returns The new color.
   */
  static fromInt(color: number): Color {
    const r = (color >> 24) & 255;
    const g = (color >> 16) & 255;
    const b = (color >> 8) & 255;
    const a = color & 255;

    return Color.fromBytes(r, g, b, a);
  }

  /**
   * Interpolate between two colors.
   * @param color1 - The start color
   * @param color2 - The end color
   * @param position - The position to interpolate to (0 - 1).
   * @param out - Optional output color.
   * @returns The interpolated color.
   */
  static interpolate(color1: Color, color2: Color, position: number, out?: Color): Color {
    const result = out ?? new Color();

    const r = (color2.red - color1.red) * position + color1.red;
    const g = (color2.green - color1.green) * position + color1.green;
    const b = (color2.blue - color1.blue) * position + color1.blue;
    const a = (color2.alpha - color1.alpha) * position + color1.alpha;
    result.set(r, g, b, a);

    return result;
  }

  /**
   * Create a new color.
   * @param red - The red component.
   * @param green - The green component.
   * @param blue - The blue component.
   * @param alpha - The alpha component.
   */
  constructor(red: number = 0.0, green: number = 0.0, blue: number = 0.0, alpha: number = 1.0) {
    this.red = red;
    this.green = green;
    this.blue = blue;
    this.alpha = alpha;
  }

  /**
   * Set new color values.
   * @param red - The red component.
   * @param green - The green component.
   * @param blue - The blue component.
   * @param alpha - The alpha component.
   */
  set(red: number, green: number, blue: number, alpha: number): void {
    this.red = red;
    this.green = green;
    this.blue = blue;
    this.alpha = alpha;
  }

  /**
   * Clone a color.
   * @param out - Optional output color.
   * @returns The cloned color.
   */
  clone(out?: Color): Color {
    const result = out ?? new Color();
    result.set(this.red, this.green, this.blue, this.alpha);

    return result;
  }

  /**
   * Copy the values from another color.
   * @param color - The color to copy from.
   */
  copyFrom(color: Color): void {
    this.set(color.red, color.green, color.blue, color.alpha);
  }

  /**
   * Get a string representation of the color.
   * @returns A string representation of the color.
   */
  toString(): string {
    return `Color( r: ${this.red}, g: ${this.green}, b: ${this.blue}, a: ${this.alpha} )`;
  }
}
