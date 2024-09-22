import { handleCarry } from "./carry.js";
import { globalItem } from "./global.js";
import { checkCollision, updateBoxStatus } from "./utils.js";

function setupKeyboardControls(
  characterSprite,
  _,
  smallBoxes,
  container,
  tilingSprite,
  app
) {
  const carryHandler = handleCarry(characterSprite, smallBoxes, container);

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
        carryHandler();
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

    if (globalItem?.isCarrying?.value && globalItem?.carriedBox) {
      globalItem?.carriedBox.position.set(0, -characterSprite.height / 2);
    }

    // checkIfInsideGrayBox(smallBoxes, grayBox);
  });
}

function setupButtonControls(
  characterSprite,
  smallBoxes,
  container,
  tilingSprite,
  app
) {
  const carryHandler = handleCarry(characterSprite, smallBoxes, container);

  let moveInterval;

  function startMoving(direction) {
    if (moveInterval) return; // Prevent multiple intervals
    moveInterval = setInterval(() => {
      switch (direction) {
        case "up":
          characterSprite.y -= 10;
          break;
        case "down":
          characterSprite.y += 10;
          break;
        case "left":
          characterSprite.x -= 10;
          if (characterSprite.scale.x > 0) characterSprite.scale.x *= -1; // Flip left
          break;
        case "right":
          characterSprite.x += 10;
          if (characterSprite.scale.x < 0) characterSprite.scale.x *= -1; // Flip right
          break;
      }
      updatePositions();
    }, 25); // Adjust the interval time as needed
  }

  function stopMoving() {
    clearInterval(moveInterval);
    moveInterval = null;
  }

  document
    .getElementById("up-button")
    .addEventListener("mousedown", () => startMoving("up"));
  document.getElementById("up-button").addEventListener("mouseup", stopMoving);
  document
    .getElementById("up-button")
    .addEventListener("mouseleave", stopMoving);

  document
    .getElementById("down-button")
    .addEventListener("mousedown", () => startMoving("down"));
  document
    .getElementById("down-button")
    .addEventListener("mouseup", stopMoving);
  document
    .getElementById("down-button")
    .addEventListener("mouseleave", stopMoving);

  document
    .getElementById("left-button")
    .addEventListener("mousedown", () => startMoving("left"));
  document
    .getElementById("left-button")
    .addEventListener("mouseup", stopMoving);
  document
    .getElementById("left-button")
    .addEventListener("mouseleave", stopMoving);

  document
    .getElementById("right-button")
    .addEventListener("mousedown", () => startMoving("right"));
  document
    .getElementById("right-button")
    .addEventListener("mouseup", stopMoving);
  document
    .getElementById("right-button")
    .addEventListener("mouseleave", stopMoving);

  document.getElementById("carry-button").addEventListener("click", () => {
    carryHandler();
  });

  function updatePositions() {
    container.position.set(
      app.screen.width / 2 - characterSprite.x,
      app.screen.height / 2 - characterSprite.y
    );
    tilingSprite.position.set(-container.position.x, -container.position.y);
    updateBoxStatus(smallBoxes);
  }
}

export { setupButtonControls, setupKeyboardControls };
