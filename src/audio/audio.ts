import { AudioChannel } from './audioChannel.js';
import { Sound } from './sound.js';

export type PlayParams = {
  sound: Sound;
  loop?: number;
  volume?: number;
  channelId?: number;
  startTime?: number;
};

/**
 * The game audio manager.
 */
export class Audio {
  /**
   * The web audio context.
   */
  readonly context: AudioContext;

  /**
   * The main gain node that controls all volume.
   */
  private readonly mainGain: GainNode;

  /**
   * All audio channels.
   */
  private audioChannels: AudioChannel[];

  /**
   * The volume before muting.
   */
  private prevVolume: number;

  /**
   * Is the volume muted.
   */
  private muted: boolean;

  /**
   * Create a new AudioManager instance.
   */
  constructor() {
    this.context = new AudioContext();
    this.mainGain = this.context.createGain();
    this.mainGain.connect(this.context.destination);

    this.audioChannels = [];
    this.prevVolume = 1;
    this.muted = false;

    for (let i = 0; i < 32; i++) {
      this.audioChannels.push(new AudioChannel(this.context.createGain()));
    }
  }

  /**
   * Get the volume of a channel or if no channel is passed get the main volume.
   * @param channelId - Optional channel id.
   * @returns The volume (0 - 1).
   */
  getVolume(channelId?: number): number {
    if (channelId) {
      return this.audioChannels[channelId].volume;
    }

    return this.mainGain.gain.value;
  }

  /**
   * Set the volume of a channel or the main volume if no channel is passed.
   * @param value - The new volume (0 - 1).
   * @param channelId - Optional channel id.
   */
  setVolume(value: number, channelId?: number): void {
    if (channelId) {
      this.audioChannels[channelId].volume = value;
    } else {
      this.mainGain.gain.value = value;
    }
  }

  /**
   * Get the current loops left from a channel.
   * @param channelId - The audio channel to check.
   * @returns The current loops left.
   */
  getLoop(channelId: number): number {
    return this.audioChannels[channelId].loop;
  }

  /**
   * Set the amount of loops left.
   * @param value - The new loop count.
   * @param channelId - The channel to set the loops on.
   */
  setLoop(value: number, channelId: number): void {
    this.audioChannels[channelId].loop = value;
  }

  /**
   * Get the next free audio channel.
   * @returns The channel id. If -1 is returned there are no free channels.
   */
  getFreeChannel(): number {
    for (let i = 0; i < this.audioChannels.length; i++) {
      if (this.audioChannels[i].ended) {
        return i;
      }
    }

    return -1;
  }

  /**
   * Play a sound.
   * @param sound - The sound to play.
   * @param loop - The amount of loops.
   * @param volume - The volume for the sound.
   * @param channelId - Optional channel id to use.
   * @param startTime - The position to start the sound.
   * @returns The channel id the sound is playing on.
   */
  play({ sound, loop = 0, volume = 1, channelId = -1, startTime = 0 }: PlayParams): number {
    const id = channelId !== -1 ? channelId : this.getFreeChannel();
    if (id === -1) {
      throw new Error('Unable to play sound. All audio channels are in use.');
    }

    const channel = this.audioChannels[id];
    if (channel.sound) {
      channel.stop();
    }

    const source = this.context.createBufferSource();
    source.buffer = sound.buffer;
    source.connect(channel.gain);
    channel.gain.connect(this.mainGain);
    channel.startTime = this.context.currentTime - startTime;
    source.start(0, startTime);
    channel.volume = volume;

    source.onended = (event: Event): void => {
      if (channel.paused) {
        return;
      }

      if (event.target === source) {
        if (channel.loop > 0 || channel.loop === -1) {
          if (channel.loop !== -1) {
            channel.loop--;
          }

          this.play({ sound, loop: channel.loop, volume: channel.volume, channelId: id });
          channel.startTime = this.context.currentTime;
        } else if (channel.loop === 0) {
          channel.stop();
        }
      }
    };

    channel.paused = false;
    channel.source = source;
    channel.ended = false;
    channel.loop = loop;
    channel.sound = sound;

    return id;
  }

  /**
   * Stop a channel or if no channel is passed stop all audio.
   * @param channelId - Optional channel id.
   */
  stop(channelId?: number): void {
    const channels = channelId ? [this.audioChannels[channelId]] : this.audioChannels;
    for (const channel of channels) {
      channel.stop();
    }
  }

  /**
   * pause a channel or if no channel is passed pause all audio.
   * @param channelId - Optional channel id.
   */
  pause(channelId?: number): void {
    const time = this.context.currentTime;
    const channels = channelId ? [this.audioChannels[channelId]] : this.audioChannels;
    for (const channel of channels) {
      channel.pause(time);
    }
  }

  /**
   * Resume a channel or if no channel is passed resume all audio.
   * @param channelId - Optional channel id.
   */
  resume(channelId: number): void {
    if (channelId) {
      const channel = this.audioChannels[channelId];
      if (channel.paused && channel.sound) {
        this.play({
          sound: channel.sound,
          loop: channel.loop,
          volume: channel.volume,
          channelId,
          startTime: channel.pauseTime,
        });
      }
    } else {
      for (let i = 0; i < this.audioChannels.length; i++) {
        const channel = this.audioChannels[i];
        if (channel.paused && channel.sound) {
          this.play({
            sound: channel.sound,
            loop: channel.loop,
            volume: channel.volume,
            channelId: i,
            startTime: channel.pauseTime,
          });
        }
      }
    }
  }

  /**
   * Check if a channel is playing a sound.
   * @param channelId - The channel id to check.
   * @returns True if the sound is playing.
   */
  isPlaying(channelId: number): boolean {
    return !this.audioChannels[channelId].ended && !this.audioChannels[channelId].paused;
  }

  /**
   * Check if the audio is muted.
   * @returns True if the audio is muted.
   */
  isMuted(): boolean {
    return this.muted;
  }

  /**
   * Mute all audio. This sets the volume to 0, but doesn't stop the audio playing.
   */
  mute(): void {
    if (!this.muted) {
      this.prevVolume = this.getVolume();
      this.muted = true;
      this.setVolume(0);
    }
  }

  /**
   * Unmute all audio.
   */
  unMute(): void {
    if (this.muted) {
      this.muted = false;
      this.setVolume(this.prevVolume);
    }
  }

  /**
   * Decode a buffer and create a Sound instance with it.
   * @param id - The sound id.
   * @param buffer - The sound buffer.
   * @returns The created Sound or null if the buffer could not be decoded.
   */
  async decodeSound(id: string, buffer: ArrayBuffer): Promise<Sound | null> {
    const data = await this.context.decodeAudioData(buffer);
    if (data) {
      return new Sound(id, data);
    }

    return null;
  }
}
