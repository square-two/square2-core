export type EmitHandler = {
  // biome-ignore lint/suspicious/noExplicitAny: Callback arguments can be anything.
  callback: (...args: any[]) => void;
  // biome-ignore lint/suspicious/noExplicitAny: Filter function can be anything.
  filter?: (...args: any[]) => boolean;

  active: boolean;
};

export type EmitterOnParams<
  // biome-ignore lint/suspicious/noExplicitAny: Generic type T can be any object with string keys and array values.
  T extends Record<string, any[]>,
  K extends keyof T,
> = {
  event: K;
  callback: (...event: T[K]) => void;
  filter?: (...event: T[K]) => boolean;
};

/**
 * Class representing an event emitter.
 */

// biome-ignore lint/suspicious/noExplicitAny: Generic type T can be any object with string keys and array values.
export class Emitter<T extends Record<string, any[]>> {
  private handlers: { [K in keyof T]?: EmitHandler[] } = {};

  /**
   * Registers an event handler.
   * @param params - The event parameters.
   * @returns The registered event handler.
   */
  on<K extends keyof T>({ event, callback, filter }: EmitterOnParams<T, K>): EmitHandler {
    if (!this.handlers[event]) {
      this.handlers[event] = [];
    }

    const handler: EmitHandler = { callback, filter, active: true };
    this.handlers[event].push(handler);

    return handler;
  }

  /**
   * Unregisters an event handler.
   * @param event - The event to unregister the handler from.
   * @param handler - The handler to unregister.
   */
  off<K extends keyof T>(event: K, handler: EmitHandler): void {
    if (!this.handlers[event]) {
      return;
    }

    const index = this.handlers[event].indexOf(handler);
    if (index !== -1) {
      this.handlers[event].splice(index, 1);
    }
  }

  /**
   * Emits an event.
   * @param event - The event to emit.
   * @param data - The data to pass to the event handlers.
   */
  emit<K extends keyof T>(event: K, ...data: T[K]): void {
    if (!this.handlers[event]) {
      return;
    }

    for (const handler of this.handlers[event]) {
      if (handler.active && (!handler.filter || handler.filter(...data))) {
        handler.callback(...data);
      }
    }
  }

  /**
   * Clears all event handlers.
   */
  clear(): void {
    this.handlers = {};
  }
}
