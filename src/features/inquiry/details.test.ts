import {
  catererDetails,
  emptyCatererAnswers,
  emptyVenueAnswers,
  questionSetFor,
  venueDetails,
} from './details';

describe('questionSetFor', () => {
  it('gives halls and caterers their own questions, and others none', () => {
    expect(questionSetFor('banquet-hall')).toBe('venue');
    expect(questionSetFor('hotel-ballroom')).toBe('venue');
    expect(questionSetFor('caterer')).toBe('caterer');
    expect(questionSetFor('halwai')).toBe('caterer');
    expect(questionSetFor('dhol')).toBeNull();
    expect(questionSetFor(null)).toBeNull();
  });
});

describe('venueDetails', () => {
  it('sends nothing when nothing was answered', () => {
    expect(venueDetails(emptyVenueAnswers(), false)).toEqual({});
  });

  it('sends only what was answered, and the caterer name only when bringing their own', () => {
    expect(
      venueDetails(
        { ...emptyVenueAnswers(), catering: 'in_house', ownCaterer: 'ignored', ghoriDhol: false },
        false,
      ),
    ).toEqual({ catering: 'in_house', ghoriDhol: false });
    expect(
      venueDetails({ ...emptyVenueAnswers(), catering: 'own', ownCaterer: ' Saffron ' }, false),
    ).toEqual({ catering: 'own', ownCaterer: 'Saffron' });
  });

  it('marks a tour and keeps only visit times with a date', () => {
    expect(
      venueDetails(
        {
          ...emptyVenueAnswers(),
          tourSlots: [
            { date: '2026-10-03', part: 'evening' },
            { date: null, part: 'morning' },
          ],
        },
        true,
      ),
    ).toEqual({ tour: true, tourSlots: [{ date: '2026-10-03', part: 'evening' }] });
  });
});

describe('catererDetails', () => {
  it('sends only what was answered', () => {
    expect(catererDetails(emptyCatererAnswers())).toEqual({});
    expect(
      catererDetails({
        food: 'jhatka',
        liveStations: ['tandoor'],
        hall: ' Royal Orchard ',
        tasting: true,
      }),
    ).toEqual({ food: 'jhatka', liveStations: ['tandoor'], hall: 'Royal Orchard', tasting: true });
  });
});
