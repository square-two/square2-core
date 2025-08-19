import type { Image } from './image.js';

/**
 * Bitmap font character data.
 */
export type BmFontChar = {
  /**
   * The character id.
   */
  id: number;

  /**
   * The x position of the character in the image.
   */
  x: number;

  /**
   * The y position of the character in the image.
   */
  y: number;

  /**
   * The width of the character in the image.
   */
  width: number;

  /**
   * The height of the character in the image.
   */
  height: number;

  /**
   * The x offset of the character from the x position.
   */
  xOffset: number;

  /**
   * The y offset of the character from the y position.
   */
  yOffset: number;

  /**
   * The amount to advance the x position after drawing the character.
   */
  xAdvance: number;
};

/**
 * Bitmap font kerning data.
 */
export type BmKerning = {
  /**
   * The left character id.
   */
  left: number;

  /**
   * The right character id.
   */
  right: number;

  /**
   * The amount to adjust the x position when drawing the right character after the left character.
   */
  amount: number;
};

/**
 * Bitmap font class used to draw text.
 */
export class BitmapFont {
  /**
   * The image with the font characters.
   */
  readonly image: Image;

  /**
   * The font height in pixels.
   */
  get height(): number {
    return this.fontData.lineHeight;
  }

  /**
   * The .fnt data.
   */
  private fontData: FontData;

  /**
   * @param image - Font image.
   * @param data - content of .fnt data file.
   */
  constructor(image: Image, data: string) {
    this.image = image;
    this.fontData = new FontData(data);
  }

  /**
   * Get render data for a character.
   * @param char - The char to check.
   * @returns The character render data.
   */
  getCharData(char: string): BmFontChar | null {
    return this.fontData.getCharData(char);
  }

  /**
   * Get the offset between two characters.
   * @param left - The current character.
   * @param right - The next character to the right.
   * @returns The offset.
   */
  getKerning(left: string, right: string): number {
    return this.fontData.getKerning(left, right);
  }

  /**
   * Get the width in pixels of the string using this font.
   * @param text - The string to check.
   * @returns The width in pixels.
   */
  width(text: string): number {
    if (!text) {
      return 0;
    }

    let length = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const charData = this.fontData.getCharData(char);
      if (!charData) {
        break;
      }

      length += charData.xAdvance;
      if (i > 0) {
        const prevElem = text[i - 1];
        length += this.fontData.getKerning(prevElem, char);
      }
    }
    return length;
  }
}

export class FontData {
  /**
   * The height of the font in pixels.
   */
  readonly lineHeight: number;

  /**
   * The character data.
   */
  private chars: Record<string, BmFontChar> = {};

  /**
   * The kerning data.
   */
  private kernings: BmKerning[] = [];

  /**
   * Create a new font data object.
   * @param fontData - The .fnt data.
   */
  constructor(fontData: string) {
    const lines = fontData.split(/\r?\n/);

    let height = 0;
    for (const line of lines) {
      const temp = line.trim().split(' ');
      const segments: string[] = [];
      for (const segment of temp) {
        if (segment !== '') {
          segments.push(segment);
        }
      }

      if (segments.length === 0) {
        continue;
      }

      const lineName = segments[0];
      if (lineName === 'common') {
        height = this.getSegmentInfo(segments[1]);
      } else if (lineName === 'char') {
        const character: BmFontChar = {
          id: this.getSegmentInfo(segments[1]),
          x: this.getSegmentInfo(segments[2]),
          y: this.getSegmentInfo(segments[3]),
          width: this.getSegmentInfo(segments[4]),
          height: this.getSegmentInfo(segments[5]),
          xOffset: this.getSegmentInfo(segments[6]),
          yOffset: this.getSegmentInfo(segments[7]),
          xAdvance: this.getSegmentInfo(segments[8]),
        };
        this.chars[character.id] = character;
      } else if (lineName === 'kerning') {
        this.kernings.push({
          left: this.getSegmentInfo(segments[1]),
          right: this.getSegmentInfo(segments[2]),
          amount: this.getSegmentInfo(segments[3]),
        });
      }
    }
    this.lineHeight = height;
  }

  /**
   * Get the character data for a character.
   * @param char - The character to check.
   * @returns The character data or null if the character does not exist in the font.
   */
  getCharData(char: string): BmFontChar | null {
    const id = char.charCodeAt(0);

    return this.chars[id] ?? null;
  }

  /**
   * Get the kerning amount between two characters.
   * @param left - The left character.
   * @param right - The right character.
   * @returns The kerning amount.
   */
  getKerning(left: string, right: string): number {
    const leftChar = left.charCodeAt(0);
    const rightChar = right.charCodeAt(0);

    const index = this.kernings.findIndex((kerning: BmKerning) => {
      return kerning.left === leftChar && kerning.right === rightChar;
    });

    if (index !== -1) {
      return this.kernings[index].amount;
    }

    return 0;
  }

  /**
   * Get the info from a segment.
   * @param segment - The segment to check.
   * @returns The info.
   */
  private getSegmentInfo(segment: string): number {
    const split = segment.split('=');
    if (split.length !== 2) {
      throw new Error('Incorrect segment format');
    }

    return +split[1];
  }
}
