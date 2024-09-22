import { globalItem } from "./global.js";
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

export { checkCollision, toast, updateBoxStatus };
