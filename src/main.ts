import { prepareCanvas, ctx } from "./canvas";
import * as App from "./app";
import * as Input from "./input";

const app = App.create();

requestAnimationFrame(function frameLoop() {
  App.update(app);

  prepareCanvas();
  App.draw(app, ctx);

  Input.justPressed.clear();

  requestAnimationFrame(frameLoop);
});
