import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import useLastPrice from '@/components/OrderBook/hooks/useLastPrice';
import useWebSocket from '@/hooks/useWebsocket';

type TradeMessage = {
  data: {
    price: number;
    side: 'BUY' | 'SELL';
  }[];
};

type TradeHandler = (message: TradeMessage) => void;

vi.mock('@/hooks/useWebsocket');

const mockedUseWebSocket = vi.mocked(useWebSocket);

describe('useLastPrice', () => {
  beforeEach(() => {
    mockedUseWebSocket.mockReset();
  });

  it('subscribes to the correct topic and tracks price direction', () => {
    const handlers: TradeHandler[] = [];
    mockedUseWebSocket.mockImplementation((_url, _topic, handler) => {
      handlers.push(handler as TradeHandler);
      return { isConnected: true, resubscribe: vi.fn() };
    });

    const { result } = renderHook(() => useLastPrice('BTCPFC'));

    expect(mockedUseWebSocket).toHaveBeenCalledWith(
      'wss://ws.btse.com/ws/futures',
      'tradeHistoryApi:BTCPFC',
      expect.any(Function)
    );

    const emit = handlers[0];
    if (!emit) throw new Error('Missing trade handler');

    act(() => {
      emit({ data: [{ price: 50_000, side: 'BUY' }] });
    });
    expect(result.current.lastPrice).toBe(50_000);
    expect(result.current.direction).toBe('neutral');

    act(() => {
      emit({ data: [{ price: 50_100, side: 'SELL' }] });
    });
    expect(result.current.lastPrice).toBe(50_100);
    expect(result.current.direction).toBe('up');

    act(() => {
      emit({ data: [{ price: 50_090, side: 'SELL' }] });
    });
    expect(result.current.direction).toBe('down');

    act(() => {
      emit({ data: [{ price: 50_090, side: 'BUY' }] });
    });
    expect(result.current.direction).toBe('neutral');
  });
});
