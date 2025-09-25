/// <reference types="@testing-library/jest-dom" />
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import QuoteTable from '@/components/OrderBook/QuoteTable';

const sampleOrders = [
  {
    price: 101,
    size: 2,
    cumulative: 2,
    cumulativePercentage: 50,
  },
  {
    price: 100,
    size: 3,
    cumulative: 5,
    cumulativePercentage: 100,
  },
];

describe('QuoteTable', () => {
  it('renders header when requested and displays formatted order data', () => {
    render(<QuoteTable orders={sampleOrders} side="bid" showHeader />);

    expect(screen.getByText('Price (USD)')).toBeInTheDocument();

    const rows = screen.getAllByRole('row');
    const firstDataRow = rows[1];
    const cells = within(firstDataRow).getAllByRole('cell');
    expect(cells[0]).toHaveTextContent('101');
    expect(cells[1]).toHaveTextContent('2');
    expect(cells[2]).toHaveTextContent('2');

    const totalCell = cells[2];
    const progressBar = totalCell.querySelector('div');
    expect(progressBar).toHaveStyle({ width: '50%' });
  });

  it('renders ask side styles without header when disabled', () => {
    render(<QuoteTable orders={sampleOrders} side="ask" />);

    expect(screen.queryByText('Price (USD)')).not.toBeInTheDocument();

    const row = screen.getAllByRole('row')[0];
    expect(row).toHaveClass('text-[#FF5B5A]');
  });
});
