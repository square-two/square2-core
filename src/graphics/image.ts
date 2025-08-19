import { inject } from '../di/inject.js';
import { Color } from './color.js';
import type { GLContext } from './glContext.js';

/**
 * An image that can be rendered to the screen.
 */
export class Image {
  /**
   * The width of the image in pixels.
   */
  readonly width: number;

  /**
   * The height of the image in pixels.
   */
  readonly height: number;

  /**
   * The image data.
   */
  readonly data: Uint8ClampedArray;

  /**
   * The WebGL texture.
   */
  readonly texture: WebGLTexture;

  /**
   * The WebGL rendering context.
   */
  @inject('glContext')
  private context!: GLContext;

  /**
   * Create a new image.
   * @param width - The width of the image in pixels.
   * @param height - The height of the image in pixels.
   * @param data - The image data.
   */
  constructor(width: number, height: number, data: Uint8ClampedArray) {
    this.width = width;
    this.height = height;
    this.data = data;
    this.texture = this.createTexture();
    this.updateTexture();
  }

  /**
   * Get a color from the image data at the specified position.
   * @param x - The x position in pixels.
   * @param y - The y position in pixels.
   * @param out - The color to store the result in.
   * @returns The pixel color.
   */
  getPixel(x: number, y: number, out?: Color): Color {
    const color = out ?? new Color();

    const index = (y * this.width + x) * 4;
    color.red = this.data[index] / 255;
    color.green = this.data[index + 1] / 255;
    color.blue = this.data[index + 2] / 255;
    color.alpha = this.data[index + 3] / 255;

    return color;
  }

  /**
   * Update the image data at the specified position.
   * @param x - The x position in pixels.
   * @param y - The y position in pixels.
   * @param color The color to set the pixel to.
   */
  setPixel(x: number, y: number, color: Color): void {
    const index = (y * this.width + x) * 4;
    this.data[index] = color.red * 255;
    this.data[index + 1] = color.green * 255;
    this.data[index + 2] = color.blue * 255;
    this.data[index + 3] = color.alpha * 255;
  }

  /**
   * Update the texture with the current image data. This should be called after modifying the image data with setPixel.
   */
  updateTexture(): void {
    const gl = this.context.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, this.data);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  /**
   * Destroy the image and texture.
   */
  destroy(): void {
    this.context.gl.deleteTexture(this.texture);
  }

  /**
   * Create a new texture for this image.
   * @returns The new texture.
   */
  private createTexture(): WebGLTexture {
    return this.context.gl.createTexture();
  }
}
