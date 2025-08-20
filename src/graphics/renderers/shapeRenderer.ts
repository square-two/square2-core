import type { Rectangle } from '../../math/rectangle.js';
import { Vec2 } from '../../math/vec2.js';
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
  private readonly tempVec3: Vec3;

  private readonly tempP1: Vec2;

  private readonly tempP2: Vec2;

  private readonly tempP3: Vec2;

  private readonly tempP4: Vec2;

  /**
   * Create a new shape renderer.
   */
  constructor(context: GLContext) {
    super(context);

    this.tempVec3 = new Vec3();
    this.tempP1 = new Vec2();
    this.tempP2 = new Vec2();
    this.tempP3 = new Vec2();
    this.tempP4 = new Vec2();

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
        super.setShader(shader);
      }
    } else {
      super.setShader();
    }
  }

  start(): void {
    this.index = 0;
  }

  /**
   * Draw the current batch of triangles.
   */
  commit(): void {
    if (this.index === 0) {
      return;
    }

    this.shader.use();
    this.shader.applyBlendMode();

    const gl = this.context.gl;
    gl.uniformMatrix4fv(this.shader.uniforms.u_projectionMatrix, false, this.projection.value);
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
   * Draw a filled triangle.
   * @param p1 - The first point of the triangle.
   * @param p2 - The second point of the triangle.
   * @param p3 - The third point of the triangle.
   */
  drawFilledTriangle(p1: Vec2, p2: Vec2, p3: Vec2): void {
    if (this.index >= this.BUFFER_SIZE) {
      this.commit();
    }

    this.tempVec3.transformMat4(this.transform, p1.x, p1.y, 0);
    this.updateBuffer(this.tempVec3, this.color, 0);

    this.tempVec3.transformMat4(this.transform, p2.x, p2.y, 0);
    this.updateBuffer(this.tempVec3, this.color, 1);

    this.tempVec3.transformMat4(this.transform, p3.x, p3.y, 0);
    this.updateBuffer(this.tempVec3, this.color, 2);

    this.index++;
  }

  /**
   * Draw a line.
   * @param p1 - The first point of the line.
   * @param p2 - The second point of the line.
   * @param align - The alignment of the line.
   * @param lineWidth - The width of the line.
   */
  drawLine(p1: Vec2, p2: Vec2, align: LineAlign, lineWidth: number): void {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const lineLength = Math.sqrt(dx * dx + dy * dy);
    if (!lineLength) {
      return;
    }

    const scale = lineWidth / (2 * lineLength);
    const ddx = -scale * dy;
    const ddy = scale * dx;
    switch (align) {
      case 'inside':
        this.tempP1.set(p1.x, p1.y);
        this.tempP2.set(p1.x + ddx * 2, p1.y + ddy * 2);
        this.tempP3.set(p2.x, p2.y);
        this.tempP4.set(p2.x + ddx * 2, p2.y + ddy * 2);
        break;

      case 'center':
        this.tempP1.set(p1.x + ddx, p1.y + ddy);
        this.tempP2.set(p1.x - ddx, p1.y - ddy);
        this.tempP3.set(p2.x + ddx, p2.y + ddy);
        this.tempP4.set(p2.x - ddx, p2.y - ddy);
        break;

      case 'outside':
        this.tempP1.set(p1.x, p1.y);
        this.tempP2.set(p1.x - ddx * 2, p1.y - ddy * 2);
        this.tempP3.set(p2.x, p2.y);
        this.tempP4.set(p2.x - ddx * 2, p2.y - ddy * 2);
        break;
    }

    this.drawFilledTriangle(this.tempP1, this.tempP2, this.tempP3);
    this.drawFilledTriangle(this.tempP3, this.tempP2, this.tempP4);
  }

  /**
   * Draw a filled rectangle.
   * @param rect - The rectangle to draw.
   */
  drawFilledRect(rect: Rectangle): void {
    this.tempP1.set(rect.x, rect.y);
    this.tempP2.set(rect.x + rect.width, rect.y);
    this.tempP3.set(rect.x, rect.y + rect.height);
    this.tempP4.set(rect.x + rect.width, rect.y + rect.height);
    this.drawFilledTriangle(this.tempP1, this.tempP2, this.tempP3);
    this.drawFilledTriangle(this.tempP3, this.tempP2, this.tempP4);
  }

  /**
   * Draw a rectangle.
   * @param rect - The rectangle to draw.
   * @param lineWidth - The width of the line.
   */
  drawRect(rect: Rectangle, lineWidth: number): void {
    // Top.
    this.tempP1.set(rect.x, rect.y);
    this.tempP2.set(rect.x + rect.width, rect.y);
    this.drawLine(this.tempP1, this.tempP2, 'inside', lineWidth);

    // Right.
    this.tempP1.set(rect.x + rect.width, rect.y);
    this.tempP2.set(rect.x + rect.width, rect.y + rect.height);
    this.drawLine(this.tempP1, this.tempP2, 'inside', lineWidth);

    // Bottom.
    this.tempP1.set(rect.x + rect.width, rect.y + rect.height);
    this.tempP2.set(rect.x, rect.y + rect.height);
    this.drawLine(this.tempP1, this.tempP2, 'inside', lineWidth);

    // Left.
    this.tempP1.set(rect.x, rect.y + rect.height);
    this.tempP2.set(rect.x, rect.y);
    this.drawLine(this.tempP1, this.tempP2, 'inside', lineWidth);
  }

  /**
   * Draw a filled circle.
   * @param center - The center of the circle.
   * @param radius - The radius of the circle.
   * @param segments - The number of segments in the circle.
   */
  drawFilledCircle(center: Vec2, radius: number, segments: number): void {
    if (radius <= 0) {
      console.error('ShapeRenderer: Radius must be positive.');
      return;
    }

    if (segments < 3) {
      console.error('ShapeRenderer: Segments must be at least 3.');
      return;
    }

    const theta = (2 * Math.PI) / segments;
    const cos = Math.cos(theta);
    const sin = Math.sin(theta);
    let sx = radius;
    let sy = 0.0;
    for (let i = 0; i < segments; i++) {
      const px = sx + center.x;
      const py = sy + center.y;
      const t = sx;
      sx = cos * sx - sin * sy;
      sy = cos * sy + sin * t;
      this.tempP1.set(px, py);
      this.tempP2.set(sx + center.x, sy + center.y);
      this.drawFilledTriangle(this.tempP1, this.tempP2, center);
    }
  }

  /**
   * Draw a circle.
   * @param center - The center of the circle.
   * @param radius - The radius of the circle.
   * @param segments - The number of segments in the circle.
   * @param lineWidth - The width of the line.
   */
  drawCircle(center: Vec2, radius: number, segments: number, lineWidth: number): void {
    if (radius <= 0) {
      console.error('ShapeRenderer: Radius must be positive.');
      return;
    }

    if (segments < 3) {
      console.error('ShapeRenderer: Segments must be at least 3.');
      return;
    }

    if (lineWidth <= 0) {
      console.error('ShapeRenderer: Line width must be positive.');
      return;
    }

    const theta = (2 * Math.PI) / segments;
    const cos = Math.cos(theta);
    const sin = Math.sin(theta);
    let sx = radius;
    let sy = 0.0;
    for (let i = 0; i < segments; i++) {
      const px = sx + center.x;
      const py = sy + center.y;
      const t = sx;
      sx = cos * sx - sin * sy;
      sy = cos * sy + sin * t;
      this.tempP1.set(px, py);
      this.tempP2.set(sx + center.x, sy + center.y);
      this.drawLine(this.tempP1, this.tempP2, 'outside', lineWidth);
    }
  }

  /**
   * Draw a filled polygon.
   * @param center - The center of the polygon.
   * @param vertices - The vertices of the polygon.
   */
  drawFilledPolygon(center: Vec2, vertices: Vec2[]): void {
    if (vertices.length < 3) {
      console.log('Cannot draw polygon with less than 3 points');
      return;
    }

    const first = vertices[0];
    let last = vertices[1];

    for (let i = 2; i < vertices.length; i++) {
      const current = vertices[i];
      this.tempP1.set(first.x + center.x, first.y + center.y);
      this.tempP2.set(last.x + center.x, last.y + center.y);
      this.tempP3.set(current.x + center.x, current.y + center.y);
      this.drawFilledTriangle(this.tempP1, this.tempP2, this.tempP3);
      last = current;
    }
  }

  /**
   * Draw a polygon.
   * @param center - The center of the polygon.
   * @param vertices - The vertices of the polygon.
   * @param lineWidth - The width of the line.
   */
  drawPolygon(center: Vec2, vertices: Vec2[], lineWidth: number): void {
    if (vertices.length < 3) {
      console.log('Cannot draw polygon with less than 3 points');
      return;
    }

    const start = vertices[0];
    let last = start;

    for (let i = 1; i < vertices.length; i++) {
      const current = vertices[i];
      this.tempP1.set(last.x + center.x, last.y + center.y);
      this.tempP2.set(current.x + center.x, current.y + center.y);
      this.drawLine(this.tempP1, this.tempP2, 'inside', lineWidth);
      last = current;
    }

    // Connect the last vertex to the first.
    this.tempP1.set(last.x + center.x, last.y + center.y);
    this.tempP2.set(start.x + center.x, start.y + center.y);
    this.drawLine(this.tempP1, this.tempP2, 'inside', lineWidth);
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
