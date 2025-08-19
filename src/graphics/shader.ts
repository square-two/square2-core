import { inject } from '../di/inject.js';
import { getImageVertexSource, getShapeVertexSource } from './defaultShaders.js';
import type { GLContext } from './glContext.js';
import type { BlendParameters, TextureParameters } from './types.js';

/**
 * Is the shader for shapes or images.
 */
export type ShaderType = 'shape' | 'image';

/**
 * A shader program that can be used to render shapes or images.
 */
export class Shader {
  /**
   * The type of shader.
   */
  readonly type: ShaderType;

  /**
   * All blending parameters for the shader.
   */
  blendParameters: BlendParameters;

  /**
   * All texture filtering and wrapping parameters for the shader.
   */
  textureParameters: TextureParameters;

  /**
   * The location of the projection matrix uniform.
   */
  readonly projectionLocation: WebGLUniformLocation;

  /**
   * The location of the texture uniform if this is an image shader.
   */
  readonly textureLocation: WebGLUniformLocation | null;

  /**
   * The location of the vertex position attribute.
   */
  readonly vertexPositionLocation = 0;

  /**
   * The location of the vertex color attribute.
   */
  readonly vertexColorLocation = 1;

  /**
   * The location of the vertex UV attribute if this is an image shader.
   */
  readonly vertexUVLocation = 2;

  /**
   * The WebGL rendering context.
   */
  @inject('glContext')
  private context!: GLContext;

  /**
   * The compiled vertex shader.
   */
  private vertexShader: WebGLShader;

  /**
   * The compiled fragment shader.
   */
  private fragmentShader: WebGLShader;

  /**
   * The shader program.
   */
  private program: WebGLProgram;

  /**
   * The anisotropic filter extension if it is available.
   */
  private anisotropicFilter: EXT_texture_filter_anisotropic | null;

  /**
   * Create a new shader.
   * @param type - The type of shader to create.
   * @param source - The fragment shader source.
   */
  constructor(type: ShaderType, source: string) {
    this.type = type;
    const gl = this.context.gl;

    this.anisotropicFilter = this.context.gl.getExtension('EXT_texture_filter_anisotropic');

    const vertexSource =
      type === 'shape' ? getShapeVertexSource(this.context.isGL1) : getImageVertexSource(this.context.isGL1);

    this.vertexShader = this.createShader(gl.VERTEX_SHADER, vertexSource);
    this.fragmentShader = this.createShader(gl.FRAGMENT_SHADER, source);

    this.program = this.createProgram();

    const projection = this.getUniformLocation('u_projectionMatrix');
    if (!projection) {
      throw new Error('projectionMatrix not available in the vertex shader');
    }
    this.projectionLocation = projection;

    this.textureLocation = null;
    if (type === 'image') {
      const texture = this.getUniformLocation('u_texture');
      if (!texture) {
        throw new Error('tex not available in the fragment shader');
      }
      this.textureLocation = texture;
    }

    this.blendParameters = {
      source: 'blend one',
      destination: 'inverse source alpha',
      operation: 'add',
      alphaSource: 'blend one',
      alphaDestination: 'inverse source alpha',
      alphaOperation: 'add',
    };

    this.textureParameters = {
      minFilter: 'linear',
      magFilter: 'linear',
      mipmap: 'none',
      uWrap: 'clamp to edge',
      vWrap: 'clamp to edge',
    };
  }

  /**
   * Use the shader program.
   */
  use(): void {
    this.context.gl.useProgram(this.program);
  }

  /**
   * Get the location of a uniform in the shader program.
   * @param id - The uniform identifier.
   * @returns The uniform location or null if it does not exist.
   */
  getUniformLocation(id: string): WebGLUniformLocation | null {
    return this.program ? this.context.gl.getUniformLocation(this.program, id) : null;
  }

  /**
   * Apply the texture parameters to a texture.
   * @param textUnit - The texture unit to apply the parameters to.
   */
  applyTextureParameters(textUnit: number): void {
    const gl = this.context.gl;
    gl.activeTexture(gl.TEXTURE0 + textUnit);

    const tex2d = gl.TEXTURE_2D;
    gl.texParameteri(tex2d, gl.TEXTURE_WRAP_S, this.context.getGLTextureWrap(this.textureParameters.uWrap));
    gl.texParameteri(tex2d, gl.TEXTURE_WRAP_T, this.context.getGLTextureWrap(this.textureParameters.vWrap));
    gl.texParameteri(
      tex2d,
      gl.TEXTURE_MIN_FILTER,
      this.context.getGLTextureFilter(this.textureParameters.minFilter, this.textureParameters.mipmap),
    );
    gl.texParameteri(
      tex2d,
      gl.TEXTURE_MAG_FILTER,
      this.context.getGLTextureFilter(this.textureParameters.magFilter, this.textureParameters.mipmap),
    );

    if (this.textureParameters.minFilter === 'anisotropic' && this.anisotropicFilter) {
      gl.texParameteri(tex2d, this.anisotropicFilter.TEXTURE_MAX_ANISOTROPY_EXT, 4);
    }
  }

  /**
   * Apply the shader blend mode.
   */
  applyBlendMode(): void {
    const gl = this.context.gl;
    if (this.blendParameters.source === 'blend one' && this.blendParameters.destination === 'blend zero') {
      gl.disable(gl.BLEND);
    } else {
      gl.enable(gl.BLEND);
      gl.blendFuncSeparate(
        this.context.getGLBlendMode(this.blendParameters.source),
        this.context.getGLBlendMode(this.blendParameters.destination),
        this.context.getGLBlendMode(this.blendParameters.alphaSource),
        this.context.getGLBlendMode(this.blendParameters.alphaDestination),
      );
      gl.blendEquationSeparate(
        this.context.getGLBlendOperation(this.blendParameters.operation),
        this.context.getGLBlendOperation(this.blendParameters.alphaOperation),
      );
    }
  }

  /**
   * Destroy the shader.
   */
  destroy(): void {
    this.context.gl.deleteProgram(this.program);
    this.context.gl.deleteShader(this.vertexShader);
    this.context.gl.deleteShader(this.fragmentShader);
  }

  /**
   * Create a shader.
   * @param type - The type of shader to create. (vertex or fragment).
   * @param source - The shader source.
   * @returns The compiled shader.
   */
  private createShader(type: number, source: string): WebGLShader {
    const gl = this.context.gl;
    const shader = gl.createShader(type);
    if (!shader) {
      throw new Error('Unable to create shader.');
    }

    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(`Error compiling shader:\n${gl.getShaderInfoLog(shader)}`);
    }

    return shader;
  }

  /**
   * Create a shader program.
   * @returns The shader program.
   */
  private createProgram(): WebGLProgram {
    const gl = this.context.gl;
    const program = gl.createProgram();
    if (program) {
      gl.attachShader(program, this.vertexShader);
      gl.attachShader(program, this.fragmentShader);
      gl.linkProgram(program);

      const success = gl.getProgramParameter(program, gl.LINK_STATUS) as boolean;
      if (!success) {
        const error = gl.getProgramInfoLog(program);
        throw new Error(`Error while linking shader program: ${error}`);
      }

      gl.bindAttribLocation(program, this.vertexPositionLocation, 'a_vertexPosition');
      gl.bindAttribLocation(program, this.vertexColorLocation, 'a_vertexColor');

      if (this.type === 'image') {
        gl.bindAttribLocation(program, this.vertexUVLocation, 'a_vertexUV');
      }

      return program;
    }

    throw new Error('Unable to create shader program');
  }
}
