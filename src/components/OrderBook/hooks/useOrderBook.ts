import { useCallback, useEffect, useRef, useState } from 'react';
import useWebSocket from '@/hooks/useWebsocket';
import { calculateCumulative } from '@/components/OrderBook/hooks/utils';
import type { Order, OrderSide } from '@/components/OrderBook/types';

type OrderBook = {
  bids: Order[];
  asks: Order[];
};

type SnapshotData = {
  type: 'snapshot';
  seqNum: number;
  bids: [string, string][];
  asks: [string, string][];
};

type DeltaData = {
  type: 'delta';
  seqNum: number;
  prevSeqNum: number;
  bids: [string, string][];
  asks: [string, string][];
};

type WebSocketMessage = {
  data: SnapshotData | DeltaData;
};

type OrderMetadata = {
  isNew?: boolean;
  sizeChange?: 'increase' | 'decrease';
};

type OrderLevelUpdate = [string, string];

type NumericOrderLevel = [number, number];

const EMPTY_ORDER_BOOK: OrderBook = { bids: [], asks: [] };

export const toNumericLevel = ([price, size]: OrderLevelUpdate): NumericOrderLevel | null => {
  const priceValue = Number(price);
  const sizeValue = Number(size);
  if (!Number.isFinite(priceValue) || !Number.isFinite(sizeValue)) {
    return null;
  }
  return [priceValue, sizeValue];
};

export const buildSnapshotSide = (levels: OrderLevelUpdate[], side: OrderSide) => {
  const numericLevels = levels.reduce<NumericOrderLevel[]>((acc, level) => {
    const numeric = toNumericLevel(level);
    if (numeric) acc.push(numeric);
    return acc;
  }, []);
  return calculateCumulative(numericLevels, side === 'bid');
};

export const applySnapshot = (snapshot: SnapshotData): OrderBook => ({
  bids: buildSnapshotSide(snapshot.bids, 'bid'),
  asks: buildSnapshotSide(snapshot.asks, 'ask'),
});

export const applySideDelta = (
  current: Order[],
  updates: OrderLevelUpdate[],
  side: OrderSide
): Order[] => {
  if (!updates.length) {
    return current;
  }

  const isBids = side === 'bid';
  const orderMap = new Map<number, number>(
    current.map(({ price, size }) => [price, size])
  );
  const metadata = new Map<number, OrderMetadata>();

  updates.forEach(([priceRaw, sizeRaw]) => {
    const priceValue = Number(priceRaw);
    if (!Number.isFinite(priceValue)) {
      return;
    }

    if (sizeRaw === '0') {
      orderMap.delete(priceValue);
      metadata.delete(priceValue);
      return;
    }

    const sizeValue = Number(sizeRaw);
    if (!Number.isFinite(sizeValue)) {
      return;
    }

    const previousSize = orderMap.get(priceValue);
    orderMap.set(priceValue, sizeValue);

    if (previousSize === undefined) {
      metadata.set(priceValue, { isNew: true });
      return;
    }

    if (sizeValue > previousSize) {
      metadata.set(priceValue, { sizeChange: 'increase' });
    } else if (sizeValue < previousSize) {
      metadata.set(priceValue, { sizeChange: 'decrease' });
    }
  });

  return calculateCumulative(Array.from(orderMap.entries()), isBids, metadata);
};

export const applyDelta = (state: OrderBook, delta: DeltaData): OrderBook => ({
  bids: applySideDelta(state.bids, delta.bids, 'bid'),
  asks: applySideDelta(state.asks, delta.asks, 'ask'),
});

const useOrderBook = (symbol: string) => {
  const [orderBook, setOrderBook] = useState<OrderBook>(EMPTY_ORDER_BOOK);
  const seqNumRef = useRef<number | null>(null);
  const resubscribeRef = useRef<() => void>(() => {});

  const handleMessage = useCallback(
    ({ data }: WebSocketMessage) => {
      if (!data) return;

      if (data.type === 'snapshot') {
        setOrderBook(applySnapshot(data));
        seqNumRef.current = data.seqNum;
        return;
      }

      if (data.type === 'delta') {
        const lastSeq = seqNumRef.current;
        if (typeof lastSeq === 'number' && data.prevSeqNum !== lastSeq) {
          console.warn('Out of order update received. Resubscribing...');
          setOrderBook({ bids: [], asks: [] });
          seqNumRef.current = null;
          resubscribeRef.current();
          return;
        }

        setOrderBook((prev) => applyDelta(prev, data));
        seqNumRef.current = data.seqNum;
      }
    },
    []
  );

  const { resubscribe } = useWebSocket<WebSocketMessage>(
    `wss://ws.btse.com/ws/oss/futures`,
    `update:${symbol}`,
    handleMessage
  );

  useEffect(() => {
    resubscribeRef.current = resubscribe;
  }, [resubscribe]);

  return { orderBook };
};

export default useOrderBook;
