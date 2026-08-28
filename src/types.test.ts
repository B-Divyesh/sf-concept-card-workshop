import { describe, expect, it } from 'vitest';
import { blankWorkshop, exampleWorkshop, roles } from './types';
describe('workshop model', () => {
  it('starts with a printable empty workshop', () => expect(blankWorkshop()).toEqual({ title: 'Untitled workshop', minutes: 15, cards: [] }));
  it('offers all four facilitation roles in the sample', () => expect(new Set(exampleWorkshop().cards.map(c => c.role))).toEqual(new Set(Object.keys(roles))));
});
