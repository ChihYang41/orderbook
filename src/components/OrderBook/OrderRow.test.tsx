/// <reference types="@testing-library/jest-dom" />
import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import OrderRow from '@/components/OrderBook/OrderRow';

describe('OrderRow', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      vi.runOnlyPendingTimers();
    });
    vi.useRealTimers();
  });

  const baseProps = {
    price: 30_000,
    size: 2,
    cumulative: 5,
    progressPercent: 50,
    baseTextColor: 'text-[#00b15d]',
    backgroundColor: 'rgba(16, 186, 104, 0.12)',
    side: 'bid' as const,
  };

  it('applies bid highlight animation for new rows and clears after timeout', () => {
    render(
      <table>
        <tbody>
          <OrderRow {...baseProps} isNew />
        </tbody>
      </table>
    );

    const row = screen.getAllByRole('row')[0];
    expect(row).toHaveClass('animate-flash-green');

    act(() => {
      vi.advanceTimersByTime(501);
    });

    expect(row).not.toHaveClass('animate-flash-green');
  });

  it('applies ask highlight animation when rendered as new', () => {
    render(
      <table>
        <tbody>
          <OrderRow
            {...baseProps}
            side="ask"
            baseTextColor="text-[#FF5B5A]"
            backgroundColor="rgba(255, 90, 90, 0.12)"
            isNew
          />
        </tbody>
      </table>
    );

    const row = screen.getAllByRole('row')[0];
    expect(row).toHaveClass('animate-flash-red');
  });

  it('highlights size cell on size increase and clears after timeout', () => {
    render(
      <table>
        <tbody>
          <OrderRow {...baseProps} sizeChange="increase" />
        </tbody>
      </table>
    );

    const cells = screen.getAllByRole('cell');
    const sizeCell = cells[1];
    expect(sizeCell).toHaveClass('animate-flash-green');

    act(() => {
      vi.advanceTimersByTime(501);
    });

    expect(sizeCell).not.toHaveClass('animate-flash-green');
  });
});
