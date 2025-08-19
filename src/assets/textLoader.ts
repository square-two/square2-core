import { AssetLoader, type AssetLoaderLoadParams } from './assets.js';

// biome-ignore lint/complexity/noBannedTypes: Need to be able to use String as a type.
export class TextLoader extends AssetLoader<String> {
  constructor() {
    super(String);
  }

  async load({
    id,
    path,
    keep = true,
    // biome-ignore lint/complexity/noBannedTypes: Same as above.
  }: AssetLoaderLoadParams): Promise<String> {
    const response = await fetch(path);
    if (response.status < 400) {
      const text = new String(await response.text());
      if (keep) {
        this.loadedAssets[id] = text;
      }

      return text;
    }

    throw new Error(`Unable to load text ${path}.`);
  }
}
