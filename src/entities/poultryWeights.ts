import { PoultryRepresentative, AgeCategory } from './PoultryEntity';

// min max weights for each type and each age and each gender
export const poultryWeights: Record<
  PoultryRepresentative,
  Record<AgeCategory, Record<string, Record<string, number>>>
> = {
  chicken: {
    child: {
      m: {
        u: 0.05
      },
      f: {
        u: 0.05
      }
    },
    adult: {
      m: {
        min: 2,
        max: 4
      },
      f: {
        min: 1,
        max: 3
      }
    },
    old: {
      m: {
        min: 1,
        max: 3
      },
      f: {
        min: 0.5,
        max: 2.5
      }
    }
  },
  goose: {
    child: {
      m: {
        u: 0.05
      },
      f: {
        u: 0.05
      }
    },
    adult: {
      m: {
        min: 3,
        max: 5
      },
      f: {
        min: 2.5,
        max: 4.5
      }
    },
    old: {
      m: {
        min: 2,
        max: 4
      },
      f: {
        min: 2,
        max: 4
      }
    }
  },
  turkey: {
    child: {
      m: {
        u: 0.05
      },
      f: {
        u: 0.05
      }
    },
    adult: {
      m: {
        min: 5,
        max: 8
      },
      f: {
        min: 4,
        max: 6
      }
    },
    old: {
      m: {
        min: 5,
        max: 7
      },
      f: {
        min: 3.5,
        max: 5.5
      }
    }
  }
};
