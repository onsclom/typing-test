export const keyQueue = [] as string[];
export const justPressed = new Set<string>();

document.addEventListener("keydown", (e) => {
  if (e.key.length === 1) keyQueue.push(e.key.toLowerCase());
  justPressed.add(e.key);
});
