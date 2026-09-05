export type Role = 'scenario' | 'evidence' | 'decision' | 'consequence';
export type Card = { id: string; role: Role; title: string; body: string };
export type Workshop = { title: string; cards: Card[]; minutes: number };
export const roles: Record<Role, { label: string; mark: string; prompt: string }> = {
  scenario: { label: 'Scenario', mark: '!', prompt: 'What situation should groups examine?' },
  evidence: { label: 'Evidence', mark: '?', prompt: 'What facts, signals, or constraints matter?' },
  decision: { label: 'Decision', mark: '→', prompt: 'What defensible choice could they make?' },
  consequence: { label: 'Consequence', mark: '↳', prompt: 'What happens next, and why?' }
};
export const blankWorkshop = (): Workshop => ({ title: 'Untitled workshop', minutes: 15, cards: [] });
export const exampleWorkshop = (): Workshop => ({ title: 'Trail conditions: a reasoning round', minutes: 15, cards: [
  { id: 's1', role: 'scenario', title: 'A changing route', body: 'Your group is halfway through a planned route. Visibility has dropped and the original schedule has slipped.' },
  { id: 'e1', role: 'evidence', title: 'What you know', body: 'The forecast indicates conditions may worsen. Two people are tired. A marked exit route is 25 minutes away.' },
  { id: 'd1', role: 'decision', title: 'Choose a next move', body: 'Decide whether to continue, pause, or take the exit route. Name the evidence that makes your choice defensible.' },
  { id: 'c1', role: 'consequence', title: 'Debrief the trade-off', body: 'What did your decision protect? What did it cost? What new information would change your mind?' }
] });

export function isRole(value: unknown): value is Role {
  return typeof value === 'string' && Object.hasOwn(roles, value);
}

/**
 * Local storage is user-controlled. Treat it as an untrusted import, not as a
 * Workshop, so an old extension or an interrupted write cannot break startup.
 */
export function isWorkshop(value: unknown): value is Workshop {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<Workshop>;
  if (typeof candidate.title !== 'string' || !Array.isArray(candidate.cards)) return false;
  if (!Number.isInteger(candidate.minutes) || candidate.minutes! < 5 || candidate.minutes! > 30 || candidate.minutes! % 5 !== 0) return false;
  return candidate.cards.every(card => {
    if (!card || typeof card !== 'object') return false;
    const entry = card as Partial<Card>;
    return typeof entry.id === 'string' && entry.id.length > 0
      && isRole(entry.role) && typeof entry.title === 'string' && typeof entry.body === 'string';
  });
}
