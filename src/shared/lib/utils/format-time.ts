/**
 * Formats a duration in seconds as MM:SS.
 */
export function formatTime(seconds: number): string {
  const safeSec = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safeSec / 60);
  const remainingSec = safeSec % 60;
  return `${mins.toString().padStart(2, '0')}:${remainingSec.toString().padStart(2, '0')}`;
}
