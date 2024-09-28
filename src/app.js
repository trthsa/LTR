import { Container, Graphics, Text, TextStyle } from "pixi.js";
import { createApplication } from "./application.js";
import { loadAssets } from "./assets.js";
import { setupButtonControls, setupKeyboardControls } from "./controls.js";
import { globalItem } from "./global.js";
import {
  createCharacterSprite,
  createGrayBox,
  createSmallBoxSprite,
  createTilingSprite,
} from "./sprites.js";
import { toast, updateBoxStatus } from "./utils.js";

async function main() {
  const app = await createApplication();
  const { character, texture, smallBoxTexture } = await loadAssets();

  const container = new Container();
  const tilingSprite = createTilingSprite(texture, app);
  container.addChild(tilingSprite);

  const grayBoxTodo = createGrayBox("Todo");
  const grayBoxInProgress = createGrayBox("In Progress");
  const grayBoxDone = createGrayBox("Done");
  globalItem.grayBoxTodo = grayBoxTodo;
  globalItem.grayBoxInProgress = grayBoxInProgress;
  globalItem.grayBoxDone = grayBoxDone;
  const gap = 50;
  const boxWidth = 200;

  grayBoxTodo.position.set(
    (app.screen.width - (3 * boxWidth + 2 * gap)) / 2,
    app.screen.height / 2 - boxWidth / 2
  );
  grayBoxInProgress.position.set(
    grayBoxTodo.position.x + boxWidth + gap,
    app.screen.height / 2 - boxWidth / 2
  );
  grayBoxDone.position.set(
    grayBoxInProgress.position.x + boxWidth + gap,
    app.screen.height / 2 - boxWidth / 2
  );
  container.addChild(grayBoxInProgress);
  container.addChild(grayBoxDone);
  container.addChild(grayBoxTodo);
  const characterSprite = createCharacterSprite(character);
  characterSprite.position.set(app.screen.width / 2, app.screen.height / 2);
  // Create another character Sprite and make it follow behind the character
  const characterSprite2 = createCharacterSprite(character);
  characterSprite2.position.set(
    app.screen.width / 2 + 200,
    app.screen.height / 2
  );
  container.addChild(characterSprite2);

  const followCharacter = () => {
    const delay = 10; // Adjust delay as needed
    const speed = 2; // Adjust speed as needed

    const updatePosition = () => {
      const dx = characterSprite.x - characterSprite2.x;
      const dy = characterSprite.y - characterSprite2.y;

      if (Math.abs(dx) > delay) {
        characterSprite2.x += Math.sign(dx) * speed;
        // Flip characterSprite2 based on the direction of movement
        if (dx > 0 && characterSprite2.scale.x < 0) {
          characterSprite2.scale.x *= -1; // Face right
        } else if (dx < 0 && characterSprite2.scale.x > 0) {
          characterSprite2.scale.x *= -1; // Face left
        }
      }

      if (Math.abs(dy) > delay) {
        characterSprite2.y += Math.sign(dy) * speed;
      }

      requestAnimationFrame(updatePosition);
    };

    updatePosition();
  };

  followCharacter();
  const smallBoxes = [
    createSmallBoxSprite(
      smallBoxTexture,
      app.screen.width / 3,
      app.screen.height / 3
    ),
    createSmallBoxSprite(
      smallBoxTexture,
      app.screen.width / 2,
      app.screen.height / 2
    ),
  ];
  smallBoxes.forEach((box) => container.addChild(box));

  app.stage.addChild(container);

  // Add a status bar at the top left of the screen inside a rectangular box
  const statusBar = new Graphics();
  statusBar.rect(0, 0, 500, 40);
  statusBar.fill({
    color: 0x000000,
  });
  statusBar.position.set(10, 10);

  let style = new TextStyle({
    fontFamily: "Arial",
    fontSize: 16,
    fill: "white",
    align: "center",
  });
  let text = new Text({
    style,
    text: "Status>> Todo: 0 | In Progress: 0 | Done: 0",
  });
  text.x = 10;
  text.y = 10;
  globalItem.statusBar = statusBar;
  statusBar.addChild(text);

  app.stage.addChild(statusBar);
  updateBoxStatus(smallBoxes);

  setupKeyboardControls(
    characterSprite,
    grayBoxTodo,
    [...smallBoxes],
    container,
    tilingSprite,
    app
  );
  setupButtonControls(
    characterSprite,
    smallBoxes,
    container,
    tilingSprite,
    app
  );
  // Add character sprite last to make sure it's on top of everything
  container.addChild(characterSprite);
  toast("Use arrow keys to move the character and 'H' to pick up/drop boxes");
}

export { main };
