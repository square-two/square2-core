import type { Mat4 } from '../../math/mat4.js';
import type { Vec2 } from '../../math/vec2.js';
import { Vec3 } from '../../math/vec3.js';
import type { Color } from '../color.js';
import { getShapeFragmentSource } from '../defaultShaders.js';
import type { GLContext } from '../glContext.js';
import { Shader } from '../shader.js';
import type { LineAlign } from '../types.js';
import { BaseRenderer } from './baseRenderer.js';

/**
 * The buffer offset per vertex.
 * position: x, y, z.
 * color: r, g, b, a.
 */
const OFFSET = 7;

/**
 * The buffer offset per triangle.
 */
const TRIANGLE_OFFSET: number = OFFSET * 3;

/**
 * The amount of vertices per triangle.
 */
const VERTICES_PER_TRI = 3;

/**
 * The shape renderer can render triangles, rectangles, circles, and lines.
 * Each shape is made up of triangles. And they are batched together to reduce draw calls.
 */
export class ShapeRenderer extends BaseRenderer {
  /**
   * The current batch index in the buffer.
   */
  private index = 0;

  /**
   * Temporary vector to store a vertex position.
   */
  private tempPoint: Vec3;

  /**
   * Create a new shape renderer.
   */
  constructor(context: GLContext) {
    super(context);

    this.tempPoint = new Vec3();

    this.vertexBuffer = context.gl.createBuffer();
    this.vertexIndices = new Float32Array(this.BUFFER_SIZE * TRIANGLE_OFFSET);

    this.indexBuffer = context.gl.createBuffer();
    this.indexIndices = new Int32Array(this.BUFFER_SIZE * VERTICES_PER_TRI);

    // The indices are the same for all triangles.
    for (let i = 0; i < this.indexIndices.length; i++) {
      this.indexIndices[i * VERTICES_PER_TRI] = i * VERTICES_PER_TRI;
      this.indexIndices[i * VERTICES_PER_TRI + 1] = i * VERTICES_PER_TRI + 1;
      this.indexIndices[i * VERTICES_PER_TRI + 2] = i * VERTICES_PER_TRI + 2;
    }

    this.createDefaultShader();
  }

  /**
   * Set the current shader.
   * @param shader - The shader to use. If not provided, the default shader will be used.
   */
  override setShader(shader?: Shader): void {
    if (shader) {
      if (shader.type === 'shape') {
        this.shader = shader;
      }
    } else {
      this.shader = this.defaultShader;
    }
  }

  /**
   * Draw the current batch of triangles.
   */
  drawBatch(): void {
    if (this.index === 0) {
      return;
    }

    this.shader.use();
    this.shader.applyBlendMode();

    const gl = this.context.gl;
    gl.uniformMatrix4fv(this.shader.projectionLocation, false, this.projection.value);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertexIndices, gl.DYNAMIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indexIndices, gl.STATIC_DRAW);

    gl.vertexAttribPointer(this.shader.vertexPositionLocation, 3, gl.FLOAT, false, 7 * this.FLOAT_SIZE, 0);
    gl.enableVertexAttribArray(this.shader.vertexPositionLocation);

    gl.vertexAttribPointer(
      this.shader.vertexColorLocation,
      4,
      gl.FLOAT,
      false,
      7 * this.FLOAT_SIZE,
      3 * this.FLOAT_SIZE,
    );
    gl.enableVertexAttribArray(this.shader.vertexColorLocation);

    gl.drawElements(gl.TRIANGLES, this.index * VERTICES_PER_TRI, gl.UNSIGNED_INT, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    gl.disableVertexAttribArray(this.shader.vertexPositionLocation);
    gl.disableVertexAttribArray(this.shader.vertexColorLocation);

    this.index = 0;
  }

  /**
   * Draw a solid triangle.
   * @param x1 - The x coordinate of the first point.
   * @param y1 - The y coordinate of the first point.
   * @param x2 - The x coordinate of the second point.
   * @param y2 - The y coordinate of the second point.
   * @param x3 - The x coordinate of the third point.
   * @param y3 - The y coordinate of the third point.
   * @param color - The color of the triangle.
   * @param transform - The transformation matrix.
   */
  drawSolidTriangle(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number,
    color: Color,
    transform: Mat4,
  ): void {
    if (this.index >= this.BUFFER_SIZE) {
      this.drawBatch();
    }

    this.tempPoint.transformMat4(transform, x1, y1, 0);
    this.updateBuffer(this.tempPoint, color, 0);

    this.tempPoint.transformMat4(transform, x2, y2, 0);
    this.updateBuffer(this.tempPoint, color, 1);

    this.tempPoint.transformMat4(transform, x3, y3, 0);
    this.updateBuffer(this.tempPoint, color, 2);

    this.index++;
  }

  /**
   * Draw a solid rectangle.
   * @param x - The x coordinate of the top left corner.
   * @param y - The y coordinate of the top left corner.
   * @param width - The width of the rectangle.
   * @param height - The height of the rectangle.
   * @param color - The color of the rectangle.
   * @param transform - The transformation matrix.
   */
  drawSolidRect(x: number, y: number, width: number, height: number, color: Color, transform: Mat4): void {
    this.drawSolidTriangle(x, y, x + width, y, x, y + height, color, transform);
    this.drawSolidTriangle(x, y + height, x + width, y, x + width, y + height, color, transform);
  }

  /**
   * Draw a rectangle.
   * @param x - The x coordinate of the top left corner.
   * @param y - The y coordinate of the top left corner.
   * @param width - The width of the rectangle.
   * @param height - The height of the rectangle.
   * @param lineWidth - The width of the line.
   * @param color - The color of the rectangle.
   * @param transform - The transformation matrix.
   */
  drawRect(
    x: number,
    y: number,
    width: number,
    height: number,
    lineWidth: number,
    color: Color,
    transform: Mat4,
  ): void {
    // top
    this.drawLine(x, y, x + width, y, 'inside', lineWidth, color, transform);
    // right
    this.drawLine(x + width, y, x + width, y + height, 'inside', lineWidth, color, transform);
    // bottom
    this.drawLine(x + width, y + height, x, y + height, 'inside', lineWidth, color, transform);
    // left
    this.drawLine(x, y + height, x, y, 'inside', lineWidth, color, transform);
  }

  /**
   * Draw a line.
   * @param x1 - The x coordinate of the first point.
   * @param y1 - The y coordinate of the first point.
   * @param x2 - The x coordinate of the second point.
   * @param y2 - The y coordinate of the second point.
   * @param align - The alignment of the line.
   * @param lineWidth - The width of the line.
   * @param color - The color of the line.
   * @param transform - The transformation matrix.
   */
  drawLine(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    align: LineAlign,
    lineWidth: number,
    color: Color,
    transform: Mat4,
  ): void {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lineLength = Math.sqrt(dx * dx + dy * dy);
    const scale = lineWidth / (2 * lineLength);
    const ddx = -scale * dy;
    const ddy = scale * dx;
    switch (align) {
      case 'inside':
        this.drawSolidTriangle(x1, y1, x1 + ddx * 2, y1 + ddy * 2, x2, y2, color, transform);
        this.drawSolidTriangle(x2, y2, x1 + ddx * 2, y1 + ddy * 2, x2 + ddx * 2, y2 + ddy * 2, color, transform);
        break;

      case 'center':
        this.drawSolidTriangle(x1 + ddx, y1 + ddy, x1 - ddx, y1 - ddy, x2 + ddx, y2 + ddy, color, transform);
        this.drawSolidTriangle(x2 + ddx, y2 + ddy, x1 - ddx, y1 - ddy, x2 - ddx, y2 - ddy, color, transform);
        break;

      case 'outside':
        this.drawSolidTriangle(x1, y1, x1 - ddx * 2, y1 - ddy * 2, x2, y2, color, transform);
        this.drawSolidTriangle(x2, y2, x1 - ddx * 2, y1 - ddy * 2, x2 - ddx * 2, y2 - ddy * 2, color, transform);
        break;
    }
  }

  /**
   * Draw a circle.
   * @param x - The x coordinate of the circle center.
   * @param y - The y coordinate of the circle center.
   * @param radius - The radius of the circle.
   * @param segments - The number of segments in the circle.
   * @param lineWidth - The width of the line.
   * @param color - The color of the circle.
   * @param transform - The transformation matrix.
   */
  drawCircle(
    x: number,
    y: number,
    radius: number,
    segments: number,
    lineWidth: number,
    color: Color,
    transform: Mat4,
  ): void {
    const theta = (2 * Math.PI) / segments;
    const cos = Math.cos(theta);
    const sin = Math.sin(theta);
    let sx = radius;
    let sy = 0.0;
    for (let i = 0; i < segments; i++) {
      const px = sx + x;
      const py = sy + y;
      const t = sx;
      sx = cos * sx - sin * sy;
      sy = cos * sy + sin * t;
      this.drawLine(sx + x, sy + y, px, py, 'outside', lineWidth, color, transform);
    }
  }

  /**
   * Draw a solid circle.
   * @param x - The x coordinate of the circle center.
   * @param y - The y coordinate of the circle center.
   * @param radius - The radius of the circle.
   * @param segments - The number of segments in the circle.
   * @param color - The color of the circle.
   * @param transform - The transformation matrix.
   */
  drawSolidCircle(x: number, y: number, radius: number, segments: number, color: Color, transform: Mat4): void {
    const theta = (2 * Math.PI) / segments;
    const cos = Math.cos(theta);
    const sin = Math.sin(theta);
    let sx = radius;
    let sy = 0.0;
    for (let i = 0; i < segments; i++) {
      const px = sx + x;
      const py = sy + y;
      const t = sx;
      sx = cos * sx - sin * sy;
      sy = cos * sy + sin * t;
      this.drawSolidTriangle(px, py, sx + x, sy + y, x, y, color, transform);
    }
  }

  /**
   * Draw a polygon.
   * @param x - The x coordinate of the polygon center.
   * @param y - The y coordinate of the polygon center.
   * @param vertices - The vertices of the polygon.
   * @param lineWidth - The width of the line.
   * @param color - The color of the polygon.
   * @param transform - The transformation matrix.
   */
  drawPolygon(x: number, y: number, vertices: Vec2[], lineWidth: number, color: Color, transform: Mat4): void {
    if (vertices.length < 3) {
      console.log('Cannot draw polygon with less than 3 points');
      return;
    }

    const start = vertices[0];
    let last = start;

    for (let i = 1; i < vertices.length; i++) {
      const current = vertices[i];

      this.drawLine(last.x + x, last.y + y, current.x + x, current.y + y, 'inside', lineWidth, color, transform);
      last = current;
    }

    this.drawLine(last.x + x, last.y + y, start.x + x, start.y + y, 'inside', lineWidth, color, transform);
  }

  /**
   * Draw a solid polygon.
   * @param x - The x coordinate of the polygon center.
   * @param y - The y coordinate of the polygon center.
   * @param vertices - The vertices of the polygon.
   * @param color - The color of the polygon.
   * @param transform - The transformation matrix.
   */
  drawSolidPolygon(x: number, y: number, vertices: Vec2[], color: Color, transform: Mat4): void {
    if (vertices.length < 3) {
      console.log('Cannot draw polygon with less than 3 points');
      return;
    }

    const first = vertices[0];
    let last = vertices[1];

    for (let i = 2; i < vertices.length; i++) {
      const current = vertices[i];
      this.drawSolidTriangle(
        first.x + x,
        first.y + y,
        last.x + x,
        last.y + y,
        current.x + x,
        current.y + y,
        color,
        transform,
      );
      last = current;
    }
  }

  /**
   * Update the buffer with a point and color.
   * @param point - The point to add to the buffer.
   * @param color - The color of the point.
   * @param pointOffset - The offset of the point in the triangle.
   */
  private updateBuffer(point: Vec3, color: Color, pointOffset: number): void {
    const i = this.index * TRIANGLE_OFFSET + pointOffset * OFFSET;
    this.vertexIndices[i] = point.x;
    this.vertexIndices[i + 1] = point.y;
    this.vertexIndices[i + 2] = 0;
    this.vertexIndices[i + 3] = color.red;
    this.vertexIndices[i + 4] = color.green;
    this.vertexIndices[i + 5] = color.blue;
    this.vertexIndices[i + 6] = color.alpha;
  }

  /**
   * Create the default shader for the shape renderer.
   */
  private createDefaultShader(): void {
    this.defaultShader = new Shader('shape', getShapeFragmentSource(this.context.isGL1));
    this.shader = this.defaultShader;
  }
}
