import { Assets } from "pixi.js";
import floorURL from "./assets/floor_tile.png";
import humanURL from "./assets/human.png";
import smallBoxURL from "./assets/small_box.png";

async function loadAssets() {
  const [character, texture, smallBoxTexture] = await Promise.all([
    Assets.load(humanURL),
    Assets.load(floorURL),
    Assets.load(smallBoxURL),
  ]);
  return { character, texture, smallBoxTexture };
}

export { loadAssets };
