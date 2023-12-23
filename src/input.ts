export const keyQueue = [] as string[];

document.addEventListener("keydown", (e) => {
  if (e.key.length === 1) keyQueue.push(e.key.toLowerCase());
});
