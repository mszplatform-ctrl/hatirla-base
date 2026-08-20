/**
 * User locale + Booking.com region detection.
 * Uses navigator.language as primary source.
 * IP-based geolocation is v1.2+ enhancement (see PROJECT_CONTEXT.md §16).
 */

import { shouldShowChannel } from '../config/affiliates';

export function getUserLocale(): string {
  if (typeof navigator === 'undefined') return 'en';
  return navigator.language || 'en';
}

export function detectBookingChannel(): string | null {
  const locale = getUserLocale();

  if (shouldShowChannel('bookingBR', locale)) return 'bookingBR';
  if (shouldShowChannel('bookingLATAM', locale)) return 'bookingLATAM';

  const pendingRegions = [
    'bookingAPAC', 'bookingAustralia', 'bookingBENELUX', 'bookingCEE',
    'bookingDACH', 'bookingFrance', 'bookingItaly', 'bookingMEA',
    'bookingNorthAmerica', 'bookingSpainPortugal', 'bookingUK',
  ];
  for (const key of pendingRegions) {
    if (shouldShowChannel(key, locale)) return key;
  }

  return null;
}

export function getBookingRegionLabel(channelKey: string | null): string | null {
  if (!channelKey) return null;
  const map: Record<string, string> = {
    bookingBR: 'BR',
    bookingLATAM: 'LATAM',
    bookingAPAC: 'APAC',
    bookingAustralia: 'AU',
    bookingBENELUX: 'BENELUX',
    bookingCEE: 'CEE',
    bookingDACH: 'DACH',
    bookingFrance: 'FR',
    bookingItaly: 'IT',
    bookingMEA: 'MEA',
    bookingNorthAmerica: 'NA',
    bookingSpainPortugal: 'ES_PT',
    bookingUK: 'UK',
  };
  return map[channelKey] || null;
}
