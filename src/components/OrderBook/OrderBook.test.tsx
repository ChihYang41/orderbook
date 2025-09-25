/// <reference types="@testing-library/jest-dom" />
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import OrderBook from '@/components/OrderBook/OrderBook';
import useOrderBook from '@/components/OrderBook/hooks/useOrderBook';

vi.mock('@/components/OrderBook/hooks/useOrderBook');
vi.mock('@/components/OrderBook/QuoteTable', () => ({
  default: ({ side, orders }: { side: 'bid' | 'ask'; orders: unknown[] }) => (
    <div data-testid={`${side}-table`}>rows:{orders.length}</div>
  ),
}));
vi.mock('@/components/OrderBook/LatestPrice', () => ({
  default: () => <div data-testid="latest-price" />,
}));

const mockedUseOrderBook = vi.mocked(useOrderBook);

describe('OrderBook component', () => {
  beforeEach(() => {
    mockedUseOrderBook.mockReset();
  });

  it('shows empty state when there are no orders', () => {
    mockedUseOrderBook.mockReturnValue({ orderBook: { bids: [], asks: [] } });

    render(<OrderBook />);

    expect(screen.getAllByText('No Data Available')).toHaveLength(2);
    expect(screen.queryByTestId('latest-price')).not.toBeInTheDocument();
  });

  it('renders quote tables and price when data is present', () => {
    mockedUseOrderBook.mockReturnValue({
      orderBook: {
        asks: [
          { price: 101, size: 1, cumulative: 1, cumulativePercentage: 50 },
        ],
        bids: [
          { price: 100, size: 1, cumulative: 1, cumulativePercentage: 50 },
        ],
      },
    });

    render(<OrderBook />);

    expect(screen.getByTestId('ask-table')).toHaveTextContent('rows:1');
    expect(screen.getByTestId('bid-table')).toHaveTextContent('rows:1');
    expect(screen.getByTestId('latest-price')).toBeInTheDocument();
  });
});
