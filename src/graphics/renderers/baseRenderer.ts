import { Mat4 } from '../../math/mat4.js';
import { Color } from '../color.js';
import type { GLContext } from '../glContext.js';
import type { Shader } from '../shader.js';

/**
 * The base renderer class that all renderers should extend.
 */
export class BaseRenderer {
  color: Color;

  transform: Mat4;

  /**
   * The amount of triangles that can be stored per draw call.
   */
  protected readonly BUFFER_SIZE = 4000;

  /**
   * The size of a float in bytes.
   */
  protected readonly FLOAT_SIZE = Float32Array.BYTES_PER_ELEMENT;

  /**
   * The current shader.
   */
  protected shader!: Shader;

  /**
   * The default shader.
   */
  protected defaultShader!: Shader;

  /**
   * The projection matrix.
   */
  protected projection: Mat4;

  /**
   * The vertex buffer.
   */
  protected vertexBuffer!: WebGLBuffer;

  /**
   * The index buffer.
   */
  protected indexBuffer!: WebGLBuffer;

  /**
   * The vertex indices array.
   */
  protected vertexIndices!: Float32Array;

  /**
   * The index indices array.
   */
  protected indexIndices!: Int32Array;

  /**
   * The WebGL rendering context
   */
  protected context: GLContext;

  /**
   * Create a new base renderer.
   * @param context - The WebGL rendering context.
   */
  constructor(context: GLContext) {
    this.context = context;
    this.projection = new Mat4();
    this.color = new Color(1, 1, 1, 1);
    this.transform = new Mat4();
  }

  /**
   * Update the projection matrix.
   * @param projection - The new projection matrix.
   */
  setProjection(projection: Mat4): void {
    this.projection = projection;
  }

  /**
   * Set the current shader.
   * @param shader - The shader to use. If not provided, the default shader will be used.
   */
  setShader(shader?: Shader): void {
    this.shader = shader || this.defaultShader;
  }
}
