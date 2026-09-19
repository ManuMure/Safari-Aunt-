export interface SeasonalPriceInput {
  name: string;
  startDate: string | Date;
  endDate: string | Date;
  adultPrice: number;
  childPrice: number;
}

export interface AvailabilityDateInput {
  date: string | Date;
  capacity: number;
  booked: number;
  status: "open" | "closed" | "sold_out";
  adultPriceOverride?: number;
  childPriceOverride?: number;
}

export interface TourPricingInput {
  adultPrice: number;
  childPrice: number;
  singleRoomSupplement?: number;
  seasonalPricing: SeasonalPriceInput[];
}

export interface ResolvedPricing {
  adultPrice: number;
  childPrice: number;
  seasonName?: string;
  matchedAvailability?: AvailabilityDateInput;
}

function toUTCStartOfDay(d: string | Date): number {
  const date = new Date(d);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

export function isSameDay(a: string | Date, b: string | Date): boolean {
  return toUTCStartOfDay(a) === toUTCStartOfDay(b);
}

export function isPastDate(d: string | Date): boolean {
  return toUTCStartOfDay(d) < toUTCStartOfDay(new Date());
}

/**
 * Works out what a traveler actually pays for a given date: a per-date
 * override on the availability calendar wins, then a matching seasonal
 * price window, then the tour's flat base price. Pure and DB-free so it
 * can run both server-side (source of truth) and client-side (estimate
 * shown before submitting).
 */
export function resolvePricing(
  pricing: TourPricingInput,
  availability: AvailabilityDateInput[],
  travelDate: string | Date
): ResolvedPricing {
  const matched = availability.find((a) => isSameDay(a.date, travelDate));

  if (matched?.adultPriceOverride !== undefined) {
    return {
      adultPrice: matched.adultPriceOverride,
      childPrice: matched.childPriceOverride ?? pricing.childPrice,
      seasonName: "Custom date pricing",
      matchedAvailability: matched,
    };
  }

  const targetTime = toUTCStartOfDay(travelDate);
  const season = pricing.seasonalPricing.find((s) => {
    const start = toUTCStartOfDay(s.startDate);
    const end = toUTCStartOfDay(s.endDate);
    return targetTime >= start && targetTime <= end;
  });

  if (season) {
    return {
      adultPrice: season.adultPrice,
      childPrice: season.childPrice,
      seasonName: season.name,
      matchedAvailability: matched,
    };
  }

  return {
    adultPrice: pricing.adultPrice,
    childPrice: pricing.childPrice,
    matchedAvailability: matched,
  };
}