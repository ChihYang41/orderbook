import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import useOrderBook from '@/components/OrderBook/hooks/useOrderBook';
import useWebSocket from '@/hooks/useWebsocket';

type MessageHandler = (message: { data: unknown }) => void;

type MockedReturn = {
  isConnected: boolean;
  resubscribe: () => void;
};

vi.mock('@/hooks/useWebsocket');

const mockedUseWebSocket = vi.mocked(useWebSocket);

describe('useOrderBook', () => {
  const resubscribe = vi.fn();
  let handlers: MessageHandler[];

  beforeEach(() => {
    handlers = [];
    resubscribe.mockReset();
    mockedUseWebSocket.mockReset();
    mockedUseWebSocket.mockImplementation((_url, _topic, handler) => {
      handlers.push(handler as MessageHandler);
      return { isConnected: true, resubscribe } satisfies MockedReturn;
    });
  });

  const emit = (message: Parameters<MessageHandler>[0]) => {
    const handler = handlers.at(-1);
    if (!handler) throw new Error('No message handler registered');
    act(() => {
      handler(message);
    });
  };

  it('stores snapshot data and enforces level cap', () => {
    const { result } = renderHook(() => useOrderBook('BTCPFC'));

    emit({
      data: {
        type: 'snapshot',
        seqNum: 10,
        bids: Array.from({ length: 10 }, (_, index) => {
          const price = (110 - index).toString();
          const size = (index + 1).toString();
          return [price, size] as [string, string];
        }),
        asks: [
          ['200', '1'],
          ['201', '2'],
        ],
      },
    });

    const { bids, asks } = result.current.orderBook;
    expect(bids).toHaveLength(8);
    expect(bids[0].price).toBe(110);
    expect(bids.at(-1)?.price).toBe(103);
    expect(asks).toHaveLength(2);
    expect(asks[0].price).toBe(201);
  });

  it('applies delta updates after snapshot', () => {
    const { result } = renderHook(() => useOrderBook('BTCPFC'));

    emit({
      data: {
        type: 'snapshot',
        seqNum: 1,
        bids: [
          ['100', '1'],
          ['99', '1'],
        ],
        asks: [
          ['101', '1'],
          ['102', '1'],
        ],
      },
    });

    emit({
      data: {
        type: 'delta',
        seqNum: 2,
        prevSeqNum: 1,
        bids: [
          ['100', '2'],
          ['98', '1'],
        ],
        asks: [
          ['101', '0'],
          ['103', '3'],
        ],
      },
    });

    const { bids, asks } = result.current.orderBook;
    expect(bids.map(({ price }) => price)).toEqual([100, 99, 98]);
    expect(bids[0].sizeChange).toBe('increase');
    expect(asks.map(({ price }) => price)).toEqual([103, 102]);
    expect(asks[0].isNew).toBe(true);
  });

  it('resubscribes when delta arrives out of order', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { result } = renderHook(() => useOrderBook('BTCPFC'));

    emit({
      data: {
        type: 'snapshot',
        seqNum: 5,
        bids: [
          ['100', '1'],
        ],
        asks: [
          ['101', '1'],
        ],
      },
    });

    emit({
      data: {
        type: 'delta',
        seqNum: 6,
        prevSeqNum: 99,
        bids: [
          ['100', '2'],
        ],
        asks: [],
      },
    });

    expect(resubscribe).toHaveBeenCalledTimes(1);
    expect(result.current.orderBook).toEqual({ bids: [], asks: [] });
    expect(warnSpy).toHaveBeenCalledWith(
      'Out of order update received. Resubscribing...'
    );
    warnSpy.mockRestore();
  });
});
