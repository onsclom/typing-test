import * as Text from "./text";
import * as Canvas from "./canvas";
import * as Input from "./input";

type App = ReturnType<typeof create>;

const fontKey = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const text = "the quick brown fox jumps over the lazy dog";

export const create = () => ({
  curPos: 0,
  ms: 0,
  state: "waiting" as "waiting" | "playing" | "done",
  lastTime: performance.now(),
});

export function update(app: App) {
  if (app.state == "done" && Input.keyQueue.includes("r")) {
    app.curPos = 0;
    app.ms = 0;
    app.state = "waiting";
    Input.keyQueue.splice(0, Input.keyQueue.length);
  }

  while (Input.keyQueue.length > 0) {
    if (Input.keyQueue[0] === text[app.curPos]) {
      app.curPos += 1;
      if (app.state === "waiting") app.state = "playing";
      else if (app.curPos === text.length) app.state = "done";
    }
    Input.keyQueue.shift();
  }

  if (app.state === "playing") app.ms += performance.now() - app.lastTime;
  app.lastTime = performance.now();
}

export function draw(app: App, ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.strokeStyle = "#0f0";
  ctx.lineCap = "round";
  ctx.lineWidth = 4;
  const fontWidth = 40;
  const fontHeight = fontWidth * 2;
  const screen = Canvas.canvasRect();

  if (app.curPos < text.length) {
    const centeredChar = {
      x: screen.width / 2 - fontWidth / 2,
      y: screen.height / 2 - fontHeight / 2,
    };
    ctx.beginPath();
    ctx.moveTo(centeredChar.x, centeredChar.y + fontHeight * 1.5);
    ctx.lineTo(
      centeredChar.x + fontWidth / 2,
      centeredChar.y + fontHeight * 1.2
    );
    ctx.lineTo(centeredChar.x + fontWidth, centeredChar.y + fontHeight * 1.5);
    ctx.stroke();
    ctx.save();
    ctx.translate(centeredChar.x, centeredChar.y);
    for (const [i, char] of text.slice(app.curPos).split("").entries()) {
      const charLines = Text.getCharLines(char);
      Text.drawChar(ctx, charLines, i * fontWidth, 0, fontWidth, 5);
    }
    ctx.restore();

    const msText = `${app.ms} ms`;
    const length = msText.length * fontWidth;
    for (const [i, char] of msText.split("").entries()) {
      const xPos = screen.width - length + i * fontWidth;
      const charLines = Text.getCharLines(char);
      Text.drawChar(ctx, charLines, xPos, 0, fontWidth, 5);
    }
  } else {
    const lines = [`${app.ms} ms`, ``, `r to retry`];
    for (const [i, line] of lines.entries()) {
      const centeredLine = {
        x: screen.width / 2 - (fontWidth * line.length) / 2,
        y: screen.height / 2 - (fontHeight / 2) * lines.length + fontHeight * i,
      };
      ctx.save();
      ctx.translate(centeredLine.x, centeredLine.y);
      for (const [i, char] of line.split("").entries()) {
        const charIndex = fontKey.indexOf(char.toUpperCase());
        if (charIndex === -1) continue;
        const charLines = Text.getCharLines(char);
        Text.drawChar(ctx, charLines, i * fontWidth, 0, fontWidth, 5);
      }
      ctx.restore();
    }
  }
}
