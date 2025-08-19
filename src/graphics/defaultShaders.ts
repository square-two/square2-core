import { glsl } from './glContext.js';

const SHAPE_VERT: string = glsl`
  #version 300 es

  in vec3 a_vertexPosition;
  in vec4 a_vertexColor;

  uniform mat4 u_projectionMatrix;

  out vec4 v_fragmentColor;

  void main() {
    gl_Position = u_projectionMatrix * vec4(a_vertexPosition, 1.0);
    v_fragmentColor = a_vertexColor;
  }
`;

const SHAPE_FRAG: string = glsl`
  #version 300 es

  precision mediump float;

  in vec4 v_fragmentColor;

  out vec4 o_fragmentColor;

  void main() {
    o_fragmentColor = v_fragmentColor;
  }
`;

const SHAPE_VERT_GL1: string = glsl`
  #version 100

  attribute vec3 a_vertexPosition;
  attribute vec4 a_vertexColor;

  uniform mat4 u_projectionMatrix;

  varying vec4 v_fragmentColor;

  void main() {
    gl_Position = u_projectionMatrix * vec4(a_vertexPosition, 1.0);
    v_fragmentColor = a_vertexColor;
  }
`;

const SHAPE_FRAG_GL1: string = glsl`
  #version 100

  precision mediump float;

  varying vec4 v_fragmentColor;

  void main() {
    gl_FragColor = v_fragmentColor;
  }
`;

const IMAGE_VERT: string = glsl`
  #version 300 es

  in vec3 a_vertexPosition;
  in vec4 a_vertexColor;
  in vec2 a_vertexUV;

  uniform mat4 u_projectionMatrix;

  out vec2 v_fragmentUV;
  out vec4 v_fragmentColor;

  void main() {
    gl_Position = u_projectionMatrix * vec4(a_vertexPosition, 1.0);
    v_fragmentUV = a_vertexUV;
    v_fragmentColor = a_vertexColor;
  }
`;

const IMAGE_FRAG: string = glsl`
  #version 300 es

  precision mediump float;

  uniform sampler2D u_texture;

  in vec2 v_fragmentUV;
  in vec4 v_fragmentColor;

  out vec4 o_fragmentColor;

  void main() {
    vec4 textureColor = texture(u_texture, v_fragmentUV) * v_fragmentColor;
    textureColor.rgb *= v_fragmentColor.a;
    o_fragmentColor = textureColor;
  }
`;

const IMAGE_VERT_GL1: string = glsl`
  #version 100

  attribute vec3 a_vertexPosition;
  attribute vec4 a_vertexColor;
  attribute vec2 a_vertexUV;

  uniform mat4 u_projectionMatrix;

  varying vec2 v_fragmentUV;
  varying vec4 v_fragmentColor;

  void main() {
    gl_Position = u)projectionMatrix * vec4(a_vertexPosition, 1.0);
    v_fragmentUV = a_vertexUV;
    v_fragmentColor = a_vertexColor;
  }
`;

const IMAGE_FRAG_GL1: string = glsl`
  #version 100

  precision mediump float;

  uniform sampler2D u_texture;

  varying vec2 v_fragmentUV;
  varying vec4 v_fragmentColor;

  void main() {
    vec4 textureColor = texture2D(u_texture, v_fragmentUV) * v_fragmentColor;
    textureColor.rgb *= v_fragmentColor.a;
    gl_FragColor = textureColor;
  }
`;

/**
 * Get the source code for the shape vertex shader.
 * @param gl1 - If true, returns the GL1 version of the vertex shader.
 * @returns The shader source.
 */
export function getShapeVertexSource(gl1: boolean): string {
  return gl1 ? SHAPE_VERT_GL1 : SHAPE_VERT;
}

/**
 * Get the source code for the shape fragment shader.
 * @param gl1 - If true, returns the GL1 version of the fragment shader.
 * @returns The shader source.
 */
export function getShapeFragmentSource(gl1: boolean): string {
  return gl1 ? SHAPE_FRAG_GL1 : SHAPE_FRAG;
}

/**
 * Get the source code for the image vertex shader.
 * @param gl1 - If true, returns the GL1 version of the vertex shader.
 * @returns The shader source.
 */
export function getImageVertexSource(gl1: boolean): string {
  return gl1 ? IMAGE_VERT_GL1 : IMAGE_VERT;
}

/**
 * Get the source code for the image fragment shader.
 * @param gl1 - If true, returns the GL1 version of the fragment shader.
 * @returns The shader source.
 */
export function getImageFragmentSource(gl1: boolean): string {
  return gl1 ? IMAGE_FRAG_GL1 : IMAGE_FRAG;
}
