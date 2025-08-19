/**
 * Bitmask helper class.
 */
export class Bitset {
  value: number;

  /**
   * Create a new bitset instance.
   * @param value The bit value.
   */
  constructor(value: number = 0) {
    this.value = value;
  }

  /**
   * Add a bit to this set.
   * @param bit
   */
  add(bit: number): void {
    this.value |= bit;
  }

  /**
   * Remove a bit from this set.
   * @param bit
   */
  remove(bit: number): void {
    this.value &= ~bit;
  }

  /**
   * Check if this set has a bit.
   * @param bit
   * @returns
   */
  has(bit: number): boolean {
    return (this.value & bit) === bit;
  }

  /**
   * Check if this set has all bits in an array.
   * @param bits
   * @returns
   */
  hasAll(bits: number[]): boolean {
    for (const bit of bits) {
      if (!this.has(bit)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Clear all the bits from this set.
   */
  clear(): void {
    this.value = 0;
  }
}
