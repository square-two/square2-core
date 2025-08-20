import { inject } from '../di/inject.js';
import { BitmapFont } from '../graphics/bitmapFont.js';
import { Image } from '../graphics/image.js';
import { AssetLoader, type AssetLoaderLoadParams, type Assets } from './assets.js';

export class BitmapFontLoader extends AssetLoader<BitmapFont> {
  @inject()
  private readonly assets!: Assets;

  constructor() {
    super(BitmapFont);
  }

  async load({ id, path, keep = true }: AssetLoaderLoadParams): Promise<BitmapFont> {
    const image = await this.assets.load({ type: Image, id: `square2_bitmap_font_${id}`, path: `${path}.png`, keep });
    const data = await this.assets.load({ type: String, id: `square2_bitmap_font_${id}`, path: `${path}.fnt`, keep });

    const font = new BitmapFont(image, data.valueOf());
    if (keep) {
      this.loadedAssets[id] = font;
    }

    return font;
  }

  override unload(id: string): boolean {
    if (this.loadedAssets[id]) {
      this.assets.unload(Image, `square2_bitmap_fot_${id}`);
      this.assets.unload(String, `square2_bitmap_font_${id}`);
    }

    return super.unload(id);
  }
}
