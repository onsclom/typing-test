import * as Text from "./text";
import * as Canvas from "./canvas";
import * as Input from "./input";
import * as Sound from "./sound";

type App = ReturnType<typeof create>;

const fontKey = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const text = "the quick brown fox jumps over the lazy dog";

type DeadLetter = {
  char: string;
  x: number;
  y: number;
  dx: number;
  dy: number;
  angleDelta: number;
  angle: number;
  timeDead: number;
};

const colorAmt = 2;
const getColor = (i: number) => {
  const hue = (i * 360 + performance.now() * 0.025) / colorAmt;
  return `hsl(${hue}, 90%, 65%)`;
};

export const create = () => ({
  curPos: 0,
  animatedPos: 0,
  ms: 0,
  state: "waiting" as "waiting" | "playing" | "done",
  lastTime: performance.now(),
  deadLetters: [] as DeadLetter[],
  timeDead: 0,
  freq: 440,
  colorIndex: 0,
  shakeStrength: 0,
  highScore: localStorage.getItem("highScore")
    ? Number(localStorage.getItem("highScore"))
    : 0,
});

export function update(app: App) {
  if (Input.justPressed.has("Enter")) {
    app.shakeStrength = 40;
    app.curPos = 0;
    app.ms = 0;
    app.state = "waiting";
    Input.keyQueue.splice(0, Input.keyQueue.length);
    app.deadLetters.splice(0, app.deadLetters.length);
    Sound.resetFreq();
  }

  const shakePerKey = 5;
  while (Input.keyQueue.length > 0) {
    if (Input.keyQueue[0] === text[app.curPos]) {
      app.shakeStrength += shakePerKey;
      const animatedDiff = (app.animatedPos - app.curPos) * 32;
      app.deadLetters.push({
        char: Input.keyQueue[0],
        x: 0 - animatedDiff + 32,
        y: 0,
        dx: Math.random() * -1 - 3,
        dy: Math.random() * -4 - 1,
        angleDelta: Math.random() * -0.05,
        angle: 0,
        timeDead: 0,
      });
      app.curPos += 1;
      Sound.playGoodSound();
      Sound.incFreq();

      if (app.state === "waiting") app.state = "playing";
      else if (app.curPos === text.length) app.state = "done";
    } else {
      Sound.playBadSound();
      app.shakeStrength += shakePerKey;
    }
    Input.keyQueue.shift();
  }

  const deltaTime = (performance.now() - app.lastTime) * 0.1;
  if (app.state === "playing") app.ms += performance.now() - app.lastTime;
  app.lastTime = performance.now();

  for (const deadLetter of app.deadLetters) {
    deadLetter.timeDead += deltaTime;
    deadLetter.x += deadLetter.dx * deltaTime;
    deadLetter.y += deadLetter.dy * deltaTime;
    deadLetter.dy += 0.1 * deltaTime;
    deadLetter.angle += deadLetter.angleDelta * deltaTime;
  }
}

export function draw(app: App, ctx: CanvasRenderingContext2D) {
  const fontWidth = 32;
  app.animatedPos += (app.curPos - app.animatedPos) * 0.1;
  const animatedDiff = (app.animatedPos - app.curPos) * fontWidth;

  const screen = Canvas.canvasRect();
  ctx.fillStyle = getColor(0);
  ctx.fillRect(0, 0, screen.width, screen.height);
  ctx.strokeStyle = getColor(1);
  ctx.lineCap = "round";
  ctx.lineWidth = 4;
  const fontHeight = fontWidth * 2;

  const centeredChar = {
    x: screen.width / 2 - fontWidth / 2,
    y: screen.height / 2 - fontHeight / 2,
  };

  // screenshake
  app.shakeStrength *= 0.9;
  // rotate from center
  ctx.translate(screen.width / 2, screen.height / 2);
  ctx.rotate(Math.sin(performance.now() * 0.01) * app.shakeStrength * 0.0025);
  ctx.translate(-screen.width / 2, -screen.height / 2);
  ctx.translate(
    Math.cos(performance.now() * 0.024) * app.shakeStrength,
    Math.sin(performance.now() * 0.025) * app.shakeStrength,
  );

  ctx.save();
  ctx.translate(centeredChar.x - fontWidth, centeredChar.y);

  for (const deadLetter of app.deadLetters) {
    const charLines = Text.getCharLines(deadLetter.char);
    ctx.save();
    const alpha = Math.max(0, 1 - deadLetter.timeDead * 0.008);
    ctx.globalAlpha = alpha;
    ctx.translate(deadLetter.x, deadLetter.y);

    ctx.translate(fontWidth / 2, fontHeight / 2);
    ctx.rotate(deadLetter.angle);
    ctx.translate(-fontWidth / 2, -fontHeight / 2);

    Text.drawChar(ctx, charLines, 0, 0, fontWidth, 5);
    ctx.restore();
  }
  ctx.restore();

  if (app.curPos < text.length) {
    ctx.beginPath();
    console.log("drawng text");
    ctx.moveTo(centeredChar.x, centeredChar.y + fontHeight * 1.5);
    ctx.lineTo(
      centeredChar.x + fontWidth / 2,
      centeredChar.y + fontHeight * 1.2,
    );
    ctx.lineTo(centeredChar.x + fontWidth, centeredChar.y + fontHeight * 1.5);
    ctx.stroke();
    ctx.save();
    ctx.translate(centeredChar.x, centeredChar.y);

    for (const [i, char] of text.slice(app.curPos).split("").entries()) {
      const charLines = Text.getCharLines(char);
      console.log(animatedDiff);
      Text.drawChar(
        ctx,
        charLines,
        i * fontWidth - animatedDiff,
        0,
        fontWidth,
        5,
      );
    }
    ctx.restore();

    const completed = app.curPos / text.length;
    const wordLength = text.split(" ").length;
    const expectedWPM = (wordLength * completed) / app.ms;
    const wpmText = `${Math.round(expectedWPM * 60000) || 0} wpm`;
    const wpmLength = wpmText.length * fontWidth;
    const wpmXPos = screen.width / 2 - wpmLength / 2;
    for (const [i, char] of wpmText.split("").entries()) {
      const charLines = Text.getCharLines(char);
      Text.drawChar(
        ctx,
        charLines,
        wpmXPos + i * fontWidth,
        fontWidth / 2,
        fontWidth,
        5,
      );
    }
  } else {
    ctx.save();
    ctx.globalAlpha = 0.65;
    ctx.fillStyle = getColor(0);
    ctx.fillRect(0, 0, screen.width, screen.height);
    ctx.restore();

    const wpm = Math.round((text.split(" ").length / app.ms) * 60000);
    if (wpm > app.highScore) {
      app.highScore = wpm;
      localStorage.setItem("highScore", wpm.toString());
    }
    const lines = [`${wpm} wpm`, ``, `enter to retry`];
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

    if (wpm >= app.highScore) {
      const highScoreText = `new high score`;
      const highScoreXPos =
        screen.width / 2 - (highScoreText.length * fontWidth) / 2;
      for (const [i, char] of highScoreText.split("").entries()) {
        const charLines = Text.getCharLines(char);
        Text.drawChar(
          ctx,
          charLines,
          highScoreXPos + i * fontWidth,
          fontWidth / 2 + Math.sin(performance.now() * 0.01 + i * 0.2) * 10,
          fontWidth,
          5,
        );
      }
    } else {
      const highScoreText = `high score ${app.highScore} wpm`;
      const highScoreXPos =
        screen.width / 2 - (highScoreText.length * fontWidth) / 2;
      for (const [i, char] of highScoreText.split("").entries()) {
        const charLines = Text.getCharLines(char);
        Text.drawChar(
          ctx,
          charLines,
          highScoreXPos + i * fontWidth,
          fontWidth / 2,
          fontWidth,
          5,
        );
      }
    }
  }
}
