/// <reference types="@testing-library/jest-dom" />
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LatestPrice from '@/components/OrderBook/LatestPrice';
import useLastPrice from '@/components/OrderBook/hooks/useLastPrice';

vi.mock('@/components/OrderBook/hooks/useLastPrice');

const mockedUseLastPrice = vi.mocked(useLastPrice);

describe('LatestPrice', () => {
  beforeEach(() => {
    mockedUseLastPrice.mockReset();
  });

  it('renders dash when price is unavailable', () => {
    mockedUseLastPrice.mockReturnValue({ lastPrice: null, direction: 'neutral' });

    render(<LatestPrice />);

    expect(screen.getByText('-')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('shows price, styling, and arrow when direction is up', () => {
    mockedUseLastPrice.mockReturnValue({ lastPrice: 50_000, direction: 'up' });

    const { container } = render(<LatestPrice />);

    expect(screen.getByText('50,000')).toBeInTheDocument();
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('text-[#00b15d]');
    expect(screen.getByRole('presentation')).toBeInTheDocument();
  });

  it('renders downward arrow with sell styling', () => {
    mockedUseLastPrice.mockReturnValue({ lastPrice: 49_000, direction: 'down' });

    const { container } = render(<LatestPrice />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('text-[#FF5B5A]');
    expect(screen.getByRole('presentation')).toBeInTheDocument();
  });
});
