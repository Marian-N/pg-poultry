import { PoultryRepresentative } from './PoultryEntity';

// min max weights for each type and each age and each gender
export const poultryWeights: Record<
  PoultryRepresentative,
  Record<string, Record<string, number>>
> = {
  chicken: {
    adult: {
      mMin: 2,
      mMax: 4,
      fMin: 1,
      fMax: 3
    },
    old: {
      mMin: 1,
      mMax: 3,
      fMin: 0.5,
      fMax: 2.5
    }
  },
  goose: {
    adult: {
      mMin: 3,
      mMax: 5,
      fMin: 2.5,
      fMax: 4.5
    },
    old: {
      mMin: 2,
      mMax: 4,
      fMin: 2,
      fMax: 4
    }
  },
  turkey: {
    adult: {
      mMin: 6,
      mMax: 8,
      fMin: 4,
      fMax: 6
    },
    old: {
      mMin: 5,
      mMax: 7,
      fMin: 3.5,
      fMax: 5.5
    }
  }
};
