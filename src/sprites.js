import { Graphics, Sprite, Text, TextStyle, TilingSprite } from "pixi.js";

function createTilingSprite(texture, app) {
  const tilingSprite = new TilingSprite({
    texture,
    width: app.screen.width,
    height: app.screen.height,
  });
  tilingSprite.tileScale.set(50 / texture.width, 50 / texture.height);
  return tilingSprite;
}

function createCharacterSprite(character) {
  const characterSprite = new Sprite(character);
  characterSprite.width = characterSprite.height = 50;
  characterSprite.anchor.set(0.5);
  return characterSprite;
}

function createGrayBox(textContent = "Todo") {
  const box = new Graphics();
  box.rect(0, 0, 200, 200);
  box.fill({
    color: 0x808080,
  });
  //Add white text to box at top middle of the box margin 10px from top
  let style = new TextStyle({
    fontFamily: "Arial",
    fontSize: 16,
    fill: "white",
    align: "center",
  });
  let text = new Text({
    style,
    text: textContent,
  });
  text.x = 50;
  text.y = 10;
  box.addChild(text);
  return box;
}

function createSmallBoxSprite(smallBoxTexture, x, y) {
  const smallBoxSprite = new Sprite(smallBoxTexture);
  smallBoxSprite.width = smallBoxSprite.height = 50;
  smallBoxSprite.position.set(x, y);
  return smallBoxSprite;
}

export {
  createCharacterSprite,
  createGrayBox,
  createSmallBoxSprite,
  createTilingSprite,
};
