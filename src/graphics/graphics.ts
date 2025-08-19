import { Mat4 } from '../math/mat4.js';
import type { Vec2 } from '../math/vec2.js';
import type { BitmapFont } from './bitmapFont.js';
import { Color } from './color.js';
import type { GLContext } from './glContext.js';
import type { Image } from './image.js';
import { ImageRenderer } from './renderers/imageRenderer.js';
import { ShapeRenderer } from './renderers/shapeRenderer.js';
import type { RenderTarget } from './renderTarget.js';
import type { Shader } from './shader.js';
import type { LineAlign } from './types.js';

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

    this.projection.ortho(0, width, height, 0, 0, 1000);
    gl.viewport(0, 0, width, height);

    this.shapeRenderer.setProjection(this.projection);
    this.imageRenderer.setProjection(this.projection);

    if (clear) {
      if (newClearColor) {
        gl.clearColor(newClearColor.red, newClearColor.green, newClearColor.blue, newClearColor.alpha);
      } else {
        gl.clearColor(this.clearColor.red, this.clearColor.green, this.clearColor.blue, this.clearColor.alpha);
      }
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
  }

  drawBatch(): void {
    this.shapeRenderer.drawBatch();
    this.imageRenderer.drawBatch();
  }

  setShader(shader?: Shader): void {
    this.shapeRenderer.setShader(shader);
    this.imageRenderer.setShader(shader);
  }

  drawSolidTriangle(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): void {
    this.imageRenderer.drawBatch();
    this.shapeRenderer.drawSolidTriangle(x1, y1, x2, y2, x3, y3, this.color, this.transform);
  }

  drawSolidRect(x: number, y: number, width: number, height: number): void {
    this.imageRenderer.drawBatch();
    this.shapeRenderer.drawSolidRect(x, y, width, height, this.color, this.transform);
  }

  drawRect(x: number, y: number, width: number, height: number, lineWidth: number = 1): void {
    this.imageRenderer.drawBatch();
    this.shapeRenderer.drawRect(x, y, width, height, lineWidth, this.color, this.transform);
  }

  drawLine(x1: number, y1: number, x2: number, y2: number, align: LineAlign, lineWidth: number = 1): void {
    this.imageRenderer.drawBatch();
    this.shapeRenderer.drawLine(x1, y1, x2, y2, align, lineWidth, this.color, this.transform);
  }

  drawSolidCircle(x: number, y: number, radius: number, segments: number = 32): void {
    this.imageRenderer.drawBatch();
    this.shapeRenderer.drawSolidCircle(x, y, radius, segments, this.color, this.transform);
  }

  drawCircle(x: number, y: number, radius: number, segments: number = 32, lineWidth: number = 1): void {
    this.imageRenderer.drawBatch();
    this.shapeRenderer.drawCircle(x, y, radius, segments, lineWidth, this.color, this.transform);
  }

  drawSolidPolygon(x: number, y: number, vertices: Vec2[]): void {
    this.imageRenderer.drawBatch();
    this.shapeRenderer.drawSolidPolygon(x, y, vertices, this.color, this.transform);
  }

  drawPolygon(x: number, y: number, vertices: Vec2[], lineWidth: number = 1): void {
    this.imageRenderer.drawBatch();
    this.shapeRenderer.drawPolygon(x, y, vertices, lineWidth, this.color, this.transform);
  }

  drawImage(x: number, y: number, image: Image, flipX: boolean = false, flipY: boolean = false): void {
    this.shapeRenderer.drawBatch();
    this.imageRenderer.drawImage(x, y, flipX, flipY, image, this.color, this.transform);
  }

  drawScaledImage(
    x: number,
    y: number,
    width: number,
    height: number,
    image: Image,
    flipX: boolean = false,
    flipY: boolean = false,
  ): void {
    this.shapeRenderer.drawBatch();
    this.imageRenderer.drawScaledImage(x, y, width, height, flipX, flipY, image, this.color, this.transform);
  }

  drawImageSection(
    x: number,
    y: number,
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    image: Image,
    flipX: boolean = false,
    flipY: boolean = false,
  ): void {
    this.shapeRenderer.drawBatch();
    this.imageRenderer.drawImageSection(x, y, sx, sy, sw, sh, flipX, flipY, image, this.color, this.transform);
  }

  drawScaledImageSection(
    x: number,
    y: number,
    width: number,
    height: number,
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    image: Image,
    flipX: boolean = false,
    flipY: boolean = false,
  ): void {
    this.shapeRenderer.drawBatch();
    this.imageRenderer.drawScaledImageSection(
      x,
      y,
      width,
      height,
      sx,
      sy,
      sw,
      sh,
      flipX,
      flipY,
      image,
      this.color,
      this.transform,
    );
  }

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
  ): void {
    this.shapeRenderer.drawBatch();
    this.imageRenderer.drawImagePoints(tlX, tlY, trX, trY, brX, brY, blX, blY, image, this.color, this.transform);
  }

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
  ): void {
    this.shapeRenderer.drawBatch();
    this.imageRenderer.drawImageSectionPoints(
      tlX,
      tlY,
      trX,
      trY,
      brX,
      brY,
      blX,
      blY,
      sx,
      sy,
      sw,
      sh,
      image,
      this.color,
      this.transform,
    );
  }

  drawRenderTarget(x: number, y: number, target: RenderTarget): void {
    this.shapeRenderer.drawBatch();
    this.imageRenderer.drawRenderTarget(x, y, target, this.color, this.transform);
  }

  drawBitmapText(x: number, y: number, font: BitmapFont, text: string): void {
    this.shapeRenderer.drawBatch();
    this.imageRenderer.drawBitmapText(x, y, font, text, this.color, this.transform);
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
