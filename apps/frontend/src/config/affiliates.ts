/**
 * XOTIJI Affiliate Configuration
 *
 * Central registry for all 12 affiliate channels.
 * Each channel has: enabled flag, network, link builder, locale scope.
 *
 * Deep link strategy: v1 launch = homepage links only.
 * Week 4+ deep link migration per PROJECT_CONTEXT.md §16.
 *
 * v1.5+ AI memory integration: NOT implemented today (YAGNI).
 * See PROJECT_CONTEXT.md §16.5 for roadmap.
 */

export type AffiliateNetwork = 'Direct' | 'CJ' | 'Travelpayouts';

export type DeepLinkParams = {
  city?: string;
  country?: string;
  destination?: string;
  checkinDate?: string;
  checkoutDate?: string;
  travelers?: number;
  surface?: string;
};

export type AffiliateChannel = {
  enabled: boolean;
  network: AffiliateNetwork;
  displayName: string;
  homepageLink: string;
  deepLinkBuilder: ((params: DeepLinkParams) => string | null) | null;
  locales: string[];
  advertiserId?: string;
  partnerId?: string;
  marker?: string;
  commissionRate?: string;
  cookieDays?: number;
  notes?: string;
};

const GYG_CITY_IDS: Record<string, string> = {
  istanbul: 'istanbul-l71',
  paris: 'paris-l16',
  rome: 'rome-l33',
  barcelona: 'barcelona-l45',
  berlin: 'berlin-l17',
  dubai: 'dubai-l816',
  tokyo: 'tokyo-l193',
  london: 'london-l57',
};

export const AFFILIATES: Record<string, AffiliateChannel> = {
  getYourGuide: {
    enabled: true,
    network: 'Direct',
    displayName: 'GetYourGuide',
    homepageLink: 'https://www.getyourguide.com/?partner_id=FKADAF3',
    deepLinkBuilder: (params) => {
      if (!params.city) return null;
      const cityKey = params.city.toLowerCase();
      const cityPath = GYG_CITY_IDS[cityKey];
      if (!cityPath) return null;
      const surface = params.surface || 'unknown';
      const dest = cityKey;
      return `https://www.getyourguide.com/${cityPath}/?partner_id=FKADAF3&cmp=${surface}_${dest}`;
    },
    locales: [],
    partnerId: 'FKADAF3',
    commissionRate: '~8%',
    cookieDays: 31,
    notes: 'SEPA payment config escalated (Sanja, ticket 20506720). City IDs unverified — deploy test needed.',
  },

  safetyWing: {
    enabled: false,
    network: 'Direct',
    displayName: 'SafetyWing',
    homepageLink: 'https://safetywing.com/?referenceID=26574648&utm_source=26574648&utm_medium=Ambassador',
    deepLinkBuilder: null,
    locales: [],
    commissionRate: '10%',
    notes: 'Travel insurance. UI integration in Deliverable 1.4.',
  },

  breezeEsim: {
    enabled: false,
    network: 'Direct',
    displayName: 'Breeze eSIM',
    homepageLink: 'https://www.breezesim.com/?sca_ref=10856377.PkjRGu7WRR',
    deepLinkBuilder: null,
    locales: [],
    commissionRate: '20%',
    notes: 'Kept over Airalo. Country deep link format unverified.',
  },

  discoverCars: {
    enabled: false,
    network: 'Direct',
    displayName: 'DiscoverCars',
    homepageLink: 'https://www.discovercars.com/?a_aid=xotiji',
    deepLinkBuilder: (params) => {
      const surface = params.surface || 'unknown';
      const dest = params.destination || params.city || 'unknown';
      return `https://www.discovercars.com/?a_aid=xotiji&chan=${surface}_${dest.toLowerCase()}`;
    },
    locales: [],
    commissionRate: '70% base',
    cookieDays: 365,
    notes: '80% bonus tier pending (Ilina OOO until Aug 20). No deep link support per platform.',
  },

  bookingBR: {
    enabled: true,
    network: 'CJ',
    displayName: 'Booking.com',
    homepageLink: 'https://www.tkqlhce.com/click-101850450-17288448',
    deepLinkBuilder: null,
    locales: ['pt-BR'],
    advertiserId: '7854073',
    commissionRate: '~4% stays',
    notes: 'PT-BR users only. pt-PT is under Spain&Portugal program (pending).',
  },

  bookingLATAM: {
    enabled: true,
    network: 'CJ',
    displayName: 'Booking.com',
    homepageLink: 'https://www.jdoqocy.com/click-101850450-17288992',
    deepLinkBuilder: null,
    locales: [
      'es-MX', 'es-AR', 'es-CO', 'es-CL', 'es-PE', 'es-VE',
      'es-EC', 'es-BO', 'es-PY', 'es-UY', 'es-DO', 'es-CR',
      'es-GT', 'es-HN', 'es-NI', 'es-PA', 'es-SV',
    ],
    advertiserId: '7864342',
    commissionRate: '~4% stays',
    notes: 'ES-LatAm users. es-ES excluded (Spain&Portugal program pending).',
  },

  bookingAPAC: {
    enabled: false,
    network: 'CJ',
    displayName: 'Booking.com',
    homepageLink: '',
    deepLinkBuilder: null,
    locales: ['en-SG', 'en-HK', 'en-PH', 'en-MY', 'en-TH', 'en-ID', 'en-VN'],
    notes: 'Pending CJ approval.',
  },

  bookingAustralia: {
    enabled: false,
    network: 'CJ',
    displayName: 'Booking.com',
    homepageLink: '',
    deepLinkBuilder: null,
    locales: ['en-AU', 'en-NZ'],
    notes: 'Pending CJ approval.',
  },

  bookingBENELUX: {
    enabled: false,
    network: 'CJ',
    displayName: 'Booking.com',
    homepageLink: '',
    deepLinkBuilder: null,
    locales: ['nl-NL', 'nl-BE', 'fr-BE'],
    notes: 'Pending CJ approval.',
  },

  bookingCEE: {
    enabled: false,
    network: 'CJ',
    displayName: 'Booking.com',
    homepageLink: '',
    deepLinkBuilder: null,
    locales: ['pl-PL', 'cs-CZ', 'sk-SK', 'hu-HU', 'ro-RO', 'bg-BG'],
    notes: 'Pending CJ approval.',
  },

  bookingDACH: {
    enabled: false,
    network: 'CJ',
    displayName: 'Booking.com',
    homepageLink: '',
    deepLinkBuilder: null,
    locales: ['de-DE', 'de-AT', 'de-CH'],
    notes: 'Pending CJ approval.',
  },

  bookingFrance: {
    enabled: false,
    network: 'CJ',
    displayName: 'Booking.com',
    homepageLink: '',
    deepLinkBuilder: null,
    locales: ['fr-FR'],
    notes: 'Pending CJ approval.',
  },

  bookingItaly: {
    enabled: false,
    network: 'CJ',
    displayName: 'Booking.com',
    homepageLink: '',
    deepLinkBuilder: null,
    locales: ['it-IT'],
    notes: 'Pending CJ approval.',
  },

  bookingMEA: {
    enabled: false,
    network: 'CJ',
    displayName: 'Booking.com',
    homepageLink: '',
    deepLinkBuilder: null,
    locales: ['ar-SA', 'ar-AE', 'ar-EG', 'ar-KW', 'ar-QA', 'ar-BH', 'ar-OM'],
    notes: 'Pending CJ approval.',
  },

  bookingNorthAmerica: {
    enabled: false,
    network: 'CJ',
    displayName: 'Booking.com',
    homepageLink: '',
    deepLinkBuilder: null,
    locales: ['en-US', 'en-CA', 'fr-CA'],
    notes: 'Pending CJ approval.',
  },

  bookingSpainPortugal: {
    enabled: false,
    network: 'CJ',
    displayName: 'Booking.com',
    homepageLink: '',
    deepLinkBuilder: null,
    locales: ['es-ES', 'pt-PT'],
    notes: 'Pending CJ approval. Expected 2-14 days. Week 4 checkpoint for es-ES fallback.',
  },

  bookingUK: {
    enabled: false,
    network: 'CJ',
    displayName: 'Booking.com',
    homepageLink: '',
    deepLinkBuilder: null,
    locales: ['en-GB', 'en-IE'],
    notes: 'Pending CJ approval. Selective market.',
  },

  aviasales: {
    enabled: false,
    network: 'Travelpayouts',
    displayName: 'Aviasales',
    homepageLink: 'https://aviasales.tpx.li/wUELJcyH',
    deepLinkBuilder: null,
    locales: [],
    marker: '561828',
    commissionRate: '40%',
    notes: 'Replaces Kiwi.com. Deliverable 1.3 tp.media wrapper.',
  },

  klook: {
    enabled: false,
    network: 'Travelpayouts',
    displayName: 'Klook',
    homepageLink: 'https://klook.tpx.li/1jnbuhqE',
    deepLinkBuilder: null,
    locales: [],
    commissionRate: '2-5%',
    notes: 'Activities focus (Asia-heavy).',
  },

  welcomePickups: {
    enabled: false,
    network: 'Travelpayouts',
    displayName: 'Welcome Pickups',
    homepageLink: 'https://tpx.li/yZiTB7Fw',
    deepLinkBuilder: null,
    locales: [],
    commissionRate: '8-9%',
    notes: 'Airport transfer. Deliverable 1.4.',
  },

  radicalStorage: {
    enabled: false,
    network: 'Travelpayouts',
    displayName: 'Radical Storage',
    homepageLink: 'https://radicalstorage.tpx.li/PU6PL52z',
    deepLinkBuilder: null,
    locales: [],
    commissionRate: '8%',
    notes: 'Luggage storage.',
  },

  airHelp: {
    enabled: false,
    network: 'Travelpayouts',
    displayName: 'AirHelp',
    homepageLink: 'https://airhelp.tpx.li/bcGRwYRZ',
    deepLinkBuilder: null,
    locales: [],
    commissionRate: '15-16%',
    notes: 'Post-flight compensation. v1.1 email flow.',
  },

  iVisa: {
    enabled: false,
    network: 'Direct',
    displayName: 'iVisa',
    homepageLink: '',
    deepLinkBuilder: null,
    locales: [],
    commissionRate: '20%',
    cookieDays: 365,
    notes: 'Pending review. First-click attribution.',
  },
};

export function getAffiliateUrl(
  channelKey: string,
  params: DeepLinkParams = {}
): string | null {
  const channel = AFFILIATES[channelKey];
  if (!channel || !channel.enabled) return null;

  if (channel.deepLinkBuilder) {
    const deepLink = channel.deepLinkBuilder(params);
    if (deepLink) return deepLink;
  }

  return channel.homepageLink || null;
}

export function shouldShowChannel(channelKey: string, userLocale: string): boolean {
  const channel = AFFILIATES[channelKey];
  if (!channel || !channel.enabled) return false;
  if (channel.locales.length === 0) return true;

  const normalizedLocale = userLocale.toLowerCase();
  return channel.locales.some((loc) => {
    const normalizedLoc = loc.toLowerCase();
    if (normalizedLoc === normalizedLocale) return true;
    const primaryLang = normalizedLocale.split('-')[0];
    const locPrimary = normalizedLoc.split('-')[0];
    if (locPrimary === primaryLang && normalizedLoc === locPrimary) return true;
    return false;
  });
}

export function trackAffiliateClick(params: {
  partner: string;
  region: string | null;
  surface: string;
  destinationId?: string | number;
  destinationName?: string;
}): void {
  if (typeof window === 'undefined') return;
  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
  if (typeof gtag !== 'function') return;

  gtag('event', 'affiliate_click', {
    partner: params.partner,
    region: params.region || 'global',
    surface: params.surface,
    destination_id: params.destinationId ? String(params.destinationId) : undefined,
    destination_name: params.destinationName || undefined,
  });
}
