import { Application } from "pixi.js";

async function createApplication() {
  const app = new Application();
  await app.init({ resizeTo: window });
  document.body.appendChild(app.canvas);
  return app;
}

export { createApplication };
