import { type EmitHandler, Emitter, type EmitterOnParams } from '../emitter/emitter.js';
import { getKeyCodeFromString, type KeyCode } from './keyCode.js';

export type GamepadState = {
  axes: Record<number, number>;
  buttons: Record<number, number>;
};

type InputEvents = {
  keyPressed: [keyCode: (typeof KeyCode)[keyof typeof KeyCode], code: string, key: string];
  keyReleased: [keyCode: (typeof KeyCode)[keyof typeof KeyCode], code: string, key: string];
  keyPress: [keyCode: (typeof KeyCode)[keyof typeof KeyCode], code: string, key: string];
  mousePressed: [button: number, x: number, y: number];
  mouseReleased: [button: number, x: number, y: number];
  mouseMoved: [x: number, y: number, dx: number, dy: number];
  mouseWheel: [dx: number, dy: number];
  mouseEnter: [];
  mouseLeave: [];
  touchPressed: [id: number, x: number, y: number, count: number];
  touchReleased: [id: number, x: number, y: number, count: number];
  touchMoved: [id: number, x: number, y: number, count: number];
  gamepadConnected: [index: number];
  gamepadDisconnected: [index: number];
  gamepadAxis: [index: number, axis: number, value: number];
  gamepadButton: [index: number, button: number, value: number];
};

export class Input {
  private readonly gamepadStates: Record<number, GamepadState> = {};

  private readonly canvas: HTMLCanvasElement;

  private emitter: Emitter<InputEvents> = new Emitter();

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    this.addListeners();
  }

  /**
   * Registers an event listener for a specific input event.
   * @param params - The parameters for the event listener.
   * @returns The handler for the event listener.
   */
  on<K extends keyof InputEvents>(params: EmitterOnParams<InputEvents, K>): EmitHandler {
    return this.emitter.on(params);
  }

  /**
   * Unregister an event listener for a specific input event.
   * @param event - The event to unregister the listener from.
   * @param handler - The handler to remove.
   */
  off<K extends keyof InputEvents>(event: K, handler: EmitHandler): void {
    this.emitter.off(event, handler);
  }

  /**
   * Clears all registered event listeners.
   */
  clearListeners(): void {
    this.emitter.clear();
  }

  update(): void {
    const gamepads = navigator.getGamepads();
    for (const gamepad of gamepads) {
      if (!gamepad) {
        continue;
      }

      const state = this.gamepadStates[gamepad.index];
      if (!state) {
        continue;
      }

      for (let i = 0; i < gamepad.axes.length; i++) {
        const axis = gamepad.axes[i];
        if ((state.axes[i] && state.axes[i] !== axis) || !state.axes[i]) {
          state.axes[i] = axis;

          this.emitter.emit('gamepadAxis', gamepad.index, i, axis);
        }
      }

      for (let i = 0; i < gamepad.buttons.length; i++) {
        const button = gamepad.buttons[i].value;
        if ((state.buttons[i] && state.buttons[i] !== button) || !state.buttons[i]) {
          state.buttons[i] = button;

          this.emitter.emit('gamepadButton', gamepad.index, i, button);
        }
      }
    }
  }

  destroy(): void {
    this.removeListeners();
  }

  private addListeners(): void {
    this.canvas.addEventListener('keydown', this.onKeyDown);
    this.canvas.addEventListener('keyup', this.onKeyUp);
    this.canvas.addEventListener('keypress', this.onKeyPress);

    this.canvas.addEventListener('mousedown', this.onMouseDown);
    this.canvas.addEventListener('mouseup', this.onMouseUp);
    this.canvas.addEventListener('mousemove', this.onMouseMove);
    this.canvas.addEventListener('wheel', this.onMouseWheel);
    this.canvas.addEventListener('mouseenter', this.onMouseEnter);
    this.canvas.addEventListener('mouseleave', this.onMouseLeave);
    this.canvas.addEventListener('contextmenu', this.onMouseContext);

    this.canvas.addEventListener('touchstart', this.onTouchDown);
    this.canvas.addEventListener('touchend', this.onTouchUp);
    this.canvas.addEventListener('touchmove', this.onTouchMove);
    this.canvas.addEventListener('touchcancel', this.onTouchCancel);

    window.addEventListener('gamepadconnected', this.onGamepadConnected);
    window.addEventListener('gamepaddisconnected', this.onGamepadDisconnected);
  }

  private removeListeners(): void {
    this.canvas.removeEventListener('keydown', this.onKeyDown);
    this.canvas.removeEventListener('keyup', this.onKeyUp);
    this.canvas.removeEventListener('keypress', this.onKeyPress);

    this.canvas.removeEventListener('mousedown', this.onMouseDown);
    this.canvas.removeEventListener('mouseup', this.onMouseUp);
    this.canvas.removeEventListener('mousemove', this.onMouseMove);
    this.canvas.removeEventListener('wheel', this.onMouseWheel);
    this.canvas.removeEventListener('mouseenter', this.onMouseEnter);
    this.canvas.removeEventListener('mouseleave', this.onMouseLeave);
    this.canvas.removeEventListener('contextmenu', this.onMouseContext);

    this.canvas.removeEventListener('touchstart', this.onTouchDown);
    this.canvas.removeEventListener('touchend', this.onTouchUp);
    this.canvas.removeEventListener('touchmove', this.onTouchMove);
    this.canvas.removeEventListener('touchcancel', this.onTouchCancel);

    window.removeEventListener('gamepadconnected', this.onGamepadConnected);
    window.removeEventListener('gamepaddisconnected', this.onGamepadDisconnected);
  }

  private onKeyDown = (event: KeyboardEvent): void => {
    event.preventDefault();
    event.stopPropagation();

    const keyCode = getKeyCodeFromString(event.code);

    this.emitter.emit('keyPressed', keyCode, event.code, event.key);
  };

  private onKeyUp = (event: KeyboardEvent): void => {
    event.preventDefault();
    event.stopPropagation();

    const keyCode = getKeyCodeFromString(event.code);

    this.emitter.emit('keyReleased', keyCode, event.code, event.key);
  };

  private onKeyPress = (event: KeyboardEvent): void => {
    event.preventDefault();
    event.stopPropagation();

    const keyCode = getKeyCodeFromString(event.code);

    this.emitter.emit('keyPress', keyCode, event.code, event.key);
  };

  private onMouseDown = (event: MouseEvent): void => {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.x - rect.left;
    const y = event.y - rect.top;

    this.emitter.emit('mousePressed', event.button, x, y);
  };

  private onMouseUp = (event: MouseEvent): void => {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.x - rect.left;
    const y = event.y - rect.top;

    this.emitter.emit('mouseReleased', event.button, x, y);
  };

  private onMouseMove = (event: MouseEvent): void => {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.x - rect.left;
    const y = event.y - rect.top;

    this.emitter.emit('mouseMoved', x, y, event.movementX, event.movementY);
  };

  private onMouseWheel = (event: WheelEvent): void => {
    this.emitter.emit('mouseWheel', event.deltaX, event.deltaY);
  };

  private onMouseEnter = (): void => {
    this.emitter.emit('mouseEnter');
  };

  private onMouseLeave = (): void => {
    this.emitter.emit('mouseLeave');
  };

  private onMouseContext = (event: MouseEvent): void => {
    event.preventDefault();
    event.stopImmediatePropagation();
  };

  private onTouchDown = (event: TouchEvent): void => {
    event.preventDefault();
    event.stopPropagation();

    let evX = -1;
    let evY = -1;
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches.item(i);
      if (touch) {
        if (evX === -1) {
          evX = touch.clientX;
          evY = touch.clientY;
        }

        this.emitter.emit('touchPressed', touch.identifier, touch.clientX, touch.clientY, event.touches.length);
      }
    }

    this.emitter.emit('mousePressed', 0, evX, evY);
  };

  private onTouchUp = (event: TouchEvent): void => {
    event.preventDefault();
    event.stopPropagation();

    let evX = -1;
    let evY = -1;
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches.item(i);
      if (touch) {
        if (evX === -1) {
          evX = touch.clientX;
          evY = touch.clientY;
        }

        this.emitter.emit('touchReleased', touch.identifier, touch.clientX, touch.clientY, event.touches.length);
      }
    }

    this.emitter.emit('mouseReleased', 0, evX, evY);
  };

  private onTouchMove = (event: TouchEvent): void => {
    event.preventDefault();
    event.stopPropagation();

    let evX = -1;
    let evY = -1;
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches.item(i);
      if (touch) {
        if (evX === -1) {
          evX = touch.clientX;
          evY = touch.clientY;
        }

        this.emitter.emit('touchMoved', touch.identifier, touch.clientX, touch.clientY, event.touches.length);
      }
    }

    this.emitter.emit('mouseMoved', evX, evY, 0, 0);
  };

  private onTouchCancel = (event: TouchEvent): void => {
    event.preventDefault();
    event.stopPropagation();

    let evX = -1;
    let evY = -1;
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches.item(i);
      if (touch) {
        if (evX === -1) {
          evX = touch.clientX;
          evY = touch.clientY;
        }

        this.emitter.emit('touchReleased', touch.identifier, touch.clientX, touch.clientY, event.touches.length);
      }
    }

    this.emitter.emit('mouseReleased', 0, evX, evY);
  };

  private onGamepadConnected = (event: GamepadEvent): void => {
    this.gamepadStates[event.gamepad.index] = {
      buttons: {},
      axes: {},
    };

    this.emitter.emit('gamepadConnected', event.gamepad.index);
  };

  private onGamepadDisconnected = (event: GamepadEvent): void => {
    delete this.gamepadStates[event.gamepad.index];

    this.emitter.emit('gamepadDisconnected', event.gamepad.index);
  };
}
