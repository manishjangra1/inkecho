/**
 * Web Audio API synthesized sound generator for chat notifications.
 * Uses a singleton AudioContext with proactive unlock on user interaction.
 */

let sharedAudioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  if (!sharedAudioContext) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextClass) return null;

    sharedAudioContext = new AudioContextClass();
  }

  return sharedAudioContext;
}

// Global user interaction listener to unlock AudioContext
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  };

  window.addEventListener('click', unlockAudio, { passive: true });
  window.addEventListener('keydown', unlockAudio, { passive: true });
  window.addEventListener('touchstart', unlockAudio, { passive: true });
}

/**
 * Plays a pleasant, modern, dual-frequency notification chime (marimba / glass ping).
 */
export function playChatNotificationSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Ensure AudioContext is running
  if (ctx.state === 'suspended') {
    ctx.resume().then(() => playChime(ctx)).catch(() => {});
  } else {
    playChime(ctx);
  }
}

function playChime(ctx: AudioContext): void {
  try {
    const now = ctx.currentTime;

    // Tone 1: Fundamental ping (C6 - 1046Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now);
    osc1.frequency.exponentialRampToValueAtTime(1318.51, now + 0.08); // E6

    gain1.gain.setValueAtTime(0.18, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.22);

    // Tone 2: Harmonic sparkle (G6 - 1567Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1318.51, now + 0.05);
    osc2.frequency.exponentialRampToValueAtTime(1760, now + 0.14); // A6

    gain2.gain.setValueAtTime(0.001, now);
    gain2.gain.setValueAtTime(0.12, now + 0.05);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.26);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc2.start(now + 0.05);
    osc2.stop(now + 0.26);
  } catch {
    // Graceful fallback if Web Audio fails
  }
}
