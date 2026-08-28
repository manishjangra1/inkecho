/**
 * Date and time formatting utility.
 */

export function formatDate(dateOrIso: string | Date | number): string {
  const d =
    typeof dateOrIso === 'string' || typeof dateOrIso === 'number'
      ? new Date(dateOrIso)
      : dateOrIso;
  if (isNaN(d.getTime())) return '';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(d);
}

export function formatDateTime(dateOrIso: string | Date | number): string {
  const d =
    typeof dateOrIso === 'string' || typeof dateOrIso === 'number'
      ? new Date(dateOrIso)
      : dateOrIso;
  if (isNaN(d.getTime())) return '';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(d);
}

export function formatRelativeTime(dateOrIso: string | Date | number): string {
  const d =
    typeof dateOrIso === 'string' || typeof dateOrIso === 'number'
      ? new Date(dateOrIso)
      : dateOrIso;
  if (isNaN(d.getTime())) return '';

  const now = Date.now();
  const diffMs = now - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;

  return formatDate(d);
}
