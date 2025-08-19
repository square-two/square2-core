import type { Graphics } from '../graphics/graphics.js';
import type { Input } from '../input/input.js';

export class Callbacks {
  readonly input: Input;

  private renderCallbacks: ((graphics: Graphics) => void)[];

  private updateCallbacks: ((deltaTime: number) => void)[];

  private resizeCallbacks: ((width: number, height: number) => void)[];

  private focusCallbacks: (() => void)[];

  private blurCallbacks: (() => void)[];

  constructor(input: Input) {
    this.input = input;
    this.renderCallbacks = [];
    this.updateCallbacks = [];
    this.resizeCallbacks = [];
    this.focusCallbacks = [];
    this.blurCallbacks = [];
  }

  addRenderCallback(callback: (graphics: Graphics) => void): void {
    this.renderCallbacks.push(callback);
  }

  addUpdateCallback(callback: (deltaTime: number) => void): void {
    this.updateCallbacks.push(callback);
  }

  addResizeCallback(callback: (width: number, height: number) => void): void {
    this.resizeCallbacks.push(callback);
  }

  addFocusCallback(callback: () => void): void {
    this.focusCallbacks.push(callback);
  }

  addBlurCallback(callback: () => void): void {
    this.blurCallbacks.push(callback);
  }

  removeRenderCallback(callback: (graphics: Graphics) => void): void {
    const index = this.renderCallbacks.indexOf(callback);
    if (index !== -1) {
      this.renderCallbacks.splice(index, 1);
    }
  }

  removeUpdateCallback(callback: (deltaTime: number) => void): void {
    const index = this.updateCallbacks.indexOf(callback);
    if (index !== -1) {
      this.updateCallbacks.splice(index, 1);
    }
  }

  removeResizeCallback(callback: (width: number, height: number) => void): void {
    const index = this.resizeCallbacks.indexOf(callback);
    if (index !== -1) {
      this.resizeCallbacks.splice(index, 1);
    }
  }

  removeFocusCallback(callback: () => void): void {
    const index = this.focusCallbacks.indexOf(callback);
    if (index !== -1) {
      this.focusCallbacks.splice(index, 1);
    }
  }

  removeBlurCallback(callback: () => void): void {
    const index = this.blurCallbacks.indexOf(callback);
    if (index !== -1) {
      this.blurCallbacks.splice(index, 1);
    }
  }

  clearCallbacks(): void {
    this.renderCallbacks = [];
    this.updateCallbacks = [];
    this.resizeCallbacks = [];
    this.focusCallbacks = [];
    this.blurCallbacks = [];
  }

  render(graphics: Graphics): void {
    for (const callback of this.renderCallbacks) {
      callback(graphics);
    }
  }

  update(deltaTime: number): void {
    for (const callback of this.updateCallbacks) {
      callback(deltaTime);
    }
  }

  resize(width: number, height: number): void {
    for (const callback of this.resizeCallbacks) {
      callback(width, height);
    }
  }

  focus(): void {
    for (const callback of this.focusCallbacks) {
      callback();
    }
  }

  blur(): void {
    for (const callback of this.blurCallbacks) {
      callback();
    }
  }
}
