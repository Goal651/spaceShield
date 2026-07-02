export type PlainThreat = 'LOW' | 'MEDIUM' | 'HIGH';

export function toPlainThreat(level: string): PlainThreat {
  switch (level.toUpperCase()) {
    case 'CRITICAL':
    case 'EXTREME':
    case 'SEVERE':
      return 'HIGH';
    case 'WATCH':
    case 'MODERATE':
      return 'MEDIUM';
    default:
      return 'LOW';
  }
}

export function plainThreatLabel(level: string): string {
  const plain = toPlainThreat(level);
  if (plain === 'HIGH') return 'Needs attention';
  if (plain === 'MEDIUM') return 'Worth watching';
  return 'All clear';
}

export function plainThreatDescription(level: string): string {
  const plain = toPlainThreat(level);
  if (plain === 'HIGH') {
    return 'This event is significant enough that scientists are paying close attention.';
  }
  if (plain === 'MEDIUM') {
    return 'Nothing to panic about, but it is being tracked more closely than usual.';
  }
  return 'This is within normal ranges — no action needed from the public.';
}
