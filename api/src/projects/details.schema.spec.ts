import { detailsSchema, pruneDetails } from './details.schema';

describe('pruneDetails', () => {
  it('drops blank entries and empty sections', () => {
    const parsed = detailsSchema.parse({
      context: { fr: '', en: '' },
      goals: [
        { fr: '', en: '' },
        { fr: 'Un objectif', en: '' },
      ],
      architecture: [{ label: { fr: '', en: '' }, items: [''] }],
      decisions: [{ name: '', why: { fr: '', en: '' } }],
      challenges: [
        { problem: { fr: 'P', en: 'P' }, solution: { fr: 'S', en: 'S' } },
      ],
    });
    expect(pruneDetails(parsed)).toEqual({
      goals: [{ fr: 'Un objectif', en: '' }],
      challenges: [
        { problem: { fr: 'P', en: 'P' }, solution: { fr: 'S', en: 'S' } },
      ],
    });
  });

  it('returns an empty object for the untouched template', () => {
    expect(
      pruneDetails(detailsSchema.parse({ solution: { fr: ' ', en: '' } })),
    ).toEqual({});
  });
});
