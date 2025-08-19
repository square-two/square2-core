/**
 * Sound buffer used to play a sound.
 */
export class Sound {
  /**
   * The id used when loading the sound.
   */
  readonly id: string;

  /**
   * The sound buffer data.
   */
  readonly buffer: AudioBuffer;

  /**
   * Create a new Sound instance.
   * @param id - The id used when loading the sound.
   * @param buffer - The sound buffer data.
   */
  constructor(id: string, buffer: AudioBuffer) {
    this.id = id;
    this.buffer = buffer;
  }
}
