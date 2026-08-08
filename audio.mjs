let audioCtx = null;

function getContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  return audioCtx;
}

export function unlockAudio() {
  const ctx = getContext();
  if (ctx.state === 'suspended') ctx.resume();

  // iOS Safari sometimes leaves the context effectively silent for later
  // scheduled sounds unless a node is actually started/stopped inside the
  // gesture, not just resumed.
  const silentOscillator = ctx.createOscillator();
  const silentGain = ctx.createGain();
  silentGain.gain.value = 0;
  silentOscillator.connect(silentGain);
  silentGain.connect(ctx.destination);
  silentOscillator.start();
  silentOscillator.stop(ctx.currentTime + 0.01);
}

export function playBeep() {
  const ctx = getContext();
  if (ctx.state === 'suspended') ctx.resume();

  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.value = 880;
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start();
  oscillator.stop(ctx.currentTime + 0.15);
}
