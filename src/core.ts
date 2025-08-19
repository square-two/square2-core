import { Assets } from './assets/assets.js';
import { BitmapFontLoader } from './assets/bitmapFontLoader.js';
import { ImageLoader } from './assets/imageLoader.js';
import { SoundLoader } from './assets/soundLoader.js';
import { TextLoader } from './assets/textLoader.js';
import { Audio } from './audio/audio.js';
import { addService } from './di/services.js';
import { GLContext } from './graphics/glContext.js';
import { Graphics } from './graphics/graphics.js';
import { Input } from './input/input.js';
import { clamp } from './math/mathUtils.js';
import { Random } from './math/random.js';
import { Callbacks } from './utils/callbacks.js';

export type CoreOptions = {
  width: number;
  height: number;
  title?: string;
  targetFps?: number;
  runInBackground?: boolean;
  hdpi?: boolean;
  fillWindow?: boolean;
};

const MAX_DT: number = 1.0 / 15;

export class Core {
  readonly canvas: HTMLCanvasElement;

  readonly pixelRatio: number;

  fillWindow: boolean;

  targetFps: number;

  private input: Input;

  private runInBackground: boolean;

  private lastFrameTime: number;

  private context: GLContext;

  private graphics: Graphics;

  private started: boolean;

  private inFocus: boolean;

  private callbacks: Callbacks;

  constructor({ width, height, title, targetFps, runInBackground, hdpi, fillWindow }: CoreOptions) {
    title ??= 'Square2 Game';
    this.runInBackground = runInBackground ?? false;
    this.targetFps = targetFps ?? -1;
    hdpi ??= false;
    this.fillWindow = fillWindow ?? false;
    if (this.fillWindow) {
      width = window.innerWidth;
      height = window.innerHeight;
    }

    document.title = title;
    const canvasId = 'square2';

    this.pixelRatio = hdpi ? window.devicePixelRatio : 1;
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;

    if (!this.canvas) {
      throw new Error(`Canvas element with id "${canvasId}" not found`);
    }

    this.canvas.width = width * this.pixelRatio;
    this.canvas.height = height * this.pixelRatio;

    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    this.context = new GLContext(this.canvas);
    addService('context', this.context);

    addService('audio', new Audio());

    this.graphics = new Graphics(this.context, this.canvas, this.pixelRatio);
    addService('graphics', this.graphics);

    addService('random', new Random());

    this.input = new Input(this.canvas);
    addService('input', this.input);

    this.callbacks = new Callbacks(this.input);
    addService('callbacks', this.callbacks);

    const assets = new Assets();
    assets.registerLoader(new BitmapFontLoader());
    assets.registerLoader(new ImageLoader());
    assets.registerLoader(new SoundLoader());
    assets.registerLoader(new TextLoader());
    addService('assets', assets);

    this.started = false;
    this.lastFrameTime = 0;
    this.inFocus = false;
  }

  start(): void {
    if (this.started) {
      throw new Error('Core is already started');
    }
    this.started = true;

    this.canvas.focus();
    this.inFocus = true;

    this.canvas.addEventListener('focus', () => this.focus());
    this.canvas.addEventListener('blur', () => this.blur());
    this.canvas.addEventListener('resize', () => this.resize(window.innerWidth, window.innerHeight));

    requestAnimationFrame(() => {
      this.lastFrameTime = window.performance.now();
      this.loop();
    });
  }

  focus(): void {
    this.inFocus = true;
    this.callbacks.focus();
  }

  blur(): void {
    this.inFocus = false;
    this.callbacks.blur();
  }

  resize(width: number, height: number): void {
    this.callbacks.resize(width, height);
  }

  private loop(): void {
    window.requestAnimationFrame(() => this.loop());

    const now = window.performance.now();
    const timePassed = now - this.lastFrameTime;
    if (this.targetFps === -1) {
      this.update(timePassed / 1000.0);
      this.lastFrameTime = now;
    } else {
      const interval = 1.0 / this.targetFps;
      if (timePassed < interval) {
        return;
      }

      const excess = timePassed % interval;
      this.update(excess / 1000.0);
      this.lastFrameTime = now - excess;
    }
  }

  private update(deltaTime: number): void {
    if (!this.inFocus && !this.runInBackground) {
      return;
    }

    const clampedDt = clamp(deltaTime, 0, MAX_DT);
    this.input.update();

    this.callbacks.update(clampedDt);
    this.render();
  }

  private render(): void {
    this.callbacks.render(this.graphics);
  }
}
