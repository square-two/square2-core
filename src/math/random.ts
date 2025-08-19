import { Color } from '../graphics/color.js';
import { clamp } from './mathUtils.js';

const MULTIPLIER = 48271.0;

const MODULUS = 0x7fffffff;

/**
 * Lehmer seeded random number generator.
 */
export class Random {
  /**
   * The seed used to generate random numbers.
   */
  get seed(): number {
    return this._seed;
  }

  /**
   * Set a new seed for the random number generator.
   */
  set seed(value: number) {
    this._seed = this.internalSeed = this.rangeBound(value);
  }

  /**
   * The seed for the next random number.
   */
  private internalSeed = 1.0;

  /**
   * The start seed.
   */
  private _seed = 1;

  /**
   * Create a new random number generator.
   * @param seed - The seed to use for the random number generator.
   */
  constructor(seed?: number) {
    this.resetSeed();
    if (seed) {
      this.seed = seed;
    }
  }

  /**
   * Reset the seed to a random value.
   */
  resetSeed(): void {
    this.seed = this.rangeBound(Math.floor(Math.random() * MODULUS));
  }

  /**
   * Generate a random integer between min and max (inclusive).
   * @param min - The minimum value.
   * @param max - The maximum value.
   * @returns The random integer.
   */
  int(min: number = 0, max: number = MODULUS): number {
    if (min === 0 && max === MODULUS) {
      return Math.floor(this.generate());
    }

    if (min === max) {
      return Math.floor(min);
    }

    let minSource = min;
    let maxSource = max;
    if (minSource > maxSource) {
      const temp = maxSource;
      maxSource = minSource;
      minSource = temp;
    }

    return Math.floor(minSource + (this.generate() / MODULUS) * (maxSource - minSource + 1));
  }

  /**
   * Generate a random float between min and max.
   * @param min - The minimum value.
   * @param max - The maximum value.
   * @returns The random float.
   */
  float(min: number = 0, max: number = 1): number {
    if (min === 0 && max === 1) {
      return this.generate() / MODULUS;
    }

    if (min === max) {
      return min;
    }

    let minSource = min;
    let maxSource = max;

    if (minSource > maxSource) {
      const temp = maxSource;
      maxSource = minSource;
      minSource = temp;
    }

    return minSource + (this.generate() / MODULUS) * (maxSource - minSource);
  }

  /**
   * Generate a random color.
   * @param min - The minimum intensity.
   * @param max - The maximum intensity.
   * @param rndAlpha - Should the alpha be random.
   * @returns The random color.
   */
  color(min: number = 0, max: number = 1, rndAlpha: boolean = true): Color {
    const minColor = clamp(min, 0, 1);
    const maxColor = clamp(max, 0, 1);
    const alpha = rndAlpha ? this.float(minColor, maxColor) : 1.0;

    return new Color(
      this.float(minColor, maxColor),
      this.float(minColor, maxColor),
      this.float(minColor, maxColor),
      alpha,
    );
  }

  /**
   * Generate the next random number.
   * @returns The next random number.
   */
  private generate(): number {
    this.internalSeed = (this.internalSeed * MULTIPLIER) % MODULUS;

    return this.internalSeed;
  }

  /**
   * Clamp the seed to a valid range.
   * @param seed - The seed to clamp.
   * @returns The clamped value.
   */
  private rangeBound(seed: number): number {
    return clamp(seed, 1, MODULUS - 1);
  }
}
