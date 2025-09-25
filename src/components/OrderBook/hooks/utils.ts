import type { Order } from '@/components/OrderBook/types';

const MAX_QUOTES = 8;

type OrderMetadata = {
  isNew?: boolean;
  sizeChange?: 'increase' | 'decrease';
};

type CalculateCumulative = (
  orders: Array<[number, number]>,
  isBids: boolean,
  metadata?: Map<number, OrderMetadata>
) => Order[];

export const calculateCumulative: CalculateCumulative = (orders, isBids, metadata) => {
  // Sort and limit orders
  const sortedOrders = orders
    .sort((a, b) => (isBids ? b[0] - a[0] : a[0] - b[0]))
    .slice(0, MAX_QUOTES);
  // Calculate running totals
  const total = sortedOrders.reduce((sum, [, size]) => sum + size, 0);
  let cumulative = 0;
  // Map to final format
  const result = sortedOrders.map(([price, size]) => {
    const nextCumulative = cumulative + size;
    cumulative = nextCumulative;
    const meta = metadata?.get(price) ?? {};
    return {
      price,
      size,
      cumulative: nextCumulative,
      cumulativePercentage: total ? (nextCumulative / total) * 100 : 0,
      ...meta,
    } satisfies Order;
  });
  return isBids ? result : result.reverse();
};
