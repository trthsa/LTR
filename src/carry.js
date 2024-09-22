import { globalItem } from "./global.js";
import { checkCollision, toast, updateBoxStatus } from "./utils.js";

function handleCarry(characterSprite, smallBoxes, container) {
  let isCarrying = {
    value: false,
  };
  let carriedBox = null;
  globalItem.isCarrying = isCarrying;
  globalItem.carriedBox = carriedBox;

  return function () {
    if (!isCarrying.value) {
      smallBoxes.forEach((box) => {
        if (checkCollision(characterSprite, box)) {
          if (carriedBox) {
            //toast
            toast("Cannot carry more than one box");
            return;
          }
          isCarrying.value = true;
          carriedBox = box;
          box.anchor.set(0.5);
          box.position.set(
            characterSprite.width / 2,
            -characterSprite.height / 2
          );
          //resizes the box to to bigger size to make it look like the character is carrying it
          box.width = box.height = 500;

          characterSprite.addChild(box);
          //toast
          toast("Box picked up");
        }
      });
    } else {
      isCarrying.value = false;
      characterSprite.removeChild(carriedBox);
      if (characterSprite.scale.x > 0) {
        // Character facing right
        carriedBox.anchor.set(-1, 0);
        carriedBox.position.set(
          characterSprite.x + characterSprite.width / 2,
          characterSprite.y - characterSprite.height / 2
        );
      } else {
        // Character facing left
        carriedBox.anchor.set(1, 0);
        carriedBox.position.set(
          characterSprite.x - characterSprite.width / 2,
          characterSprite.y - characterSprite.height / 2
        );
      }
      carriedBox.position.set(
        characterSprite.x - characterSprite.width / 2,
        characterSprite.y - characterSprite.height / 2
      );
      //resizes the box to to smaller size to make it look like the character has dropped it
      carriedBox.width = carriedBox.height = 50;
      container.addChild(carriedBox);
      carriedBox = null;
      //toast
      toast("Box dropped");
    }
    updateBoxStatus(smallBoxes);
  };
}

export { handleCarry };
