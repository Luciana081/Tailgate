import { Game, OddsMarket, OddsOutcome } from './types';

export type PickOption = {
  id: string;
  label: string;
  prediction: string;
  market: string;
  bookmaker?: string;
};

export function formatPrice(price?: number) {
  if (typeof price !== 'number') {
    return '';
  }

  return price > 0 ? `+${price}` : `${price}`;
}

export function formatPoint(point?: number) {
  if (typeof point !== 'number') {
    return '';
  }

  return `${point > 0 ? '+' : ''}${point}`;
}

export function formatDateTime(value?: string) {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return `${date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'America/New_York',
  })}, ${date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/New_York',
  })} ET`;
}

export function getMarketTitle(marketKey: string) {
  if (marketKey === 'h2h') return 'Moneyline';
  if (marketKey === 'spreads') return 'Spread';
  if (marketKey === 'totals') return 'Total';
  return marketKey.toUpperCase();
}

export function formatOutcome(market: OddsMarket, outcome: OddsOutcome) {
  const point = formatPoint(outcome.point);
  const price = formatPrice(outcome.price);
  return [outcome.name, point, price].filter(Boolean).join(' ');
}

export function getPickOptions(game: Game): PickOption[] {
  const bookmaker = game.bookmakers?.[0];

  if (!bookmaker?.markets?.length) {
    return [];
  }

  return bookmaker.markets.flatMap((market) =>
    market.outcomes.map((outcome) => {
      const marketTitle = getMarketTitle(market.key);
      const prediction = formatOutcome(market, outcome);

      return {
        id: `${bookmaker.key}-${market.key}-${outcome.name}-${outcome.point ?? 'na'}`,
        label: `${marketTitle}: ${prediction}`,
        prediction,
        market: marketTitle,
        bookmaker: bookmaker.title,
      };
    }),
  );
}
