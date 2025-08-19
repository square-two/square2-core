/**
 * The different blend modes that can be used when rendering.
 */
export type BlendMode =
  | 'undefined'
  | 'blend one'
  | 'blend zero'
  | 'source alpha'
  | 'destination alpha'
  | 'inverse source alpha'
  | 'inverse destination alpha'
  | 'source color'
  | 'destination color'
  | 'inverse source color'
  | 'inverse destination color';

/**
 * The different blend operations that can be used when rendering.
 */
export type BlendOperation = 'add' | 'subtract' | 'reverse subtract';

/**
 * Mipmap filter options.
 */
export type MipmapFilter = 'none' | 'nearest' | 'linear';

/**
 * Texture filter options.
 */
export type TextureFilter = 'nearest' | 'linear' | 'anisotropic';

/**
 * Texture wrap options.
 */
export type TextureWrap = 'repeat' | 'clamp to edge' | 'mirrored repeat';

/**
 * Line drawing align options.
 */
export type LineAlign = 'inside' | 'center' | 'outside';

/**
 * The blend mode parameters.
 */
export type BlendParameters = {
  source: BlendMode;
  destination: BlendMode;
  operation: BlendOperation;
  alphaSource: BlendMode;
  alphaDestination: BlendMode;
  alphaOperation: BlendOperation;
};

/**
 * The texture parameters.
 */
export type TextureParameters = {
  minFilter: TextureFilter;
  magFilter: TextureFilter;
  mipmap: MipmapFilter;
  uWrap: TextureWrap;
  vWrap: TextureWrap;
};
