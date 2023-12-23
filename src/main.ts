import { prepareCanvas, ctx } from "./canvas";
import * as App from "./app";

const app = App.create();

requestAnimationFrame(function frameLoop() {
  App.update(app);

  prepareCanvas();
  App.draw(app, ctx);

  requestAnimationFrame(frameLoop);
});
