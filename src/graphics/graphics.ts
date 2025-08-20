import { Mat4, type OrthoParams } from '../math/mat4.js';
import type { Rectangle } from '../math/rectangle.js';
import type { Vec2 } from '../math/vec2.js';
import type { BitmapFont } from './bitmapFont.js';
import { Color } from './color.js';
import type { GLContext } from './glContext.js';
import type { Image } from './image.js';
import { ImageRenderer } from './renderers/imageRenderer.js';
import { ShapeRenderer } from './renderers/shapeRenderer.js';
import type { RenderTarget } from './renderTarget.js';
import type { Shader } from './shader.js';
import type { Flip, LineAlign } from './types.js';

const MAX_TARGET_STACK = 64;
const MAX_TRANSFORM_STACK = 128;

export class Graphics {
  color = new Color(1, 1, 1, 1);

  transformStack: Mat4[] = [];

  get transform(): Mat4 {
    return this.transformStack[this.transformStack.length - 1];
  }

  private shapeRenderer: ShapeRenderer;

  private imageRenderer: ImageRenderer;

  private targetStack: RenderTarget[] = [];

  private clearColor = new Color(0, 0, 0, 1);

  private projection: Mat4;

  private context: GLContext;

  private canvas: HTMLCanvasElement;

  private pixelRatio: number;

  private orthoProjection: OrthoParams = {
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    near: -1,
    far: 1,
  };

  constructor(context: GLContext, canvas: HTMLCanvasElement, pixelRatio: number) {
    this.context = context;
    this.canvas = canvas;
    this.pixelRatio = pixelRatio;

    this.projection = new Mat4();
    this.transformStack.push(new Mat4());

    this.shapeRenderer = new ShapeRenderer(context);
    this.imageRenderer = new ImageRenderer(context);
  }

  pushTarget(target: RenderTarget): void {
    if (this.targetStack.length === MAX_TARGET_STACK) {
      throw new Error('Render target stack size exceeded. (more pushes than pulls?)');
    }

    this.targetStack.push(target);
    this.context.gl.bindFramebuffer(this.context.gl.FRAMEBUFFER, target.buffer);
  }

  popTarget(): void {
    this.targetStack.pop();
    const gl = this.context.gl;

    if (this.targetStack.length > 0) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.targetStack[this.targetStack.length - 1].buffer);
    } else {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
  }

  clearTargets(): void {
    while (this.targetStack.length > 0) {
      this.targetStack.pop();
    }
    this.context.gl.bindFramebuffer(this.context.gl.FRAMEBUFFER, null);
  }

  pushTransform(transform?: Mat4): void {
    if (this.transformStack.length === MAX_TRANSFORM_STACK) {
      throw new Error('Transform stack size exceeded. (more pushes than pulls?)');
    }

    if (!transform) {
      this.transformStack.push(Mat4.get(this.transform.value));
    } else {
      this.transformStack.push(Mat4.get(transform.value));
    }
  }

  applyTransform(transform: Mat4): void {
    Mat4.multiply(this.transform, transform, this.transform);
  }

  popTransform(): void {
    if (this.transformStack.length <= 1) {
      throw new Error('Cannot pop the last transform off the stack');
    }

    this.transformStack.pop()?.put();
  }

  start(clear: boolean = true, newClearColor?: Color): void {
    const gl = this.context.gl;
    let width = 0;
    let height = 0;

    if (this.targetStack.length > 0) {
      const target = this.targetStack[this.targetStack.length - 1];
      width = target.width;
      height = target.height;
    } else {
      width = this.canvas.width * this.pixelRatio;
      height = this.canvas.height * this.pixelRatio;
    }

    this.orthoProjection.right = width;
    this.orthoProjection.bottom = height;
    this.projection.ortho(this.orthoProjection);

    gl.viewport(0, 0, width, height);

    this.shapeRenderer.setProjection(this.projection);
    this.imageRenderer.setProjection(this.projection);

    this.shapeRenderer.start();
    this.imageRenderer.start();

    if (clear) {
      if (newClearColor) {
        gl.clearColor(newClearColor.red, newClearColor.green, newClearColor.blue, newClearColor.alpha);
      } else {
        gl.clearColor(this.clearColor.red, this.clearColor.green, this.clearColor.blue, this.clearColor.alpha);
      }
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
  }

  /**
   * Draw the current batch to the screen or target.
   */
  commit(): void {
    this.shapeRenderer.commit();
    this.imageRenderer.commit();
  }

  /**
   * Set the current shader.
   * @param shader - The shader to use. If not provided, the default shader will be used.
   */
  setShader(shader?: Shader): void {
    this.shapeRenderer.setShader(shader);
    this.imageRenderer.setShader(shader);
  }

  /**
   * Draw a filled triangle.
   * @param p1 - The first point of the triangle.
   * @param p2 - The second point of the triangle.
   * @param p3 - The third point of the triangle.
   */
  drawFilledTriangle(p1: Vec2, p2: Vec2, p3: Vec2): void {
    this.imageRenderer.commit();
    this.shapeRenderer.color = this.color;
    this.shapeRenderer.transform = this.transform;
    this.shapeRenderer.drawFilledTriangle(p1, p2, p3);
  }

  /**
   * Draw a line.
   * @param p1 - The first point of the line.
   * @param p2 - The second point of the line.
   * @param align - The alignment of the line.
   * @param lineWidth - The width of the line.
   */
  drawLine(p1: Vec2, p2: Vec2, align: LineAlign = 'center', lineWidth: number = 1): void {
    this.imageRenderer.commit();
    this.shapeRenderer.color = this.color;
    this.shapeRenderer.transform = this.transform;
    this.shapeRenderer.drawLine(p1, p2, align, lineWidth);
  }

  /**
   * Draw a filled rectangle.
   * @param rect - The rectangle to draw.
   */
  drawFilledRect(rect: Rectangle): void {
    this.imageRenderer.commit();
    this.shapeRenderer.color = this.color;
    this.shapeRenderer.transform = this.transform;
    this.shapeRenderer.drawFilledRect(rect);
  }

  /**
   * Draw a rectangle.
   * @param rect - The rectangle to draw.
   * @param lineWidth - The width of the line.
   */
  drawRect(rect: Rectangle, lineWidth: number = 1): void {
    this.imageRenderer.commit();
    this.shapeRenderer.color = this.color;
    this.shapeRenderer.transform = this.transform;
    this.shapeRenderer.drawRect(rect, lineWidth);
  }

  /**
   * Draw a filled circle.
   * @param center - The center of the circle.
   * @param radius - The radius of the circle.
   * @param segments - The number of segments in the circle.
   */
  drawFilledCircle(center: Vec2, radius: number, segments: number = 32): void {
    this.imageRenderer.commit();
    this.shapeRenderer.color = this.color;
    this.shapeRenderer.transform = this.transform;
    this.drawFilledCircle(center, radius, segments);
  }

  /**
   * Draw a circle.
   * @param center - The center of the circle.
   * @param radius - The radius of the circle.
   * @param segments - The number of segments in the circle.
   * @param lineWidth - The width of the line.
   */
  drawCircle(center: Vec2, radius: number, segments: number = 32, lineWidth: number = 1): void {
    this.imageRenderer.commit();
    this.shapeRenderer.color = this.color;
    this.shapeRenderer.transform = this.transform;
    this.drawCircle(center, radius, segments, lineWidth);
  }

  /**
   * Draw a filled polygon.
   * @param center - The center of the polygon.
   * @param vertices - The vertices of the polygon.
   */
  drawFilledPolygon(center: Vec2, vertices: Vec2[]): void {
    this.imageRenderer.commit();
    this.shapeRenderer.color = this.color;
    this.shapeRenderer.transform = this.transform;
    this.drawFilledPolygon(center, vertices);
  }

  /**
   * Draw a polygon.
   * @param center - The center of the polygon.
   * @param vertices - The vertices of the polygon.
   * @param lineWidth - The width of the line.
   */
  drawPolygon(center: Vec2, vertices: Vec2[], lineWidth: number = 1): void {
    this.imageRenderer.commit();
    this.shapeRenderer.color = this.color;
    this.shapeRenderer.transform = this.transform;
    this.drawPolygon(center, vertices, lineWidth);
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
    this.shapeRenderer.commit();
    this.imageRenderer.color = this.color;
    this.imageRenderer.transform = this.transform;
    this.imageRenderer.drawImage(image, position, flip, frame, size);
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
    this.shapeRenderer.commit();
    this.imageRenderer.color = this.color;
    this.imageRenderer.transform = this.transform;
    this.imageRenderer.drawImagePoints(image, topLeft, topRight, bottomRight, bottomLeft, frame);
  }

  /**
   * Draw a render target to the screen.
   * @param position - The position to draw the render target at.
   * @param target - The render target to draw.
   */
  drawRenderTarget(position: Vec2, target: RenderTarget): void {
    this.shapeRenderer.commit();
    this.imageRenderer.drawRenderTarget(position, target);
  }

  /**
   * Draw a string of text to the screen.
   * @param position - The position to draw the text at.
   * @param font - The font to use.
   * @param text - The text to draw.
   */
  drawBitmapText(position: Vec2, font: BitmapFont, text: string): void {
    this.shapeRenderer.commit();
    this.imageRenderer.drawBitmapText(position, font, text);
  }

  setBool(location: WebGLUniformLocation | null, value: boolean): void {
    this.context.gl.uniform1i(location, value ? 1 : 0);
  }

  setInt(location: WebGLUniformLocation | null, value: number): void {
    this.context.gl.uniform1i(location, value);
  }

  setInt2(location: WebGLUniformLocation | null, value1: number, value2: number): void {
    this.context.gl.uniform2i(location, value1, value2);
  }

  setInt3(location: WebGLUniformLocation | null, value1: number, value2: number, value3: number): void {
    this.context.gl.uniform3i(location, value1, value2, value3);
  }

  // biome-ignore lint/nursery/useMaxParams: Can be called a lot so optimize for performance
  setInt4(location: WebGLUniformLocation | null, value1: number, value2: number, value3: number, value4: number): void {
    this.context.gl.uniform4i(location, value1, value2, value3, value4);
  }

  setInts(location: WebGLUniformLocation | null, value: Int32Array): void {
    this.context.gl.uniform1iv(location, value);
  }

  setFloat(location: WebGLUniformLocation | null, value: number): void {
    this.context.gl.uniform1f(location, value);
  }

  setFloat2(location: WebGLUniformLocation | null, value1: number, value2: number): void {
    this.context.gl.uniform2f(location, value1, value2);
  }

  setFloat3(location: WebGLUniformLocation | null, value1: number, value2: number, value3: number): void {
    this.context.gl.uniform3f(location, value1, value2, value3);
  }

  // biome-ignore lint/nursery/useMaxParams: Can be called a lot so optimize for performance
  setFloat4(
    location: WebGLUniformLocation | null,
    value1: number,
    value2: number,
    value3: number,
    value4: number,
  ): void {
    this.context.gl.uniform4f(location, value1, value2, value3, value4);
  }

  setFloats(location: WebGLUniformLocation | null, value: Float32Array): void {
    this.context.gl.uniform1fv(location, value);
  }

  setMatrix(location: WebGLUniformLocation | null, value: Mat4): void {
    this.context.gl.uniformMatrix4fv(location, false, value.value);
  }

  setTexture(unit: number, value?: Image): void {
    const gl = this.context.gl;
    gl.activeTexture(gl.TEXTURE0 + unit);
    if (value) {
      gl.bindTexture(gl.TEXTURE_2D, value.texture);
    } else {
      gl.bindTexture(gl.TEXTURE_2D, null);
    }
  }
}
