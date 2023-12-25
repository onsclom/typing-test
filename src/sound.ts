const audioCtx = new window.AudioContext();

const startFreq = 220;
let freq = startFreq;

export function incFreq() {
  freq *= 1.1;
}

export function resetFreq() {
  freq = 600;
}

export function playGoodSound() {
  const oscillator = audioCtx.createOscillator();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);

  const playTime = 0.1;
  const gainNode = audioCtx.createGain();
  gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + playTime);
  gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + playTime);
}

export function playBadSound() {
  const oscillator = audioCtx.createOscillator();
  oscillator.type = "sawtooth";
  oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);

  const playTime = 0.1;
  const gainNode = audioCtx.createGain();
  gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + playTime);
  gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + playTime);
}

const changeFactor = 0.01;
setInterval(() => {
  freq = freq * (1 - changeFactor) + startFreq * changeFactor;
}, 10);
