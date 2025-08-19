import type { Mat4 } from '../../math/mat4.js';
import { Vec2 } from '../../math/vec2.js';
import { Vec3 } from '../../math/vec3.js';
import type { BitmapFont } from '../bitmapFont.js';
import type { Color } from '../color.js';
import { getImageFragmentSource } from '../defaultShaders.js';
import type { GLContext } from '../glContext.js';
import type { Image } from '../image.js';
import type { RenderTarget } from '../renderTarget.js';
import { Shader } from '../shader.js';
import { BaseRenderer } from './baseRenderer.js';

/**
 * The offset per vertex.
 * position: x, y, z.
 * color: r, g, b, a.
 * texture: u, v.
 */
const OFFSET = 9;

/**
 * The buffer offset per quad.
 */
const QUAD_OFFSET: number = OFFSET * 4;

/**
 * The amount of vertices per quad in the vertex buffer.
 */
const VERTICES_PER_QUAD = 4;

/**
 * The amount of indices per quad in the index buffer.
 */
const INDICES_PER_QUAD = 6;

export class ImageRenderer extends BaseRenderer {
  /**
   * The current batch index in the buffer.
   */
  private index = 0;

  /**
   * Temporary vector to store a vertex position.
   */
  private tempPoint: Vec3;

  /**
   * Temporary vector to store a uv position.
   */
  private tempUV: Vec2;

  /**
   * Current batch image.
   */
  private currentImage?: Image;

  /**
   * Current batch render target.
   */
  private currentTarget?: RenderTarget;

  /**
   * Create a new image renderer.
   * @param context - The WebGL rendering context.
   */
  constructor(context: GLContext) {
    super(context);

    this.tempPoint = new Vec3();
    this.tempUV = new Vec2();

    this.vertexBuffer = this.context.gl.createBuffer();
    this.vertexIndices = new Float32Array(this.BUFFER_SIZE * QUAD_OFFSET);

    this.indexBuffer = this.context.gl.createBuffer();
    this.indexIndices = new Int32Array(this.BUFFER_SIZE * INDICES_PER_QUAD);

    for (let i = 0; i < this.indexIndices.length; i++) {
      this.indexIndices[i * INDICES_PER_QUAD] = i * VERTICES_PER_QUAD;
      this.indexIndices[i * INDICES_PER_QUAD + 1] = i * VERTICES_PER_QUAD + 1;
      this.indexIndices[i * INDICES_PER_QUAD + 2] = i * VERTICES_PER_QUAD + 2;
      this.indexIndices[i * INDICES_PER_QUAD + 3] = i * VERTICES_PER_QUAD;
      this.indexIndices[i * INDICES_PER_QUAD + 4] = i * VERTICES_PER_QUAD + 2;
      this.indexIndices[i * INDICES_PER_QUAD + 5] = i * VERTICES_PER_QUAD + 3;
    }

    this.createDefaultShader();
  }

  /**
   * Set the current shader.
   * @param shader - The shader to use. If not provided, the default shader will be used.
   */
  override setShader(shader?: Shader): void {
    if (shader) {
      if (shader.type === 'image') {
        this.shader = shader;
      }
    } else {
      this.shader = this.defaultShader;
    }
  }

  /**
   * Draw the current batch to the screen.
   */
  drawBatch(): void {
    if (this.index === 0 || (!this.currentImage && !this.currentTarget)) {
      return;
    }

    this.shader.use();
    this.shader.applyBlendMode();

    const gl = this.context.gl;
    gl.uniformMatrix4fv(this.shader.projectionLocation, false, this.projection.value);
    gl.activeTexture(gl.TEXTURE0);
    if (this.currentTarget) {
      gl.bindTexture(gl.TEXTURE_2D, this.currentTarget.texture);
      this.shader.applyTextureParameters(0);
    } else if (this.currentImage) {
      gl.bindTexture(gl.TEXTURE_2D, this.currentImage.texture);
      this.shader.applyTextureParameters(0);
      if (this.shader.textureLocation) {
        gl.uniform1i(this.shader.textureLocation, 0);
      }
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertexIndices, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indexIndices, gl.STATIC_DRAW);

    gl.vertexAttribPointer(this.shader.vertexPositionLocation, 3, gl.FLOAT, false, this.FLOAT_SIZE * 9, 0);
    gl.enableVertexAttribArray(this.shader.vertexPositionLocation);
    gl.vertexAttribPointer(
      this.shader.vertexColorLocation,
      4,
      gl.FLOAT,
      false,
      this.FLOAT_SIZE * 9,
      this.FLOAT_SIZE * 3,
    );
    gl.enableVertexAttribArray(this.shader.vertexColorLocation);
    gl.vertexAttribPointer(this.shader.vertexUVLocation, 2, gl.FLOAT, false, this.FLOAT_SIZE * 9, this.FLOAT_SIZE * 7);
    gl.enableVertexAttribArray(this.shader.vertexUVLocation);

    gl.drawElements(gl.TRIANGLES, this.index * INDICES_PER_QUAD, gl.UNSIGNED_INT, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    gl.disableVertexAttribArray(this.shader.vertexPositionLocation);
    gl.disableVertexAttribArray(this.shader.vertexColorLocation);
    gl.disableVertexAttribArray(this.shader.vertexUVLocation);

    this.index = 0;
    this.currentImage = undefined;
    this.currentTarget = undefined;
  }

  /**
   * Draw an image to the screen.
   * @param x - The x position to draw the image at.
   * @param y - The y position to draw the image at.
   * @param flipX - Should the image be flipped on the x-axis.
   * @param flipY - Should the image be flipped on the y-axis.
   * @param image - The image to draw.
   * @param color - The color to tint the image with.
   * @param transform - The transformation matrix to apply.
   */
  drawImage(x: number, y: number, flipX: boolean, flipY: boolean, image: Image, color: Color, transform: Mat4): void {
    this.drawImageSection(x, y, 0, 0, image.width, image.height, flipX, flipY, image, color, transform);
  }

  /**
   * Draw a scaled image to the screen.
   * @param x - The x position to draw the image at.
   * @param y - The y position to draw the image at.
   * @param width - The width to scale the image to.
   * @param height - The height to scale the image to.
   * @param flipX - Should the image be flipped on the x-axis.
   * @param flipY - Should the image be flipped on the y-axis.
   * @param image - The image to draw.
   * @param color - The color to tint the image with.
   * @param transform - The transformation matrix to apply.
   */
  drawScaledImage(
    x: number,
    y: number,
    width: number,
    height: number,
    flipX: boolean,
    flipY: boolean,
    image: Image,
    color: Color,
    transform: Mat4,
  ): void {
    this.drawScaledImageSection(
      x,
      y,
      width,
      height,
      0,
      0,
      image.width,
      image.height,
      flipX,
      flipY,
      image,
      color,
      transform,
    );
  }

  /**
   * Draw an image section to the screen.
   * @param x - The x position to draw the image at.
   * @param y - The y position to draw the image at.
   * @param sx - The x position of the section to draw.
   * @param sy - The y position of the section to draw.
   * @param sw - The width of the section to draw.
   * @param sh - The height of the section to draw.
   * @param flipX - Should the image be flipped on the x-axis.
   * @param flipY - Should the image be flipped on the y-axis.
   * @param image - The image to draw.
   * @param color - The color to tint the image with.
   * @param transform - The transformation matrix to apply.
   */
  drawImageSection(
    x: number,
    y: number,
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    flipX: boolean,
    flipY: boolean,
    image: Image,
    color: Color,
    transform: Mat4,
  ): void {
    this.drawScaledImageSection(x, y, sw, sh, sx, sy, sw, sh, flipX, flipY, image, color, transform);
  }

  /**
   * Draw a scaled image section to the screen.
   * @param x - The x position to draw the image at.
   * @param y - The y position to draw the image at.
   * @param width - The width to scale the image to.
   * @param height - The height to scale the image to.
   * @param sx - The x position of the section to draw.
   * @param sy - The y position of the section to draw.
   * @param sw - The width of the section to draw.
   * @param sh - The height of the section to draw.
   * @param flipX - Should the image be flipped on the x-axis.
   * @param flipY - Should the image be flipped on the y-axis.
   * @param image - The image to draw.
   * @param color - The color to tint the image with.
   * @param transform - The transformation matrix to apply.
   */
  drawScaledImageSection(
    x: number,
    y: number,
    width: number,
    height: number,
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    flipX: boolean,
    flipY: boolean,
    image: Image,
    color: Color,
    transform: Mat4,
  ): void {
    if (this.index >= this.BUFFER_SIZE || this.currentTarget || (this.currentImage && this.currentImage !== image)) {
      this.drawBatch();
    }

    this.currentImage = image;
    this.tempPoint.transformMat4(transform, x, y, 0);
    this.getFlippedUV(sx, sy, sw, sh, image.width, image.height, flipX, flipY, 0, this.tempUV);
    this.updateBatch(this.tempPoint, color, this.tempUV, 0);

    this.tempPoint.transformMat4(transform, x + width, y, 0);
    this.getFlippedUV(sx, sy, sw, sh, image.width, image.height, flipX, flipY, 1, this.tempUV);
    this.updateBatch(this.tempPoint, color, this.tempUV, 1);

    this.tempPoint.transformMat4(transform, x + width, y + height, 0);
    this.getFlippedUV(sx, sy, sw, sh, image.width, image.height, flipX, flipY, 2, this.tempUV);
    this.updateBatch(this.tempPoint, color, this.tempUV, 2);

    this.tempPoint.transformMat4(transform, x, y + height, 0);
    this.getFlippedUV(sx, sy, sw, sh, image.width, image.height, flipX, flipY, 3, this.tempUV);
    this.updateBatch(this.tempPoint, color, this.tempUV, 3);

    this.index++;
  }

  /**
   * Draws an image on the canvas using the specified corner points.
   * @param tlX - The x-coordinate of the top-left corner.
   * @param tlY - The y-coordinate of the top-left corner.
   * @param trX - The x-coordinate of the top-right corner.
   * @param trY - The y-coordinate of the top-right corner.
   * @param brX - The x-coordinate of the bottom-right corner.
   * @param brY - The y-coordinate of the bottom-right corner.
   * @param blX - The x-coordinate of the bottom-left corner.
   * @param blY - The y-coordinate of the bottom-left corner.
   * @param image - The image to draw.
   * @param color - The color to tint the image with.
   * @param transform - The transformation matrix to apply.
   */
  drawImagePoints(
    tlX: number,
    tlY: number,
    trX: number,
    trY: number,
    brX: number,
    brY: number,
    blX: number,
    blY: number,
    image: Image,
    color: Color,
    transform: Mat4,
  ): void {
    this.drawImageSectionPoints(
      tlX,
      tlY,
      trX,
      trY,
      brX,
      brY,
      blX,
      blY,
      0,
      0,
      image.width,
      image.height,
      image,
      color,
      transform,
    );
  }

  /**
   * Draws an image section on the canvas using the specified corner points.
   * @param tlX - The x-coordinate of the top-left corner.
   * @param tlY - The y-coordinate of the top-left corner.
   * @param trX - The x-coordinate of the top-right corner.
   * @param trY - The y-coordinate of the top-right corner.
   * @param brX - The x-coordinate of the bottom-right corner.
   * @param brY - The y-coordinate of the bottom-right corner.
   * @param blX - The x-coordinate of the bottom-left corner.
   * @param blY - The y-coordinate of the bottom-left corner.
   * @param sx - The x position of the section to draw.
   * @param sy - The y position of the section to draw.
   * @param sw - The width of the section to draw.
   * @param sh - The height of the section to draw.
   * @param image - The image to draw.
   * @param color - The color to tint the image with.
   * @param transform - The transformation matrix to apply.
   */
  drawImageSectionPoints(
    tlX: number,
    tlY: number,
    trX: number,
    trY: number,
    brX: number,
    brY: number,
    blX: number,
    blY: number,
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    image: Image,
    color: Color,
    transform: Mat4,
  ): void {
    if (this.index >= this.BUFFER_SIZE || this.currentTarget || (this.currentImage && this.currentImage !== image)) {
      this.drawBatch();
    }

    this.currentImage = image;

    this.tempPoint.transformMat4(transform, tlX, tlY, 0);
    this.tempUV.set(sx / image.width, sy / image.height);
    this.updateBatch(this.tempPoint, color, this.tempUV, 0);

    this.tempPoint.transformMat4(transform, trX, trY, 0);
    this.tempUV.set((sx + sw) / image.width, sy / image.height);
    this.updateBatch(this.tempPoint, color, this.tempUV, 1);

    this.tempPoint.transformMat4(transform, brX, brY, 0);
    this.tempUV.set((sx + sw) / image.width, (sy + sh) / image.height);
    this.updateBatch(this.tempPoint, color, this.tempUV, 2);

    this.tempPoint.transformMat4(transform, blX, blY, 0);
    this.tempUV.set(sx / image.width, (sy + sh) / image.height);
    this.updateBatch(this.tempPoint, color, this.tempUV, 3);
    this.index++;
  }

  /**
   * Draw a render target to the screen.
   * @param x - The x position to draw the render target at.
   * @param y - The y position to draw the render target at.
   * @param target - The render target to draw.
   * @param color - The color to tint the render target with.
   * @param transform - The transformation matrix to apply.
   */
  drawRenderTarget(x: number, y: number, target: RenderTarget, color: Color, transform: Mat4): void {
    if (this.index >= this.BUFFER_SIZE || this.currentImage || (this.currentTarget && this.currentTarget !== target)) {
      this.drawBatch();
    }
    this.currentTarget = target;

    const width = target.width;
    const height = target.height;

    this.tempPoint.transformMat4(transform, x, y, 0);
    this.tempUV.set(0, 1);
    this.updateBatch(this.tempPoint, color, this.tempUV, 0);

    this.tempPoint.transformMat4(transform, x + width, y, 0);
    this.tempUV.set(1, 1);
    this.updateBatch(this.tempPoint, color, this.tempUV, 1);

    this.tempPoint.transformMat4(transform, x + width, y + height, 0);
    this.tempUV.set(1, 0);
    this.updateBatch(this.tempPoint, color, this.tempUV, 2);

    this.tempPoint.transformMat4(transform, x, y + height, 0);
    this.tempUV.set(0, 0);
    this.updateBatch(this.tempPoint, color, this.tempUV, 3);

    this.index++;
  }

  /**
   * Draw a string of text to the screen.
   * @param x - The x position to draw the text at.
   * @param y - The y position to draw the text at.
   * @param font - The font to use.
   * @param text - The text to draw.
   * @param color - The color of the text.
   * @param transform - The transformation matrix to apply.
   */
  drawBitmapText(x: number, y: number, font: BitmapFont, text: string, color: Color, transform: Mat4): void {
    if (!text) {
      return;
    }

    if (
      this.index >= this.BUFFER_SIZE ||
      this.currentTarget ||
      (this.currentImage && this.currentImage !== font.image)
    ) {
      this.drawBatch();
    }
    this.currentImage = font.image;

    let xOffset = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const charData = font.getCharData(char);
      if (!charData) {
        continue;
      }

      if (this.index >= this.BUFFER_SIZE) {
        this.drawBatch();
      }

      let kerning = 0;
      if (i > 0) {
        const prevChar = text[i - 1];
        kerning = font.getKerning(prevChar, char);
      }
      xOffset += kerning;

      this.tempPoint.transformMat4(transform, x + xOffset + charData.xOffset, y + charData.yOffset, 0);
      this.tempUV.set(charData.x / font.image.width, charData.y / font.image.height);
      this.updateBatch(this.tempPoint, color, this.tempUV, 0);

      this.tempPoint.transformMat4(transform, x + xOffset + charData.xOffset + charData.width, y + charData.yOffset, 0);
      this.tempUV.set((charData.x + charData.width) / font.image.width, charData.y / font.image.height);
      this.updateBatch(this.tempPoint, color, this.tempUV, 1);

      this.tempPoint.transformMat4(
        transform,
        x + xOffset + charData.xOffset + charData.width,
        y + charData.yOffset + charData.height,
        0,
      );
      this.tempUV.set(
        (charData.x + charData.width) / font.image.width,
        (charData.y + charData.height) / font.image.height,
      );
      this.updateBatch(this.tempPoint, color, this.tempUV, 2);

      this.tempPoint.transformMat4(
        transform,
        x + xOffset + charData.xOffset,
        y + charData.yOffset + charData.height,
        0,
      );
      this.tempUV.set(charData.x / font.image.width, (charData.y + charData.height) / font.image.height);
      this.updateBatch(this.tempPoint, color, this.tempUV, 3);

      xOffset += charData.xAdvance;
      this.index++;
    }
  }

  /**
   * Get flipped uv coordinates.
   * @param sx - The x position of the section to draw.
   * @param sy - The y position of the section to draw.
   * @param sw - The width of the section to draw.
   * @param sh - The height of the section to draw.
   * @param textureWidth - The width of the texture.
   * @param textureHeight - The height of the texture.
   * @param flipX - Should the image be flipped on the x-axis.
   * @param flipY - Should the image be flipped on the y-axis.
   * @param pointOffset - The offset of the point in the quad. [tl, tr, br, bl] clockwise.
   * @param out - The vector to store the result in.
   */
  private getFlippedUV(
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    textureWidth: number,
    textureHeight: number,
    flipX: boolean,
    flipY: boolean,
    pointOffset: number,
    out: Vec2,
  ): void {
    if (flipX && flipY) {
      switch (pointOffset) {
        case 0:
          out.set((sx + sw) / textureWidth, (sy + sh) / textureHeight);
          break;

        case 1:
          out.set(sx / textureWidth, (sy + sh) / textureHeight);
          break;

        case 2:
          out.set(sx / textureWidth, sy / textureHeight);
          break;

        case 3:
          out.set((sx + sw) / textureWidth, sy / textureHeight);
          break;
      }
    } else if (flipX) {
      switch (pointOffset) {
        case 0:
          out.set(sx / textureWidth, (sy + sh) / textureHeight);
          break;

        case 1:
          out.set((sx + sw) / textureWidth, (sy + sh) / textureHeight);
          break;

        case 2:
          out.set((sx + sw) / textureWidth, sy / textureHeight);
          break;

        case 3:
          out.set(sx / textureWidth, sy / textureHeight);
          break;
      }
    } else if (flipY) {
      switch (pointOffset) {
        case 0:
          out.set((sx + sw) / textureWidth, sy / textureHeight);
          break;

        case 1:
          out.set(sx / textureWidth, sy / textureHeight);
          break;

        case 2:
          out.set(sx / textureWidth, (sy + sh) / textureHeight);
          break;

        case 3:
          out.set((sx + sw) / textureWidth, (sy + sh) / textureHeight);
          break;
      }
    } else {
      switch (pointOffset) {
        case 0:
          out.set(sx / textureWidth, sy / textureHeight);
          break;

        case 1:
          out.set((sx + sw) / textureWidth, sy / textureHeight);
          break;

        case 2:
          out.set((sx + sw) / textureWidth, (sy + sh) / textureHeight);
          break;

        case 3:
          out.set(sx / textureWidth, (sy + sh) / textureHeight);
          break;
      }
    }
  }

  /**
   * Update the buffer with a point and color.
   * @param point - The point to add to the buffer.
   * @param color - The color of the point.
   * @param uv - The uv coordinates of the point.
   * @param pointOffset - The offset of the point in the triangle.
   */
  private updateBatch(point: Vec3, color: Color, uv: Vec2, pointOffset: number): void {
    const i = this.index * QUAD_OFFSET + pointOffset * OFFSET;
    this.vertexIndices[i] = point.x;
    this.vertexIndices[i + 1] = point.y;
    this.vertexIndices[i + 2] = 0;

    this.vertexIndices[i + 3] = color.red;
    this.vertexIndices[i + 4] = color.green;
    this.vertexIndices[i + 5] = color.blue;
    this.vertexIndices[i + 6] = color.alpha;

    this.vertexIndices[i + 7] = uv.x;
    this.vertexIndices[i + 8] = uv.y;
  }

  /**
   * Create the default shader for the image renderer.
   */
  private createDefaultShader(): void {
    this.defaultShader = new Shader('image', getImageFragmentSource(this.context.isGL1));
    this.shader = this.defaultShader;
  }
}
