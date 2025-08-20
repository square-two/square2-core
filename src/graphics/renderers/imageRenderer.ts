import { Rectangle } from '../../math/rectangle.js';
import { Vec2 } from '../../math/vec2.js';
import { Vec3 } from '../../math/vec3.js';
import type { BitmapFont } from '../bitmapFont.js';
import type { Color } from '../color.js';
import { getImageFragmentSource } from '../defaultShaders.js';
import type { GLContext } from '../glContext.js';
import type { Image } from '../image.js';
import type { RenderTarget } from '../renderTarget.js';
import { Shader } from '../shader.js';
import type { Flip } from '../types.js';
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
  private tempVec3: Vec3;

  /**
   * Temporary vector to store a uv position.
   */
  private tempTexCoord: Vec2;

  private tempFrame: Rectangle;

  private tempSize: Vec2;

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

    this.tempVec3 = new Vec3();
    this.tempTexCoord = new Vec2();
    this.tempFrame = new Rectangle();
    this.tempSize = new Vec2();

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
        super.setShader(shader);
      }
    } else {
      super.setShader();
    }
  }

  start(): void {
    this.index = 0;
    this.currentImage = undefined;
    this.currentTarget = undefined;
  }

  /**
   * Draw the current batch to the screen.
   */
  commit(): void {
    if (this.index === 0 || (!this.currentImage && !this.currentTarget)) {
      return;
    }

    this.shader.use();
    this.shader.applyBlendMode();

    const gl = this.context.gl;
    gl.uniformMatrix4fv(this.shader.uniforms.u_projectionMatrix, false, this.projection.value);
    gl.activeTexture(gl.TEXTURE0);
    if (this.currentTarget) {
      gl.bindTexture(gl.TEXTURE_2D, this.currentTarget.texture);
      this.shader.applyTextureParameters(0);
    } else if (this.currentImage) {
      gl.bindTexture(gl.TEXTURE_2D, this.currentImage.texture);
      this.shader.applyTextureParameters(0);
      if (this.shader.uniforms.u_texture) {
        gl.uniform1i(this.shader.uniforms.u_texture, 0);
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
   * @param image - The image to draw.
   * @param position - The position to draw the image at.
   * @param flip - Should the image be flipped.
   * @param frame - Optional region of the image to draw. Defaults to the full image.
   * @param size - Optional size to scale the image to. Defaults to the image size.
   */

  // biome-ignore lint/nursery/useMaxParams: This will get called often and should be optimized for performance.
  drawImage(image: Image, position: Vec2, flip: Flip, frame?: Rectangle, size?: Vec2): void {
    if (this.index >= this.BUFFER_SIZE || this.currentTarget || (this.currentImage && this.currentImage !== image)) {
      this.commit();
    }

    if (frame) {
      this.tempFrame.copyFrom(frame);
    } else {
      this.tempFrame.set(0, 0, image.width, image.height);
    }

    if (size) {
      this.tempSize.copyFrom(size);
    } else {
      this.tempSize.set(image.width, image.height);
    }

    this.currentImage = image;

    this.tempVec3.transformMat4(this.transform, position.x, position.y, 0);
    this.getFlippedUV(this.tempFrame, this.tempSize, flip, 0, this.tempTexCoord);
    this.updateBuffer(this.tempVec3, this.color, this.tempTexCoord, 0);

    this.tempVec3.transformMat4(this.transform, position.x + this.tempFrame.width, position.y, 0);
    this.getFlippedUV(this.tempFrame, this.tempSize, flip, 1, this.tempTexCoord);
    this.updateBuffer(this.tempVec3, this.color, this.tempTexCoord, 1);

    this.tempVec3.transformMat4(
      this.transform,
      position.x + this.tempFrame.width,
      position.y + this.tempFrame.height,
      0,
    );
    this.getFlippedUV(this.tempFrame, this.tempSize, flip, 2, this.tempTexCoord);
    this.updateBuffer(this.tempVec3, this.color, this.tempTexCoord, 2);

    this.tempVec3.transformMat4(this.transform, position.x, position.y + this.tempFrame.height, 0);
    this.getFlippedUV(this.tempFrame, this.tempSize, flip, 3, this.tempTexCoord);
    this.updateBuffer(this.tempVec3, this.color, this.tempTexCoord, 3);

    this.index++;
  }

  /**
   * Draws an image on the canvas using the specified corner points.
   * @param image - The image to draw.
   * @param topLeft - The top-left corner point.
   * @param topRight - The top-right corner point.
   * @param bottomRight - The bottom-right corner point.
   * @param bottomLeft - The bottom-left corner point.
   * @param frame - Optional region of the image to draw. Defaults to the full image.
   */

  // biome-ignore lint/nursery/useMaxParams: This will get called often and should be optimized for performance.
  drawImagePoints(
    image: Image,
    topLeft: Vec2,
    topRight: Vec2,
    bottomRight: Vec2,
    bottomLeft: Vec2,
    frame?: Rectangle,
  ): void {
    if (this.index >= this.BUFFER_SIZE || this.currentTarget || (this.currentImage && this.currentImage !== image)) {
      this.commit();
    }

    if (frame) {
      this.tempFrame.copyFrom(frame);
    } else {
      this.tempFrame.set(0, 0, image.width, image.height);
    }

    this.currentImage = image;

    this.tempVec3.transformMat4(this.transform, topLeft.x, topLeft.y, 0);
    this.tempTexCoord.set(this.tempFrame.x / image.width, this.tempFrame.y / image.height);
    this.updateBuffer(this.tempVec3, this.color, this.tempTexCoord, 0);

    this.tempVec3.transformMat4(this.transform, topRight.x, topRight.y, 0);
    this.tempTexCoord.set((this.tempFrame.x + this.tempFrame.width) / image.width, this.tempFrame.y / image.height);
    this.updateBuffer(this.tempVec3, this.color, this.tempTexCoord, 1);

    this.tempVec3.transformMat4(this.transform, bottomRight.x, bottomRight.y, 0);
    this.tempTexCoord.set(
      (this.tempFrame.x + this.tempFrame.width) / image.width,
      (this.tempFrame.y + this.tempFrame.height) / image.height,
    );
    this.updateBuffer(this.tempVec3, this.color, this.tempTexCoord, 2);

    this.tempVec3.transformMat4(this.transform, bottomLeft.x, bottomLeft.y, 0);
    this.tempTexCoord.set(this.tempFrame.x / image.width, (this.tempFrame.y + this.tempFrame.height) / image.height);
    this.updateBuffer(this.tempVec3, this.color, this.tempTexCoord, 3);

    this.index++;
  }

  /**
   * Draw a render target to the screen.
   * @param position - The position to draw the render target at.
   * @param target - The render target to draw.
   */
  drawRenderTarget(position: Vec2, target: RenderTarget): void {
    if (this.index >= this.BUFFER_SIZE || this.currentImage || (this.currentTarget && this.currentTarget !== target)) {
      this.commit();
    }
    this.currentTarget = target;

    const width = target.width;
    const height = target.height;

    this.tempVec3.transformMat4(this.transform, position.x, position.y, 0);
    this.tempTexCoord.set(0, 1);
    this.updateBuffer(this.tempVec3, this.color, this.tempTexCoord, 0);

    this.tempVec3.transformMat4(this.transform, position.x + width, position.y, 0);
    this.tempTexCoord.set(1, 1);
    this.updateBuffer(this.tempVec3, this.color, this.tempTexCoord, 1);

    this.tempVec3.transformMat4(this.transform, position.x + width, position.y + height, 0);
    this.tempTexCoord.set(1, 0);
    this.updateBuffer(this.tempVec3, this.color, this.tempTexCoord, 2);

    this.tempVec3.transformMat4(this.transform, position.x, position.y + height, 0);
    this.tempTexCoord.set(0, 0);
    this.updateBuffer(this.tempVec3, this.color, this.tempTexCoord, 3);

    this.index++;
  }

  /**
   * Draw a string of text to the screen.
   * @param position - The position to draw the text at.
   * @param font - The font to use.
   * @param text - The text to draw.
   */
  drawBitmapText(position: Vec2, font: BitmapFont, text: string): void {
    if (!text) {
      return;
    }

    if (
      this.index >= this.BUFFER_SIZE ||
      this.currentTarget ||
      (this.currentImage && this.currentImage !== font.image)
    ) {
      this.commit();
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
        this.commit();
      }

      let kerning = 0;
      if (i > 0) {
        const prevChar = text[i - 1];
        kerning = font.getKerning(prevChar, char);
      }
      xOffset += kerning;

      this.tempVec3.transformMat4(
        this.transform,
        position.x + xOffset + charData.xOffset,
        position.y + charData.yOffset,
        0,
      );
      this.tempTexCoord.set(charData.x / font.image.width, charData.y / font.image.height);
      this.updateBuffer(this.tempVec3, this.color, this.tempTexCoord, 0);

      this.tempVec3.transformMat4(
        this.transform,
        position.x + xOffset + charData.xOffset + charData.width,
        position.y + charData.yOffset,
        0,
      );
      this.tempTexCoord.set((charData.x + charData.width) / font.image.width, charData.y / font.image.height);
      this.updateBuffer(this.tempVec3, this.color, this.tempTexCoord, 1);

      this.tempVec3.transformMat4(
        this.transform,
        position.x + xOffset + charData.xOffset + charData.width,
        position.y + charData.yOffset + charData.height,
        0,
      );
      this.tempTexCoord.set(
        (charData.x + charData.width) / font.image.width,
        (charData.y + charData.height) / font.image.height,
      );
      this.updateBuffer(this.tempVec3, this.color, this.tempTexCoord, 2);

      this.tempVec3.transformMat4(
        this.transform,
        position.x + xOffset + charData.xOffset,
        position.y + charData.yOffset + charData.height,
        0,
      );
      this.tempTexCoord.set(charData.x / font.image.width, (charData.y + charData.height) / font.image.height);
      this.updateBuffer(this.tempVec3, this.color, this.tempTexCoord, 3);

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

  // biome-ignore lint/nursery/useMaxParams: This will get called often and should be optimized for performance.
  private getFlippedUV(frame: Rectangle, textureSize: Vec2, flip: Flip, pointOffset: number, out: Vec2): void {
    if (flip === 'both') {
      switch (pointOffset) {
        case 0:
          out.set((frame.x + frame.width) / textureSize.x, (frame.y + frame.height) / textureSize.y);
          break;

        case 1:
          out.set(frame.x / textureSize.x, (frame.y + frame.height) / textureSize.y);
          break;

        case 2:
          out.set(frame.x / textureSize.x, frame.y / textureSize.y);
          break;

        case 3:
          out.set((frame.x + frame.width) / textureSize.x, frame.y / textureSize.y);
          break;
      }
    } else if (flip === 'horizontal') {
      switch (pointOffset) {
        case 0:
          out.set(frame.x / textureSize.x, (frame.y + frame.height) / textureSize.y);
          break;

        case 1:
          out.set((frame.x + frame.width) / textureSize.x, (frame.y + frame.height) / textureSize.y);
          break;

        case 2:
          out.set((frame.x + frame.width) / textureSize.x, frame.y / textureSize.y);
          break;

        case 3:
          out.set(frame.x / textureSize.x, frame.y / textureSize.y);
          break;
      }
    } else if (flip === 'vertical') {
      switch (pointOffset) {
        case 0:
          out.set((frame.x + frame.width) / textureSize.x, frame.y / textureSize.y);
          break;

        case 1:
          out.set(frame.x / textureSize.x, frame.y / textureSize.y);
          break;

        case 2:
          out.set(frame.x / textureSize.x, (frame.y + frame.height) / textureSize.y);
          break;

        case 3:
          out.set((frame.x + frame.width) / textureSize.x, (frame.y + frame.height) / textureSize.y);
          break;
      }
    } else {
      switch (pointOffset) {
        case 0:
          out.set(frame.x / textureSize.x, frame.y / textureSize.y);
          break;

        case 1:
          out.set((frame.x + frame.width) / textureSize.x, frame.y / textureSize.y);
          break;

        case 2:
          out.set((frame.x + frame.width) / textureSize.x, (frame.y + frame.height) / textureSize.y);
          break;

        case 3:
          out.set(frame.x / textureSize.x, (frame.y + frame.height) / textureSize.y);
          break;
      }
    }
  }

  /**
   * Update the buffer with a position and color.
   * @param position - The point to add to the buffer.
   * @param color - The color of the point.
   * @param uv - The uv coordinates of the point.
   * @param pointOffset - The offset of the point in the triangle.
   */
  private updateBuffer(position: Vec3, color: Color, uv: Vec2, pointOffset: number): void {
    const i = this.index * QUAD_OFFSET + pointOffset * OFFSET;
    this.vertexIndices[i] = position.x;
    this.vertexIndices[i + 1] = position.y;
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
