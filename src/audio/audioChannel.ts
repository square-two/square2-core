import { clamp } from '../math/mathUtils.js';
import type { Sound } from './sound.js';

/**
 * An audio channel controls the playback of a sound.
 */
export class AudioChannel {
  /**
   * The current sound for this channel.
   */
  sound?: Sound;

  /**
   * The channel buffer source.
   */
  source?: AudioBufferSourceNode;

  /**
   * Where in the sound to start.
   */
  startTime: number;

  /**
   * The time when the sound was paused.
   */
  pauseTime: number;

  /**
   * How many loops are left. -1 is infinite.
   */
  loop: number;

  /**
   * Has the sound ended.
   */
  ended: boolean;

  /**
   * Is the sound paused.
   */
  paused: boolean;

  /**
   * The audio gain node.
   */
  get gain(): GainNode {
    return this._gain;
  }

  /**
   * The channel volume (0 - 1).
   */
  get volume(): number {
    return this._gain.gain.value;
  }

  /**
   * Set the channel volume (0 - 1).
   */
  set volume(value: number) {
    this._gain.gain.value = clamp(value, 0, 1);
  }

  /**
   * Internal gain reference.
   */
  private _gain: GainNode;

  /**
   * Create a new Audio Channel instance.
   * @param gain - The gain node.
   */
  constructor(gain: GainNode) {
    this._gain = gain;
    this.volume = 1;
    this.startTime = 0;
    this.pauseTime = 0;
    this.loop = 0;
    this.ended = false;
    this.paused = false;
  }

  /**
   * Pause this channel.
   * @param time - The current sound time.
   */
  pause(time: number): void {
    if (this.source) {
      this.pauseTime = time - this.startTime;
      this.paused = true;
      this.source.disconnect();
      this._gain.disconnect();
      this.source.stop();
      this.source = undefined;
    }
  }

  /**
   * Stop this channel.
   */
  stop(): void {
    if (this.source) {
      this.source.disconnect();
      this._gain.disconnect();
      this.source.stop();
      this.source = undefined;
      this.ended = true;
      this.paused = true;
    }
  }
}
