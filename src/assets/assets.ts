export type AssetItem = {
  type: new (
    // biome-ignore lint/suspicious/noExplicitAny: Asset items can take any parameters.
    ...args: any[]
  ) => unknown;
  id: string;
  path: string;
  props?: unknown;
};

export type AssetLoaderLoadParams = {
  id: string;
  path: string;
  props?: unknown;
  keep?: boolean;
};

/**
 * Base class for custom asset loaders.
 */
export abstract class AssetLoader<T> {
  /**
   * The type of asset the loader manages.
   */
  readonly assetType: new (
    // biome-ignore lint/suspicious/noExplicitAny: Asset type constructor can take any parameters.
    ...args: any[]
  ) => T;

  /**
   * The map of loaded assets for this loader.
   */
  protected loadedAssets: Record<string, T> = {};

  /**
   * Create a new loader instance.
   * @param assetType The type of asset to manage.
   */

  // biome-ignore lint/suspicious/noExplicitAny: Asset type constructor can take any parameters.
  constructor(assetType: new (...args: any[]) => T) {
    this.assetType = assetType;
  }

  /**
   * Load an asset. This needs to be implemented per loader.
   * @param params The parameters needed to load the asset.
   */
  abstract load(params: AssetLoaderLoadParams): Promise<T>;

  /**
   * Add an externally loaded asset to the loader.
   * @param id The id used to reference the asset.
   * @param instance The asset instance to add.
   */
  add(id: string, instance: T): void {
    this.loadedAssets[id] = instance;
  }

  /**
   * Get a loaded asset by id.
   * @param id The id of the asset to load.
   * @returns The loaded asset. Will throw if the asset does not exist.
   */
  get(id: string): T {
    if (this.loadedAssets[id]) {
      return this.loadedAssets[id];
    }

    throw new Error(`Asset with id "${id}" not loaded`);
  }

  /**
   * Unload a loaded asset.
   * @param id The id of the asset to unload.
   * @returns True if the unload wsa successful.
   */
  unload(id: string): boolean {
    if (this.loadedAssets[id]) {
      delete this.loadedAssets[id];
    }
    return true;
  }
}

/**
 * Class to load and manage assets.
 */
export class Assets {
  /**
   * The registered loaders.
   */
  private readonly loaders = new Map<
    new (
      // biome-ignore lint/suspicious/noExplicitAny: Asset type constructor can take any parameters.
      ...args: any[]
    ) => unknown,
    AssetLoader<unknown>
  >();

  /**
   * Register a new loader.
   * @param loader The loader to register.
   */
  registerLoader<T>(loader: AssetLoader<T>): void {
    this.loaders.set(loader.assetType, loader);
  }

  /**
   * Load an asset.
   * @param type The class type of asset to load.
   * @param id The id used to reference the asset.
   * @param path The url path to the asset.
   * @param props Any other properties needed to load the asset.
   * @param keep Should this asset be stored.
   * @returns The loaded asset.
   */
  load<T>(
    // biome-ignore lint/suspicious/noExplicitAny: The constructor for type T can take any parameters.
    type: new (...args: any[]) => T,
    id: string,
    path: string,
    props?: unknown,
    keep: boolean = true,
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const loader = this.loaders.get(type);
      if (loader) {
        loader
          .load({ id, path, props, keep })
          .then((value) => {
            resolve(value as T);
          })
          .catch((reason) => {
            reject(new Error(reason as string));
          });
      } else {
        reject(new Error('Loader is not registered for type'));
      }
    });
  }

  /**
   * Load a list of assets in parallel. Returns when all assets are loaded.
   * @param assets The assets to load.
   */
  loadAll(assets: AssetItem[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const count = assets.length;
      let loaded = 0;

      for (const { type, id, path, props } of assets) {
        this.load(type, id, path, props)
          .then(() => {
            loaded++;
            if (loaded === count) {
              resolve();
            }
          })
          .catch((reason) => {
            reject(new Error(reason as string));
          });
      }
    });
  }

  /**
   * Add an externally loaded asset to the manager.
   * @param type The type of asset to add.
   * @param id The id used to reference the asset.
   * @param instance The asset to add.
   */

  // biome-ignore lint/suspicious/noExplicitAny: Asset type constructor can take any parameters.
  add<T>(type: new (...args: any[]) => T, id: string, instance: T): void {
    if (this.loaders.has(type)) {
      this.loaders.get(type)?.add(id, instance);
    } else {
      throw new Error('Loader is not registered for type');
    }
  }

  /**
   * Get a loaded asset.
   * @param type The type of asset to get.
   * @param id The id of the asset.
   * @returns The loaded asset. Will throw if the asset is not loaded.
   */

  // biome-ignore lint/suspicious/noExplicitAny: Asset type constructor can take any parameters.
  get<T>(type: new (...args: any[]) => T, id: string): T {
    if (this.loaders.has(type)) {
      return this.loaders.get(type)?.get(id) as T;
    }

    throw new Error('Loader is not registered for type');
  }

  /**
   * Unload and remove an asset from the manager.
   * @param type The type of asset to unload.
   * @param id The id of the asset.
   * @returns True if the unload was successful.
   */

  // biome-ignore lint/suspicious/noExplicitAny: Asset type constructor can take any parameters.
  unload<T>(type: new (...args: any[]) => T, id: string): boolean {
    if (this.loaders.has(type)) {
      return this.loaders.get(type)?.unload(id) ?? false;
    }

    throw new Error('Loader is not registered for type');
  }
}
