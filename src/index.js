import {
  Application,
  Assets,
  Container,
  Graphics,
  Sprite,
  Text,
  TextStyle,
  TilingSprite,
} from "pixi.js";
import floorURL from "./assets/floor_tile.png";
import humanURL from "./assets/human.png";
import smallBoxURL from "./assets/small_box.png";

const globalItem = {};

async function createApplication() {
  const app = new Application();
  await app.init({ resizeTo: window });
  document.body.appendChild(app.canvas);
  return app;
}

async function loadAssets() {
  const [character, texture, smallBoxTexture] = await Promise.all([
    Assets.load(humanURL),
    Assets.load(floorURL),
    Assets.load(smallBoxURL),
  ]);
  return { character, texture, smallBoxTexture };
}

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

function setupKeyboardControls(
  characterSprite,
  _,
  smallBoxes,
  container,
  tilingSprite,
  app
) {
  let isCarrying = {
    value: false,
  };
  let carriedBox = null;
  globalItem.isCarrying = isCarrying;
  globalItem.carriedBox = carriedBox;

  window.addEventListener("keydown", (e) => {
    //Update the status bar text
    updateBoxStatus(smallBoxes);

    switch (e.key) {
      case "ArrowUp":
        characterSprite.y -= 10;
        break;
      case "ArrowDown":
        characterSprite.y += 10;
        break;
      case "ArrowLeft":
        characterSprite.x -= 10;
        if (characterSprite.scale.x > 0) characterSprite.scale.x *= -1; // Flip left
        break;
      case "ArrowRight":
        characterSprite.x += 10;
        if (characterSprite.scale.x < 0) characterSprite.scale.x *= -1; // Flip right
        break;
      case "h":
      case "H":
        if (!isCarrying.value) {
          smallBoxes.forEach((box) => {
            if (checkCollision(characterSprite, box)) {
              isCarrying.value = true;
              carriedBox = box;
              box.position.set(0, 0);
              box.anchor.set(0.5);
              characterSprite.addChild(box);
              //toast
              toast("Box picked up");
            }
          });
        } else {
          isCarrying.value = false;
          characterSprite.removeChild(carriedBox);
          carriedBox.position.set(characterSprite.x, characterSprite.y);
          carriedBox.anchor.set(0);
          container.addChild(carriedBox);
          carriedBox = null;
          //toast
          toast("Box dropped");
        }
        updateBoxStatus(smallBoxes);
        break;
    }
    // Update container position to keep character centered
    container.position.set(
      app.screen.width / 2 - characterSprite.x,
      app.screen.height / 2 - characterSprite.y
    );

    // Update tilingSprite position to fill the background
    tilingSprite.position.set(-container.position.x, -container.position.y);
  });

  app.ticker.add(() => {
    checkCollision(characterSprite, globalItem.grayBoxTodo, () => {
      console.log("Collision detected between character and grayBoxTodo");
    });

    checkCollision(characterSprite, globalItem.grayBoxInProgress, () => {
      console.log("Collision detected between character and grayBoxInProgress");
    });
    checkCollision(characterSprite, globalItem.grayBoxDone, () => {
      console.log("Collision detected between character and grayBoxDone");
    });
    smallBoxes.forEach((box) => {
      if (checkCollision(characterSprite, box)) {
        console.log("Collision detected between character and small box");
      }
    });

    if (isCarrying && carriedBox) {
      carriedBox.position.set(characterSprite.x, characterSprite.y);
    }

    // checkIfInsideGrayBox(smallBoxes, grayBox);
  });
}

function updateBoxStatus(smallBoxes) {
  //Skip if is carrying a box
  if (globalItem?.isCarrying?.value) return;
  let todo = 0;
  let inProgress = 0;
  let done = 0;
  smallBoxes.forEach((box) => {
    if (checkCollision(box, globalItem.grayBoxTodo, null, false)) {
      todo++;
    } else if (checkCollision(box, globalItem.grayBoxInProgress, null, false)) {
      inProgress++;
    } else if (checkCollision(box, globalItem.grayBoxDone, null, false)) {
      done++;
    }
  });

  //Update the text inside boxes
  globalItem.grayBoxTodo.children[0].text = `Todo: ${todo}`;
  globalItem.grayBoxInProgress.children[0].text = `In Progress: ${inProgress}`;
  globalItem.grayBoxDone.children[0].text = `Done: ${done}`;

  const newStatus = `Status>> Todo: ${todo} | In Progress: ${inProgress} | Done: ${done}`;
  if (globalItem.statusBar.children[0].text !== newStatus) {
    globalItem.statusBar.children[0].text = newStatus;
    toast("Status updated");
  }
}

function checkCollision(
  characterSprite,
  box,
  onCollision,
  willColorChange = true
) {
  const characterBounds = characterSprite.getBounds();
  const boxBounds = box.getBounds();

  const isCurrentlyColliding =
    characterBounds.x + characterBounds.width > boxBounds.x &&
    characterBounds.x < boxBounds.x + boxBounds.width &&
    characterBounds.y + characterBounds.height > boxBounds.y &&
    characterBounds.y < boxBounds.y + boxBounds.height;

  if (isCurrentlyColliding) {
    box.tint = 0xffff00; // Yellow color
    if (onCollision && willColorChange) {
      onCollision(characterSprite, box);
    }
    return true;
  } else {
    if (willColorChange) {
      box.tint = 0xffffff; // Reset to white color
    }
    return false;
  }
}

function checkIfInsideGrayBox(smallBoxes, grayBox) {
  const grayBoxBounds = grayBox.getBounds();

  smallBoxes.forEach((box) => {
    const boxBounds = box.getBounds();

    const isInside =
      boxBounds.x > grayBoxBounds.x &&
      boxBounds.x + boxBounds.width < grayBoxBounds.x + grayBoxBounds.width &&
      boxBounds.y > grayBoxBounds.y &&
      boxBounds.y + boxBounds.height < grayBoxBounds.y + grayBoxBounds.height;

    if (isInside) {
      console.log("A small box is inside the gray box");
    }
  });
}

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
  // Add character sprite last to make sure it's on top of everything
  container.addChild(characterSprite);
  toast("Use arrow keys to move the character and 'H' to pick up/drop boxes");
}
//Tooast function that pops up a message on top of the screen for a few seconds and then disappears
let activeToasts = [];

function toast(message, duration = 3000) {
  const toast = document.createElement("div");
  toast.style.cssText = `
    position: fixed;
    bottom: ${10 + activeToasts.length * 50}px;
    right: 10px;
    width: fit-content;
    background: #333;
    color: white;
    padding: 10px;
    text-align: center;
    font-size: 20px;
    opacity: 0;
    transition: opacity 0.5s;
  `;
  toast.innerHTML = message;
  document.body.appendChild(toast);
  activeToasts.push(toast);

  // Fade in
  requestAnimationFrame(() => {
    toast.style.opacity = 1;
  });

  setTimeout(() => {
    // Fade out
    toast.style.opacity = 0;
    toast.addEventListener("transitionend", () => {
      document.body.removeChild(toast);
      activeToasts = activeToasts.filter((t) => t !== toast);
      // Adjust positions of remaining toasts
      activeToasts.forEach((t, index) => {
        t.style.bottom = `${10 + index * 50}px`;
      });
    });
  }, duration);
}
main();
